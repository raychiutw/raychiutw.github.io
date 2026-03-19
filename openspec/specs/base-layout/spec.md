# base-layout Specification

## Purpose

TBD - created by archiving change rebuild-blog-with-astro. Update Purpose after archive.
## Requirements
### Requirement: BaseLayout 基礎佈局元件

`BaseLayout.astro` SHALL 作為全站的基礎佈局元件，MUST 包含完整的 HTML head 區塊、Header 元件、主要內容插槽（slot）與 Footer 元件。程式碼區塊語法高亮 MUST 使用 Astro 5 的 Shiki CSS 變數名稱。

#### Scenario: BaseLayout 結構驗證

- WHEN 檢查 `src/layouts/BaseLayout.astro` 檔案內容
- THEN SHALL 包含以下區塊：
  - `<head>` 區塊：包含 meta 標籤、字型載入、全域 CSS 引入
  - `<Header />` 元件引用
  - `<main>` 標籤內含 `<slot />` 作為內容插槽
  - `<Footer />` 元件引用

#### Scenario: Shiki CSS 變數名稱更新

- WHEN 檢查 `src/styles/global.css` 中的 Shiki 相關樣式
- THEN SHALL 使用 `--astro-code-foreground` 取代 `--astro-code-color-text`
- AND SHALL 使用 `--astro-code-background` 取代 `--astro-code-color-background`
- AND 所有 `--astro-code-color-*` 前綴 SHALL 更新為 `--astro-code-*`

### Requirement: PostLayout 文章佈局元件

`PostLayout.astro` SHALL 繼承 `BaseLayout`，並額外加入文章專屬的標題、日期、預估閱讀時間、標籤與 Giscus 留言系統。

#### Scenario: PostLayout 繼承與擴充驗證

- WHEN 檢查 `src/layouts/PostLayout.astro` 檔案內容
- THEN SHALL 使用 `BaseLayout` 作為外層佈局
- AND SHALL 顯示文章標題（`<h1>`）
- AND SHALL 顯示發佈日期
- AND SHALL 顯示預估閱讀時間
- AND SHALL 顯示文章標籤列表

#### Scenario: Giscus 留言系統整合

- WHEN 使用者瀏覽任一文章頁面
- THEN 文章內容下方 SHALL 顯示 Giscus 留言區塊
- AND Giscus SHALL 正確載入且可互動

---

### Requirement: Header 導覽列元件

`Header.astro` SHALL 包含站名與導覽列，導覽列 MUST 包含首頁、歸檔、分類、標籤、關於等連結，並 MUST 在手機裝置提供漢堡選單。

#### Scenario: 桌面版導覽列顯示

- WHEN 在寬度 >= 768px 的螢幕檢視頁面
- THEN Header SHALL 顯示站名
- AND SHALL 顯示以下導覽連結：首頁、歸檔、分類、標籤、關於
- AND 所有連結 SHALL 可點擊且導向正確頁面

#### Scenario: 手機版漢堡選單

- WHEN 在寬度 < 768px 的螢幕檢視頁面
- THEN 導覽連結 SHALL 隱藏
- AND SHALL 顯示漢堡選單按鈕
- WHEN 點擊漢堡選單按鈕
- THEN SHALL 展開導覽連結列表
- AND 再次點擊 SHALL 收合選單

---

### Requirement: Footer 頁尾元件

`Footer.astro` SHALL 包含版權資訊與社群連結。

#### Scenario: Footer 內容驗證

- WHEN 檢視頁面底部的 Footer 區塊
- THEN SHALL 顯示版權聲明文字（包含年份與作者名稱）
- AND SHALL 顯示至少一個社群平台連結（如 GitHub、Twitter 等）
- AND 社群連結 SHALL 在新分頁開啟（`target="_blank"`）

#### Scenario: Footer 在所有頁面一致

- WHEN 瀏覽網站中任何頁面
- THEN Footer 內容 SHALL 保持一致

---

### Requirement: 內容寬度與間距

頁面主要內容區域的最大寬度 MUST 為 680px，且頁面上下 padding MUST 不小於 4rem。

#### Scenario: 最大內容寬度驗證

- WHEN 在寬度 > 680px 的螢幕檢視任一頁面
- THEN 主要內容區域的寬度 SHALL 不超過 680px
- AND 內容 SHALL 水平置中顯示

#### Scenario: 頁面上下間距驗證

- WHEN 檢視任一頁面的 `<main>` 區塊
- THEN 上方 padding SHALL 不小於 4rem
- AND 下方 padding SHALL 不小於 4rem

---

### Requirement: 語義化 HTML 標籤

所有佈局元件 MUST 使用語義化 HTML 標籤，確保無障礙性與 SEO 最佳化。

#### Scenario: 語義標籤使用驗證

- WHEN 檢查建置後的 HTML 結構
- THEN 頁首 SHALL 使用 `<header>` 標籤
- AND 主要內容區域 SHALL 使用 `<main>` 標籤
- AND 文章內容 SHALL 使用 `<article>` 標籤
- AND 頁尾 SHALL 使用 `<footer>` 標籤

#### Scenario: 無障礙基本合規

- WHEN 使用螢幕閱讀器瀏覽網站
- THEN 頁面結構 SHALL 能透過語義標籤正確辨識各區塊
- AND 導覽列 SHALL 使用 `<nav>` 標籤包裹

