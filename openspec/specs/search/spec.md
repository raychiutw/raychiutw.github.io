# search Specification

## Purpose

TBD - created by archiving change rebuild-blog-with-astro. Update Purpose after archive.

## Requirements

### Requirement: 編譯時建立搜尋索引

系統 MUST 於編譯時自動建立 Pagefind 搜尋索引。

搜尋索引大小 SHALL 不超過 200KB。

#### Scenario: 網站執行建置流程

WHEN 網站執行建置（build）流程
THEN Pagefind SHALL 自動產生搜尋索引
AND 索引檔案總大小 SHALL ≤ 200KB

---

### Requirement: 中文分詞支援

Pagefind 索引 MUST 支援中文分詞，使用 `--force-language zh-TW` 參數產生索引。

#### Scenario: 使用者搜尋中文關鍵字

WHEN 使用者輸入中文關鍵字進行搜尋
THEN 搜尋引擎 SHALL 正確比對中文內容並回傳相關結果

#### Scenario: 建置時指定語言參數

WHEN 網站執行建置流程產生 Pagefind 索引
THEN 系統 SHALL 使用 `--force-language zh-TW` 參數執行索引建立

---

### Requirement: 搜尋觸發方式

使用者 SHALL 可透過點擊導覽列搜尋圖示或按下鍵盤快捷鍵 `Ctrl+K`（Windows/Linux）/ `Cmd+K`（macOS）來觸發搜尋。

#### Scenario: 使用者點擊搜尋圖示

WHEN 使用者點擊導覽列上的搜尋圖示
THEN 搜尋 modal 對話框 SHALL 彈出顯示

#### Scenario: 使用者按下鍵盤快捷鍵

WHEN 使用者按下 `Ctrl+K`（Windows/Linux）或 `Cmd+K`（macOS）
THEN 搜尋 modal 對話框 SHALL 彈出顯示

---

### Requirement: 搜尋 Modal 對話框

搜尋功能 SHALL 以 modal 對話框形式呈現，即時顯示搜尋結果。

搜尋元件 MUST 使用 React Island 並以 `client:idle` 指令載入。

#### Scenario: 使用者輸入搜尋關鍵字

WHEN 使用者在搜尋 modal 中輸入關鍵字
THEN modal SHALL 即時顯示符合的搜尋結果

#### Scenario: 搜尋元件載入方式

WHEN 頁面載入完成且瀏覽器進入閒置狀態
THEN 搜尋 React Island 元件 SHALL 以 `client:idle` 方式進行 hydration

---

### Requirement: 無結果提示

當搜尋無結果時，系統 SHALL 顯示友善提示訊息，引導使用者調整關鍵字。

#### Scenario: 搜尋無符合結果

WHEN 使用者輸入的關鍵字查無任何符合的文章
THEN 搜尋 modal SHALL 顯示友善提示訊息（例如「找不到相關文章，請嘗試其他關鍵字」）
