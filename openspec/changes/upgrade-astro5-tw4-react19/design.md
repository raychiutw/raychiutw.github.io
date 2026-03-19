## Context

專案目前運行於 Astro 4.16 + Tailwind CSS 3.4 + React 18.3 技術棧。三套框架皆已發佈新主版本（Astro 5、Tailwind CSS 4、React 19），Dependabot 已自動開出 PR #37-#42 但因各套件需一起升級而被關閉。專案架構健康，未使用已廢棄 API，適合一次到位升級。

現有架構：

- 靜態網站（output: 'static'），部署至 GitHub Pages
- 2 個 React Island 元件（SearchDialog、ThemeToggle），皆用 client:idle
- 40+ 篇 Markdown 部落格文章，使用 Content Collections API
- Tailwind CSS 透過 @astrojs/tailwind 整合，JS config 設定
- CI/CD 由 GitHub Actions 驅動

## Goals / Non-Goals

**Goals:**

- 將 Astro 升級至 5.x，採用 Content Layer API
- 將 Tailwind CSS 升級至 4.x，遷移至 CSS-based 設定 + @tailwindcss/vite
- 將 React 升級至 19.2.4，同步更新型別定義與測試工具
- 升級所有 @astrojs/\* 整合套件至最新相容版本
- 確保建置、測試、部署流程皆正常運作
- 網站功能與視覺呈現與升級前一致

**Non-Goals:**

- 不重構現有元件架構或頁面結構
- 不新增功能（如 View Transitions、Server Islands 等 Astro 5 新功能）
- 不遷移至 MDX（維持純 Markdown）
- 不升級 Node.js 版本（維持 20 LTS）
- 不變更部署平台或 CI/CD 流程架構

## Decisions

### Decision 1：Content Collections 遷移策略

**選擇：** 遷移至 Astro 5 Content Layer API（glob loader）

**替代方案：** 保留舊 API（Astro 5 仍有向下相容層）

**理由：** 舊 API 僅為過渡支援，未來版本將移除。一次到位避免二次遷移成本。變更範圍明確：

- `src/content/config.ts` → `src/content.config.ts`（移至專案根目錄層級）
- `type: 'content'` → `loader: glob({ pattern: "**/*.md", base: "./src/content/blog" })`
- `slug` 欄位 → `id` 欄位
- `post.render()` → `import { render } from 'astro:content'; render(post)`
- 所有 `getStaticPaths` 中使用 `post.slug` 的地方需改為 `post.id`

### Decision 2：Tailwind CSS 整合方式

**選擇：** 移除 @astrojs/tailwind，改用 @tailwindcss/vite

**替代方案 A：** 升級 @astrojs/tailwind 至 6.x（仍支援 TW3）

**替代方案 B：** 使用 @tailwindcss/postcss

**理由：** @tailwindcss/vite 是 Tailwind 4 官方推薦的 Vite 專案整合方式，Astro 底層為 Vite，此為最自然的選擇。效能優於 PostCSS 方式。

實作步驟：

1. 移除 `@astrojs/tailwind` 與 `tailwindcss` 3.x 依賴
2. 安裝 `@tailwindcss/vite` 與 `tailwindcss` 4.x
3. 在 `astro.config.mjs` 中移除 tailwind() integration，改為 Vite plugin：
   ```js
   import tailwindcss from '@tailwindcss/vite';
   export default defineConfig({
     vite: { plugins: [tailwindcss()] },
     // ...
   });
   ```
4. 刪除 `tailwind.config.mjs`
5. 在 `global.css` 中將 `@tailwind` 指令改為 `@import "tailwindcss"`，並將 config 遷移至 `@theme` 區塊

### Decision 3：Tailwind CSS class 遷移方式

**選擇：** 先跑 `npx @tailwindcss/upgrade` 自動遷移工具，再手動檢查修正

**替代方案：** 全手動搜尋替換

**理由：** 自動遷移工具可處理大部分 renamed utilities（shadow-sm→shadow-xs 等），減少人工遺漏。但需在工具跑完後手動確認：

- CSS custom properties 語法（`bg-[--var]` → `bg-(--var)`）
- `!important` 修飾符位置（`!flex` → `flex!`）
- Border 預設色變更（需補上明確色彩）

### Decision 4：React 升級策略

**選擇：** 升級至 React 19.2.4，同步更新 @types/react、@types/react-dom、@testing-library/react

**理由：** 專案僅有 2 個簡單的 React 元件，使用基本 hooks（useState、useEffect、useRef、useCallback），React 19 對此無 breaking changes。主要注意：

- `@astrojs/react` 需升至 5.x（支援 React 19）
- `@testing-library/react` 需升至支援 React 19 的版本
- `@types/react` 升至 19.x

### Decision 5：升級執行順序

**選擇：** 分階段執行，每階段驗證後再進入下一階段

```
Phase 1: Astro 5 核心升級
  ├── 更新 package.json 依賴
  ├── 遷移 Content Collections
  ├── 更新 tsconfig.json
  └── 驗證：pnpm build 成功

Phase 2: Tailwind CSS 4 遷移
  ├── 執行 @tailwindcss/upgrade 工具
  ├── 手動修正遺漏項目
  ├── 遷移 global.css
  └── 驗證：視覺一致性

Phase 3: React 19 升級
  ├── 更新 React 相關依賴
  ├── 測試 SearchDialog、ThemeToggle
  └── 驗證：互動功能正常

Phase 4: 整合驗證
  ├── pnpm build 完整建置
  ├── pnpm test 單元測試
  ├── pnpm test:e2e E2E 測試
  └── 本地 preview 人工檢查
```

**理由：** 分階段可快速定位問題來源。若某階段失敗，不影響已完成的階段。

## Risks / Trade-offs

- **[Tailwind 4 class 改名遺漏]** → 使用自動遷移工具 + 全域搜尋 renamed utilities checklist 逐項確認
- **[Shiki CSS 變數名變更導致程式碼區塊樣式異常]** → 在 global.css 中搜尋替換 `--astro-code-color-*` → `--astro-code-*`
- **[Content Layer API 的 slug→id 變更影響文章 URL]** → 確認 id 產生邏輯與原 slug 一致，避免 URL 斷裂
- **[Tailwind 4 預設 border 色從 gray-200 改為 currentColor]** → 全域搜尋所有 `border` class，確認是否需補上明確色彩
- **[第三方套件（pagefind、medium-zoom）相容性]** → 這些套件不依賴 Astro/React/Tailwind 版本，風險極低
- **[pnpm-lock.yaml 大幅變動]** → 預期行為，升級後重新產生即可
