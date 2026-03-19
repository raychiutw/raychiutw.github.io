## 1. Astro 5 核心升級

- [x] 1.1 更新 package.json 中 astro 版本至 5.x，@astrojs/check 至 0.9.x，@astrojs/sitemap 至最新相容版，@astrojs/rss 至最新相容版【檔案：package.json, pnpm-lock.yaml】
- [x] 1.2 遷移 Content Collections 至 Content Layer API：將 src/content/config.ts 搬至 src/content.config.ts，改用 glob loader，刪除舊檔【檔案：src/content/config.ts → src/content.config.ts】
- [x] 1.3 更新所有頁面中 post.slug → post.id 引用【檔案：src/pages/[year]/[month]/[day]/[slug].astro, src/pages/[...page].astro, src/pages/categories/[category].astro, src/pages/tags/[tag].astro, src/pages/archives.astro, src/pages/rss.xml.ts】
- [x] 1.4 更新 render 匯入方式：從 post.render() 改為 import { render } from 'astro:content'【檔案：src/pages/[year]/[month]/[day]/[slug].astro】
- [x] 1.5 更新 tsconfig.json，include 中加入 .astro/types.d.ts【檔案：tsconfig.json】
- [x] 1.6 執行 pnpm install 並驗證 pnpm build 成功【檔案：pnpm-lock.yaml】

## 2. Tailwind CSS 4 遷移

- [x] 2.1 移除 @astrojs/tailwind 與 tailwindcss 3.x，安裝 @tailwindcss/vite 與 tailwindcss 4.x【檔案：package.json, pnpm-lock.yaml】
- [x] 2.2 更新 astro.config.mjs：移除 tailwind() integration，加入 vite.plugins 中的 tailwindcss()【檔案：astro.config.mjs】
- [x] 2.3 遷移 global.css：@tailwind 指令改為 @import "tailwindcss"，將 tailwind.config.mjs 中的主題設定搬入 @theme 區塊【檔案：src/styles/global.css】
- [x] 2.4 刪除 tailwind.config.mjs【檔案：tailwind.config.mjs】
- [x] 2.5 執行 npx @tailwindcss/upgrade 自動遷移 renamed utilities【檔案：src/**/\*.astro, src/**/\*.tsx】
- [x] 2.6 手動檢查並修正 Tailwind 4 breaking changes：border 預設色、!important 位置、CSS variable 語法【檔案：src/**/\*.astro, src/**/\*.tsx, src/styles/global.css】
- [x] 2.7 更新 Shiki CSS 變數名稱：--astro-code-color-_ → --astro-code-_【檔案：src/styles/global.css】
- [x] 2.8 驗證深色模式 dark: variant 正常運作【檔案：src/styles/global.css】

## 3. React 19 升級

- [x] 3.1 更新 package.json 中 react、react-dom 至 19.x，@types/react、@types/react-dom 至 19.x，@astrojs/react 至 5.x【檔案：package.json, pnpm-lock.yaml】
- [x] 3.2 更新 @testing-library/react 至支援 React 19 的版本【檔案：package.json, pnpm-lock.yaml】
- [x] 3.3 驗證 SearchDialog.tsx 與 ThemeToggle.tsx 功能正常【檔案：src/components/SearchDialog.tsx, src/components/ThemeToggle.tsx】

## 4. 整合驗證

- [x] 4.1 執行 pnpm build 完整建置驗證【檔案：全專案】
- [x] 4.2 執行 pnpm test 單元測試驗證【檔案：src/utils/**tests**/readingTime.test.ts】
- [x] 4.3 執行 pnpm test:e2e E2E 測試驗證【檔案：tests/】
- [x] 4.4 執行 pnpm lint 與 pnpm format:check 程式碼品質驗證【檔案：全專案】
- [x] 4.5 本地 pnpm preview 人工檢查視覺一致性與互動功能【檔案：全專案】
