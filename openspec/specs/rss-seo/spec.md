# rss-seo Specification

## Purpose
TBD - created by archiving change rebuild-blog-with-astro. Update Purpose after archive.
## Requirements
### Requirement: RSS Feed 產生

網站 MUST 使用 `@astrojs/rss` 產生 `/rss.xml`，該 Feed SHALL 包含所有已發佈文章的全文內容（非摘要）。

#### Scenario: 存取 RSS Feed

WHEN 使用者或 RSS 閱讀器請求 `/rss.xml`
THEN 伺服器 SHALL 回傳有效的 RSS 2.0 XML，且每篇文章包含完整內文

#### Scenario: 新文章發佈後更新 Feed

WHEN 新文章發佈並部署後
THEN `/rss.xml` SHALL 包含該新文章的全文內容

---

### Requirement: RSS Autodiscovery

每個頁面的 `<head>` MUST 包含 RSS autodiscovery `<link>` 標籤，讓瀏覽器與 RSS 閱讀器能自動偵測 Feed 位址。

#### Scenario: 瀏覽器偵測 RSS

WHEN 使用者使用支援 RSS 偵測的瀏覽器造訪任一頁面
THEN 瀏覽器 SHALL 能透過 `<link rel="alternate" type="application/rss+xml">` 發現 `/rss.xml`

---

### Requirement: Sitemap 產生

網站 MUST 使用 `@astrojs/sitemap` 自動產生 `sitemap.xml`，涵蓋所有公開頁面。

#### Scenario: 搜尋引擎爬取 Sitemap

WHEN 搜尋引擎爬蟲請求 `/sitemap.xml`（或 sitemap index）
THEN 伺服器 SHALL 回傳有效的 sitemap XML，包含所有公開頁面的 URL

---

### Requirement: robots.txt

網站根目錄 MUST 提供靜態 `robots.txt` 檔案，包含 sitemap 位址及基本爬蟲規則。

#### Scenario: 爬蟲請求 robots.txt

WHEN 搜尋引擎爬蟲請求 `/robots.txt`
THEN 伺服器 SHALL 回傳包含 `Sitemap:` 指令的有效 robots.txt 檔案

---

### Requirement: 頁面 Meta 標籤

每個頁面 MUST 自動產生以下 meta 資訊：`<title>`、`<meta name="description">`、Open Graph 標籤（`og:title`、`og:description`、`og:image`、`og:url`、`og:type`）以及 Twitter Card 標籤（`twitter:card`、`twitter:title`、`twitter:description`、`twitter:image`）。

#### Scenario: 文章頁面的 Meta 標籤

WHEN 使用者或爬蟲造訪一篇文章頁面
THEN `<head>` SHALL 包含對應該文章的 title、description、Open Graph 及 Twitter Card 完整標籤

#### Scenario: 首頁的 Meta 標籤

WHEN 使用者或爬蟲造訪首頁
THEN `<head>` SHALL 包含網站層級的 title、description、Open Graph 及 Twitter Card 標籤

---

### Requirement: JSON-LD 結構化資料

文章頁面 MUST 包含 JSON-LD 格式的 `Article` schema 結構化資料，嵌入於 `<script type="application/ld+json">` 中。

#### Scenario: 結構化資料驗證

WHEN 使用 Google Rich Results Test 驗證一篇文章頁面
THEN 該工具 SHALL 成功解析 Article schema，無錯誤

---

### Requirement: Canonical URL

每個頁面 MUST 包含唯一的 `<link rel="canonical">` 標籤，指向該頁面的正規 URL，避免重複內容問題。

#### Scenario: Canonical URL 正確性

WHEN 使用者造訪任一頁面
THEN `<head>` 中的 `<link rel="canonical">` SHALL 指向該頁面的唯一正規 URL

---

### Requirement: OG 圖片尺寸

Open Graph 圖片 MUST 為固定尺寸 1200x630 像素，確保在社群平台分享時正確顯示。

#### Scenario: 社群平台分享預覽

WHEN 使用者在社群平台分享一篇文章連結
THEN 平台 SHALL 抓取到 1200x630 像素的 OG 圖片作為預覽

