## Why

現有的 Ray's Notes 部落格使用 Hexo 3.9.0 建構，自 2020 年 2 月後停止更新。Hexo 生態系逐漸老化（jQuery、Font Awesome 4.x、NexT 主題已停止維護），且目前 repo 僅存編譯後的靜態檔案，缺乏原始碼可維護性。

重建的目的：
- 採用現代技術棧（Astro + Tailwind CSS + TypeScript），獲得更好的效能、開發體驗與長期維護性
- 實現極簡文字風格，專注閱讀體驗
- 補足缺失功能：站內搜尋、深色模式、現代留言系統
- 建立完整的 CI/CD 自動部署與品質檢核流程

## What Changes

- **全站重建**：從 Hexo 遷移至 Astro 4.x，使用 static output mode
- **內容遷移**：30 篇 Markdown 文章從 Hexo 格式轉換為 Astro Content Collections
- **視覺重設計**：從 NexT 主題改為自訂極簡文字風格（襯線字體、680px 寬度、大量留白）
- **新增留言系統**：Gitment 替換為 Giscus（基於 GitHub Discussions）
- **新增站內搜尋**：使用 Pagefind 編譯時索引，支援中文
- **新增深色模式**：prefers-color-scheme + 手動切換，localStorage 持久化
- **RSS 升級**：從 Atom XML 改為 @astrojs/rss 標準 RSS feed
- **SEO 強化**：新增 JSON-LD 結構化資料、自動 OG 圖片產生
- **CI/CD 建立**：GitHub Actions 自動建置部署，含 lint、type check、test pipeline
- **BREAKING**：所有舊的靜態檔案（HTML/CSS/JS/lib）將被移除，由 Astro 建置產出取代

## Capabilities

### New Capabilities

- `astro-project-setup`: Astro 專案初始化、設定檔、TypeScript 配置、Tailwind 整合、ESLint/Prettier 設定
- `content-migration`: Hexo Markdown 文章遷移至 Astro Content Collections，含 frontmatter schema 定義與驗證
- `base-layout`: 全站共用佈局（BaseLayout + PostLayout）、Header、Footer、導覽列元件
- `homepage`: 首頁文章列表、分頁、文章卡片元件
- `post-page`: 文章頁面渲染、閱讀時間、TOC 目錄、程式碼高亮與複製按鈕
- `taxonomy`: 分類頁、標籤頁、歸檔頁的路由與列表
- `comment-system`: Giscus 留言元件整合，支援深色模式自動切換
- `search`: Pagefind 搜尋整合，含搜尋對話框 React Island、中文支援
- `dark-mode`: 深色模式切換元件、CSS custom properties 主題系統、FOUC 防護
- `rss-seo`: RSS feed 產生、sitemap、robots.txt、Open Graph、JSON-LD 結構化資料
- `cicd-pipeline`: GitHub Actions workflow、lint/type-check/build/test pipeline、GitHub Pages 部署
- `about-page`: 關於頁面重建

### Modified Capabilities

（無既有 capabilities）

## Impact

- **檔案範圍**：整個 repo 將重建，舊的 HTML/CSS/JS/lib 檔案全數移除
- **依賴套件**：新增 Astro、Tailwind CSS、React、TypeScript、Vitest、Playwright 等
- **部署**：從手動 hexo deploy 改為 GitHub Actions 自動部署
- **URL 結構**：需保持與舊站一致（/YYYY/MM/DD/slug/），確保 SEO 不受影響
- **留言資料**：Gitment 留言無法遷移至 Giscus，將從零開始
- **Google Analytics**：需確認是否繼續使用或升級至 GA4
