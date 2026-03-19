## Why

Google Search Console 需要透過 meta 標籤驗證網站擁有權，目前 SEO 元件尚未包含此驗證標籤，導致無法完成 Search Console 設定與索引監控。

## What Changes

- 在 `src/components/SEO.astro` 的 `<head>` 區域加入 `<meta name="google-site-verification" content="googlefebc379374f1e9b3" />` 標籤
- 保留既有的 `public/googlefebc379374f1e9b3.html` 檔案驗證方式作為備援

## Capabilities

### New Capabilities

- `google-verification`: Google Search Console 網站驗證 meta 標籤，確保每個頁面都輸出驗證標記

### Modified Capabilities

（無）

## Impact

- 受影響檔案：`src/components/SEO.astro`
- 所有使用 SEO 元件的頁面產出的 HTML 都會包含新的 meta 標籤
- 無 breaking change，僅新增一行 meta 標籤
