## Context

Ray's Notes 是一個自 2018 年運營的個人技術部落格，目前使用 Hexo 3.9.0 + NexT 7.0.1 主題，部署於 GitHub Pages。現有 repo 僅含編譯後的靜態檔案（97 個 HTML 頁面），無法直接維護。原始 Markdown 檔案保留在本機。

本次重建將整個技術棧替換為 Astro 4.x，採用極簡文字風格，並補足留言、搜尋、深色模式等功能。團隊由 PM（Claude）、工程師、Code Reviewer、QC（均為 Teammate Agent）和 Key User（Ray）組成。

## Goals / Non-Goals

**Goals:**

- 使用 Astro 4.x + Tailwind CSS + TypeScript 重建完整部落格
- 遷移全部 30 篇文章，保持 URL 結構不變（SEO 不中斷）
- 實現極簡閱讀體驗（襯線字體、680px 寬度、大量留白）
- 整合 Giscus 留言、Pagefind 搜尋、深色模式、RSS、SEO
- 建立 GitHub Actions CI/CD pipeline 與品質檢核流程
- Lighthouse 四項指標 ≥ 90

**Non-Goals:**

- 不做多語言支援
- 不做 SSR / 動態後端功能
- 不遷移舊 Gitment 留言資料
- 不做使用者註冊 / 登入系統
- 不做文章編輯 CMS 介面

## Decisions

### 1. SSG 框架選擇：Astro 4.x

**選擇原因**：Astro 專為內容網站設計，零 JS 預設產出最小 bundle，Content Collections 提供型別安全的內容管理，Island Architecture 只在需要時載入互動元件。

**替代方案**：
- Next.js (Static Export)：React 生態成熟但對純部落格過重，bundle 較大
- Eleventy (11ty)：極輕量但元件化能力弱，互動功能需手刻 JS

### 2. 互動元件策略：React Island

**選擇原因**：僅搜尋對話框（SearchDialog）和深色切換（ThemeToggle）需要客戶端互動。使用 React Island + `client:visible`/`client:idle` 按需載入，其餘全為零 JS 的 .astro 元件。

**替代方案**：
- 原生 JS：更輕量但缺乏元件化，維護成本高
- Svelte Island：bundle 更小但團隊較不熟悉

### 3. 搜尋方案：Pagefind

**選擇原因**：編譯時產生索引，零後端依賴，索引檔通常 < 100KB，支援中文分詞（`--force-language zh-TW`），與靜態部署完美搭配。

**替代方案**：
- Algolia：功能強大但需外部服務、有免費額度限制
- FlexSearch：需手動建索引，中文支援需額外設定

### 4. 留言系統：Giscus

**選擇原因**：基於 GitHub Discussions，無需額外後端或資料庫，訪客用 GitHub 帳號留言，自動支援 Markdown 格式，可跟隨深色模式切換。

**替代方案**：
- Utterances：基於 Issues 但功能較少
- Disqus：第三方服務、載入慢、有廣告

### 5. 樣式方案：Tailwind CSS + CSS Custom Properties

**選擇原因**：Tailwind 的 utility-first 方式適合快速開發極簡風格，`dark:` variant 原生支援深色模式。色彩定義為 CSS custom properties，方便主題切換。

**替代方案**：
- 手寫 CSS：完全自由但開發速度慢
- CSS Modules：作用域隔離好但與 Astro 元件的整合不如 Tailwind 自然

### 6. 目錄結構

```
src/
├── content/blog/          # 30 篇 Markdown 文章
├── layouts/
│   ├── BaseLayout.astro   # 全站共用（head、nav、footer）
│   └── PostLayout.astro   # 文章頁（標題、日期、標籤、Giscus）
├── pages/
│   ├── index.astro        # 首頁
│   ├── about.astro        # 關於
│   ├── archives.astro     # 歸檔
│   ├── categories/[category].astro
│   ├── tags/[tag].astro
│   └── rss.xml.ts         # RSS
├── components/
│   ├── Header.astro       # 導覽列
│   ├── Footer.astro       # 頁尾
│   ├── PostCard.astro     # 文章卡片
│   ├── SearchDialog.tsx   # 搜尋（React Island）
│   ├── ThemeToggle.tsx    # 深色切換（React Island）
│   └── Giscus.astro       # 留言
├── utils/                 # 工具函式
├── styles/global.css      # 全域樣式
└── consts.ts              # 共用常數
```

### 7. URL 結構保持一致

舊站 URL 格式：`/YYYY/MM/DD/slug/`。Astro 透過 `getStaticPaths` + Content Collections 的 slug 欄位產生對應路由，確保 SEO 延續。

### 8. CI/CD Pipeline

```
push → install (pnpm) → lint (ESLint) → format:check (Prettier)
     → tsc (TypeScript) → build (Astro) → test (Vitest + Playwright)
     → deploy (GitHub Pages)
```

僅 master 分支觸發部署，feature/* 分支僅跑 CI 檢查。

## Risks / Trade-offs

| 風險 | 緩解措施 |
|------|----------|
| Hexo frontmatter 格式與 Astro 不完全相容 | 撰寫遷移腳本自動轉換，逐篇人工驗證 |
| URL 結構改變導致 SEO 排名下降 | 嚴格保持 `/YYYY/MM/DD/slug/` 格式，設定 canonical URL |
| Pagefind 中文分詞品質 | 使用 `--force-language zh-TW` 並實測搜尋結果 |
| React Island 增加 bundle 大小 | 僅 2 個 Island，使用 client:visible 延遲載入，監控 JS ≤ 50KB |
| Giscus 需要訪客有 GitHub 帳號 | 目標讀者為技術人員，GitHub 帳號普及率高，可接受 |
| 舊站 Gitment 留言資料遺失 | 已確認可接受，留言量少 |

## Migration Plan

1. **Phase 1 — 專案建置**：初始化 Astro 專案、設定 Tailwind/TypeScript/ESLint/Prettier
2. **Phase 2 — 佈局與元件**：建立 BaseLayout、PostLayout、Header、Footer、導覽列
3. **Phase 3 — 內容遷移**：轉換 30 篇 Markdown、驗證 frontmatter schema、圖片搬移
4. **Phase 4 — 頁面路由**：首頁、分類頁、標籤頁、歸檔頁、關於頁
5. **Phase 5 — 功能整合**：Giscus 留言、Pagefind 搜尋、深色模式、RSS、SEO
6. **Phase 6 — CI/CD**：GitHub Actions workflow、自動部署設定
7. **Phase 7 — 測試與品質**：E2E 測試、Lighthouse 驗證、連結檢查、視覺回歸

**回滾策略**：master 分支的舊靜態檔案在新版上線前以 tag 保存，如有問題可用舊 commit SHA 重新部署。

## Open Questions

1. Google Analytics 是否從 UA（Universal Analytics，已停服）升級至 GA4？
2. 是否需要保留 /schedule/ 頁面？（舊站有此頁面但內容不明確）
3. OG 圖片是否需要自動從文章標題產生，還是使用統一預設圖片？
