## 1. 專案初始化

- [ ] 1.1 初始化 Astro 4.x 專案（static output mode），設定 pnpm，提交 pnpm-lock.yaml 【檔案：astro.config.mjs, package.json, pnpm-lock.yaml】
- [ ] 1.2 設定 TypeScript strict mode + tsconfig.json 【檔案：tsconfig.json】
- [ ] 1.3 整合 Tailwind CSS 3.x，設定 darkMode: 'class'，定義 CSS custom properties 色彩系統 【檔案：tailwind.config.mjs, src/styles/global.css】
- [ ] 1.4 設定 ESLint（含 eslint-plugin-astro）+ Prettier，建立設定檔 【檔案：.eslintrc.cjs, .prettierrc, .prettierignore】
- [ ] 1.5 建立專案目錄結構：src/layouts, src/components, src/pages, src/content/blog, src/utils, src/styles 【檔案：src/ 目錄】
- [ ] 1.6 建立 src/consts.ts 共用常數檔（站名、導覽列項目、社群連結）【檔案：src/consts.ts】

## 2. 佈局與基礎元件

- [ ] 2.1 建立 BaseLayout.astro：head（meta, fonts, global CSS）、Header slot、main slot、Footer slot 【檔案：src/layouts/BaseLayout.astro】
- [ ] 2.2 建立 Header.astro：站名 RAY'S NOTES + 導覽列（首頁、歸檔、分類、標籤、關於），手機漢堡選單（md 以上展開）【檔案：src/components/Header.astro】
- [ ] 2.3 建立 Footer.astro：版權資訊、社群連結 【檔案：src/components/Footer.astro】
- [ ] 2.4 建立 PostLayout.astro：繼承 BaseLayout，加入文章標題、日期、閱讀時間、分類、標籤 【檔案：src/layouts/PostLayout.astro】
- [ ] 2.5 實作極簡排版樣式：內文 Noto Serif TC 18px/1.8、最大寬度 680px、留白節奏（段落 1.5em、h2 前 3em 後 1em）【檔案：src/styles/global.css, tailwind.config.mjs】

## 3. 內容遷移

