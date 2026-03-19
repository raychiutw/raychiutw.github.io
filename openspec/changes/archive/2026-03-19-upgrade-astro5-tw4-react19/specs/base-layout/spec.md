## MODIFIED Requirements

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
