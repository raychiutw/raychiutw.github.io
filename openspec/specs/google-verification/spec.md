# google-verification Specification

## Purpose
TBD - created by archiving change add-google-verification-meta. Update Purpose after archive.
## Requirements
### Requirement: Google Search Console 驗證 meta 標籤

SEO 元件 MUST 在每個頁面的 `<head>` 區域輸出 Google Search Console 驗證 meta 標籤 `<meta name="google-site-verification" content="googlefebc379374f1e9b3" />`。

#### Scenario: 頁面包含驗證 meta 標籤

- **WHEN** 任何使用 SEO 元件的頁面被建置並輸出為 HTML
- **THEN** 該 HTML 的 `<head>` 中 MUST 包含 `<meta name="google-site-verification" content="googlefebc379374f1e9b3">`

#### Scenario: 建置成功且無錯誤

- **WHEN** 執行 `npx astro build`
- **THEN** 建置流程 MUST 成功完成且無錯誤

### Requirement: HTML 檔案驗證備援

`public/googlefebc379374f1e9b3.html` 檔案 MUST 持續存在於專案中，作為 Google Search Console 的備援驗證方式。

#### Scenario: 驗證檔案存在

- **WHEN** 檢查專案的 `public/` 目錄
- **THEN** `googlefebc379374f1e9b3.html` 檔案 MUST 存在