- [ ] 3.1 定義 Content Collection schema（Zod）：title, description, date, category, tags, slug 【檔案：src/content/config.ts】
- [ ] 3.2 撰寫 Hexo → Astro frontmatter 轉換腳本 【檔案：scripts/migrate.ts】
- [ ] 3.3 遷移 30 篇 Markdown 文章至 src/content/blog/，檔名 kebab-case 【檔案：src/content/blog/*.md】
- [ ] 3.4 搬移文章圖片至 public/images/，更新文章內圖片路徑 【檔案：public/images/, src/content/blog/*.md】
- [ ] 3.5 驗證全部 30 篇文章 astro build 通過且 frontmatter 符合 schema 【驗證：astro check + astro build】

## 4. 頁面路由

- [ ] 4.1 建立首頁 index.astro：文章列表（時間倒序）+ 分頁（每頁 10 篇）【檔案：src/pages/index.astro, src/pages/[...page].astro】
- [ ] 4.2 建立 PostCard.astro 元件：日期 + 標題 + 摘要（前 150 字）【檔案：src/components/PostCard.astro】
- [ ] 4.3 建立文章頁面路由，保持 URL 格式 /YYYY/MM/DD/slug/ 【檔案：src/pages/[...slug].astro】
- [ ] 4.4 建立分類頁 /categories/[category]：列出該分類文章 + 文章數量 【檔案：src/pages/categories/[category].astro】
- [ ] 4.5 建立標籤頁 /tags/[tag]：列出該標籤文章 + 文章數量 【檔案：src/pages/tags/[tag].astro】
- [ ] 4.6 建立歸檔頁 /archives：依年月分組顯示文章 【檔案：src/pages/archives.astro】
- [ ] 4.7 建立關於頁 /about：使用 BaseLayout，Markdown 內容（作者簡介、技術專長、聯絡方式）【檔案：src/pages/about.astro】

## 5. 文章頁功能

- [ ] 5.1 設定 Shiki 語法高亮（astro.config.mjs）+ 程式碼區塊樣式（圓角、背景色）【檔案：astro.config.mjs, src/styles/global.css】
- [ ] 5.2 實作程式碼複製按鈕元件 【檔案：src/components/CopyButton.astro】
- [ ] 5.3 實作行內代碼淡背景色（明模式 #F5F5F4 / 暗模式 #292524）【檔案：src/styles/global.css】
- [ ] 5.4 實作 TOC 目錄元件，滾動時高亮當前章節 【檔案：src/components/TableOfContents.astro】
- [ ] 5.5 整合 medium-zoom 圖片點擊放大功能 【檔案：src/components/ImageZoom.astro】

## 6. 深色模式

- [ ] 6.1 在 BaseLayout <head> 加入 inline script 提前讀取 localStorage 套用 dark class（防 FOUC）【檔案：src/layouts/BaseLayout.astro】
- [ ] 6.2 建立 ThemeToggle.tsx React Island 元件（太陽/月亮圖示、client:idle）【檔案：src/components/ThemeToggle.tsx】
- [ ] 6.3 實作 CSS custom properties 主題切換 + transition 200ms 【檔案：src/styles/global.css】
- [ ] 6.4 驗證明暗模式下所有頁面色彩對比度符合 WCAG AA ≥ 4.5:1 【驗證：axe-core / Lighthouse】

## 7. 搜尋功能

- [ ] 7.1 安裝 Pagefind，設定 astro build 後自動建立索引（--force-language zh-TW）【檔案：astro.config.mjs, package.json】
- [ ] 7.2 建立 SearchDialog.tsx React Island 元件（modal 對話框、client:idle）【檔案：src/components/SearchDialog.tsx】
- [ ] 7.3 實作搜尋觸發：Header 搜尋圖示 + Ctrl+K / Cmd+K 快捷鍵 【檔案：src/components/Header.astro, src/components/SearchDialog.tsx】
- [ ] 7.4 實作無結果友善提示 + 驗證中文搜尋正常運作 【驗證：手動測試】

## 8. 留言系統

- [ ] 8.1 建立 Giscus.astro 元件，設定 repo mapping（pathname）、lazy load 【檔案：src/components/Giscus.astro】
- [ ] 8.2 在 PostLayout 底部嵌入 Giscus 元件 【檔案：src/layouts/PostLayout.astro】
- [ ] 8.3 實作 Giscus 深色模式自動切換（監聽主題變更）【檔案：src/components/Giscus.astro】

## 9. RSS 與 SEO

- [ ] 9.1 安裝 @astrojs/rss + @astrojs/sitemap，設定 astro.config.mjs 【檔案：astro.config.mjs, package.json】
- [ ] 9.2 建立 rss.xml.ts 產生 RSS feed（含全文）【檔案：src/pages/rss.xml.ts】
- [ ] 9.3 在 BaseLayout <head> 加入 RSS autodiscovery link 【檔案：src/layouts/BaseLayout.astro】
- [ ] 9.4 建立 SEO 元件：自動產生 title、meta description、Open Graph、Twitter Card 【檔案：src/components/SEO.astro】
- [ ] 9.5 實作 JSON-LD Article schema 結構化資料 【檔案：src/components/SEO.astro】
- [ ] 9.6 設定 canonical URL + 建立 public/robots.txt 【檔案：src/components/SEO.astro, public/robots.txt】

## 10. CI/CD Pipeline

- [ ] 10.1 建立 GitHub Actions workflow：pnpm install → lint → format:check → tsc → build → test 【檔案：.github/workflows/deploy.yml】
- [ ] 10.2 設定 GitHub Pages 部署（actions/deploy-pages@v4，Node.js 20 LTS，僅 master 觸發）【檔案：.github/workflows/deploy.yml】
- [ ] 10.3 設定 feature/* 分支僅跑 CI 不部署 【檔案：.github/workflows/ci.yml】
- [ ] 10.4 啟用 Dependabot 自動更新 + npm audit 檢查 【檔案：.github/dependabot.yml】

## 11. 測試與品質驗證

- [ ] 11.1 設定 Vitest 單元測試環境，撰寫 utility 函式測試 【檔案：vitest.config.ts, src/utils/__tests__/】
- [ ] 11.2 設定 Playwright E2E 測試，涵蓋首頁、文章頁、搜尋、深色模式、導覽 【檔案：playwright.config.ts, tests/】
- [ ] 11.3 執行連結檢查（內部連結 100% 200 OK）【驗證：lychee / htmltest】
- [ ] 11.4 執行 Lighthouse 驗證：Performance ≥ 90、Accessibility ≥ 95、Best Practices ≥ 95、SEO ≥ 95 【驗證：Lighthouse CI】
- [ ] 11.5 視覺回歸測試：3 斷點 × 明暗模式截圖比對 【驗證：Playwright screenshot】
- [ ] 11.6 驗證 30 篇文章全部渲染正確、URL 與舊站一致 【驗證：E2E + 手動檢查】

## 12. 上線前檢核

- [ ] 12.1 PM 彙整成果向 Key User 報告
- [ ] 12.2 Key User 審查並 Approve
- [ ] 12.3 合併至 master，GitHub Actions 自動部署
- [ ] 12.4 部署後 5 分鐘內驗證：首頁、文章頁、RSS、sitemap、搜尋功能正常
