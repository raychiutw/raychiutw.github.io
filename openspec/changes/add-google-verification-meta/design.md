## 技術設計

### 實作方式

在 `src/components/SEO.astro` 的 `<title>` 與 `<link rel="canonical">` 之間插入 Google Search Console 驗證 meta 標籤：

```html
<meta name="google-site-verification" content="googlefebc379374f1e9b3" />
```

### 設計考量

1. **放置位置**：將驗證標籤放在 `<meta name="description">` 之後、`<link rel="canonical">` 之前，與其他 meta 標籤集中管理
2. **靜態輸出**：因為 Astro 以 static output 模式運作，meta 標籤會在 build 時寫入每個 HTML 頁面
3. **雙重驗證**：同時保留 `public/googlefebc379374f1e9b3.html` 檔案驗證方式，提供備援機制

### 受影響檔案

| 檔案                                 | 變更類型 | 說明                   |
| ------------------------------------ | -------- | ---------------------- |
| `src/components/SEO.astro`           | 修改     | 新增 meta 標籤         |
| `public/googlefebc379374f1e9b3.html` | 無變更   | 既有檔案，確認存在即可 |
