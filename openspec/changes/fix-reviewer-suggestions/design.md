# Design: Fix Reviewer Suggestions

## 1. Google Search Console 驗證檔案

在 `public/googlefebc379374f1e9b3.html` 建立 Google 驗證標準格式檔案。Astro build 時會自動複製 `public/` 目錄下的靜態檔案到 `dist/`，確保部署後 Google Search Console 可持續驗證。

## 2. Giscus.astro @ts-ignore 追蹤

在 `src/components/Giscus.astro` 中 `@ts-ignore` 註解旁新增 TODO 註解，說明移除條件：當 `astro-eslint-parser` 支援 script 中的 TypeScript 後即可移除。

## 3. .gitattributes 統一換行符

在專案根目錄建立 `.gitattributes`，設定所有文字檔使用 LF 換行（`* text=auto eol=lf`），並將圖片格式標記為 binary，避免 Git 對二進位檔案進行換行符轉換。
