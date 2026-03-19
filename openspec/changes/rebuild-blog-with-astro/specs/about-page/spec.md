# 關於頁面（About Page）

## ADDED Requirements

### Requirement: 路由設定

關於頁面 MUST 可透過 `/about/` 路由存取。

#### Scenario: 使用者造訪關於頁面

WHEN 使用者在瀏覽器中輸入 `/about/` 或點擊導覽列的「關於」連結
THEN 網站 SHALL 顯示關於頁面，HTTP 狀態碼為 200

#### Scenario: 不帶尾部斜線的路由

WHEN 使用者造訪 `/about`（不帶尾部斜線）
THEN 網站 SHALL 自動導向至 `/about/` 或直接顯示關於頁面內容

---

### Requirement: 使用 BaseLayout

關於頁面 MUST 使用 `BaseLayout` 作為頁面佈局，確保與全站一致的 Header、Footer 及 Meta 標籤。

#### Scenario: 頁面佈局一致性

WHEN 使用者造訪關於頁面
THEN 頁面 SHALL 包含與其他頁面一致的 Header 導覽列與 Footer

---

### Requirement: 頁面內容

關於頁面 MUST 包含以下內容區塊：作者簡介、技術專長、聯絡方式。

#### Scenario: 作者簡介顯示

WHEN 使用者造訪關於頁面
THEN 頁面 SHALL 顯示作者的個人簡介文字

#### Scenario: 技術專長顯示

WHEN 使用者造訪關於頁面
THEN 頁面 SHALL 顯示作者的技術專長列表或描述

#### Scenario: 聯絡方式顯示

WHEN 使用者造訪關於頁面
THEN 頁面 SHALL 顯示至少一種聯絡方式（如 Email、GitHub 連結等）

---

### Requirement: 極簡排版風格

關於頁面 MUST 採用極簡排版設計，與文章頁面的視覺風格保持一致。排版 SHALL 以內容為主、裝飾性元素最少化。

#### Scenario: 視覺風格一致性

WHEN 使用者從文章頁面導覽至關於頁面
THEN 關於頁面的排版風格（字型、間距、配色）SHALL 與文章頁面一致，使用者不會感受到明顯的視覺斷裂

---

### Requirement: Markdown 內容撰寫

關於頁面的內容 SHALL 支援使用 Markdown 格式撰寫，以便於維護與更新。

#### Scenario: Markdown 內容渲染

WHEN 關於頁面的 Markdown 內容包含標題、段落、列表、連結等語法
THEN 頁面 SHALL 正確渲染這些 Markdown 語法為對應的 HTML 元素
