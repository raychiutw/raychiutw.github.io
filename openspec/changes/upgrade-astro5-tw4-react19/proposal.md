## Why

專案目前使用 Astro 4.16、Tailwind CSS 3.4、React 18.3，皆已落後主版本。Astro 5 帶來更好的 Content Layer API 與效能改進；Tailwind CSS 4 簡化設定並提升建置速度；React 19 改善 hydration 效能。三者一次升版可避免反覆處理相依性衝突，且 Dependabot 已自動開出相關 PR（#37-#42），顯示升版時機成熟。

## What Changes

- **BREAKING** 升級 Astro 4.16.19 → 5.x，遷移 Content Collections 至 Content Layer API
- **BREAKING** 升級 Tailwind CSS 3.4 → 4.x，從 JS config 遷移至 CSS-based `@theme` 設定，以 `@tailwindcss/vite` 取代 `@astrojs/tailwind`
- **BREAKING** 升級 React 18.3 → 19.2.4，同步更新 @types/react、@types/react-dom
- 升級所有 @astrojs/\* 整合套件至 Astro 5 相容版本（@astrojs/react 5.x、@astrojs/check 0.9.x、@astrojs/sitemap 3.7.x、@astrojs/rss 最新相容版）
- 升級 @testing-library/react 至支援 React 19 的版本
- 更新 TypeScript 設定以配合 Astro 5 型別系統
- 修正所有 Tailwind CSS 4 renamed utilities（shadow-sm→shadow-xs、rounded-sm→rounded-xs 等）
- 更新 Shiki CSS 變數名稱（--astro-code-color-text → --astro-code-foreground 等）

## Capabilities

### New Capabilities

- `astro5-content-layer`: 遷移至 Astro 5 Content Layer API，包含 config 檔案搬遷、loader 設定、slug→id 欄位變更、render() 匯入方式變更
- `tailwind4-css-config`: 遷移至 Tailwind CSS 4 CSS-based 設定系統，包含 @theme 設定、@tailwindcss/vite 整合、utility class 更名
- `react19-upgrade`: 升級至 React 19，確保 Island 元件（SearchDialog、ThemeToggle）與測試工具相容

### Modified Capabilities

- `astro-project-setup`: Astro 核心版本升級，astro.config.mjs 整合設定變更、tsconfig.json 調整
- `base-layout`: Shiki CSS 變數名稱更新，可能的 script 行為變更
- `dark-mode`: Tailwind 4 dark mode 設定遷移確認
- `search`: SearchDialog React 元件升級至 React 19 相容
- `cicd-pipeline`: CI 建置指令與 Node 版本確認

## Impact

- **核心設定檔**：astro.config.mjs、tsconfig.json、tailwind.config.mjs（移除）、global.css
- **Content Collections**：src/content/config.ts → src/content.config.ts，所有使用 getCollection/render 的頁面
- **樣式**：所有 .astro 檔案中的 Tailwind utility classes（renamed utilities）、global.css 中的 Shiki 變數
- **React 元件**：SearchDialog.tsx、ThemeToggle.tsx、相關測試檔案
- **套件管理**：package.json 大幅更新、pnpm-lock.yaml 重新產生
- **CI/CD**：GitHub Actions workflow 可能需調整 Node 版本需求
- **建置流程**：postbuild pagefind 指令不受影響，但需確認 dist 輸出結構一致
