# dark-mode Specification

## Purpose

TBD - created by archiving change rebuild-blog-with-astro. Update Purpose after archive.
## Requirements
### Requirement: 系統偏好跟隨

深色模式 SHALL 預設跟隨使用者作業系統的 `prefers-color-scheme` 設定。當使用者未曾手動切換時，MUST 以系統偏好作為預設主題。

#### Scenario: 首次造訪且系統為深色模式

WHEN 使用者首次造訪網站且作業系統設定為深色模式
THEN 網站 SHALL 以深色模式呈現

#### Scenario: 首次造訪且系統為淺色模式

WHEN 使用者首次造訪網站且作業系統設定為淺色模式
THEN 網站 SHALL 以淺色模式呈現

---

### Requirement: 手動切換按鈕

Header 右側 SHALL 提供一個主題切換按鈕，使用太陽（淺色模式）與月亮（深色模式）圖示。該按鈕 MUST 在所有頁面的 Header 中可見。

#### Scenario: 使用者點擊切換按鈕

WHEN 使用者在淺色模式下點擊切換按鈕
THEN 網站 SHALL 立即切換為深色模式，且按鈕圖示從太陽變為月亮

#### Scenario: 使用者再次點擊切換按鈕

WHEN 使用者在深色模式下點擊切換按鈕
THEN 網站 SHALL 立即切換為淺色模式，且按鈕圖示從月亮變為太陽

---

### Requirement: 偏好持久化

使用者手動選擇的主題偏好 SHALL 存入 `localStorage`。下次造訪時 MUST 讀取已儲存的偏好，優先於系統設定。

#### Scenario: 使用者切換後重新造訪

WHEN 使用者將主題手動切換為深色模式後關閉瀏覽器，再次造訪網站
THEN 網站 SHALL 以深色模式呈現，無論系統偏好為何

---

### Requirement: Tailwind darkMode 設定

Tailwind CSS 4 MUST 支援 class-based dark mode。深色模式啟用時，HTML `<html>` 根元素 SHALL 加上 `dark` class。Tailwind 4 預設支援 class-based dark mode（透過 `@custom-variant` 或內建行為），無需額外設定檔。

#### Scenario: 深色模式啟用

- WHEN 深色模式被啟用（無論透過系統偏好或手動切換）
- THEN `<html>` 元素 SHALL 包含 `class="dark"`
- AND Tailwind 的 `dark:` variant SHALL 正確套用對應樣式

#### Scenario: 淺色模式啟用

- WHEN 淺色模式被啟用
- THEN `<html>` 元素 SHALL 不包含 `dark` class

### Requirement: 避免 FOUC 閃爍

MUST 在 `<head>` 中以 inline `<script>` 提前偵測並套用主題 class，避免頁面載入時出現 FOUC（Flash of Unstyled Content）閃爍。該 script SHALL 在任何 CSS 或 DOM 渲染之前執行。

#### Scenario: 頁面載入時套用深色模式

WHEN 使用者偏好或系統設定為深色模式，頁面開始載入
THEN `<html>` 元素 SHALL 在首次繪製（first paint）前即帶有 `dark` class，使用者不會看到淺色模式的閃爍

---

### Requirement: CSS Custom Properties 色彩定義

色彩 MUST 使用 CSS custom properties 定義。淺色模式背景色 SHALL 為 `#FAFAF9`、文字色 SHALL 為 `#1C1917`；深色模式 SHALL 反轉，背景色為 `#1C1917`、文字色為 `#FAFAF9`。

#### Scenario: 淺色模式色彩

WHEN 網站處於淺色模式
THEN 背景色 SHALL 為 `#FAFAF9`，文字色 SHALL 為 `#1C1917`

#### Scenario: 深色模式色彩

WHEN 網站處於深色模式
THEN 背景色 SHALL 為 `#1C1917`，文字色 SHALL 為 `#FAFAF9`

---

### Requirement: 過渡動畫

所有受主題影響的元素 SHALL 套用 `transition: color 200ms, background-color 200ms`，確保切換時有平滑的視覺過渡。

#### Scenario: 切換主題時的視覺過渡

WHEN 使用者切換主題
THEN 所有文字顏色與背景顏色 SHALL 在 200 毫秒內平滑過渡，而非瞬間跳變

---

### Requirement: ThemeToggle 元件實作

ThemeToggle 切換按鈕 MUST 使用 React Island 模式，並以 `client:idle` 指令載入，確保不阻擋首次繪製。

#### Scenario: ThemeToggle 載入時機

WHEN 頁面載入完成且瀏覽器處於閒置狀態
THEN ThemeToggle 元件 SHALL 完成 hydration 並可互動

