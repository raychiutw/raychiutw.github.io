# 文章頁面規格

## ADDED Requirements

### Requirement: 文章元資料顯示

文章頁面 SHALL 於頂部顯示文章標題、發佈日期、所屬分類、標籤清單及預估閱讀時間。

預估閱讀時間 SHALL 依據文章字數自動計算（以每分鐘 200 字為基準）。

#### Scenario: 使用者開啟一篇文章

WHEN 使用者進入文章頁面
THEN 頁面頂部 SHALL 顯示文章標題
AND 標題下方 SHALL 顯示發佈日期、分類連結、標籤連結及預估閱讀時間

#### Scenario: 文章包含多個標籤

WHEN 文章設有多個標籤
THEN 所有標籤 SHALL 以連結形式顯示，點擊後導向對應標籤頁

---

### Requirement: Markdown 渲染與語法高亮

文章內容 SHALL 使用 Markdown 渲染，程式碼區塊 MUST 使用 Shiki 進行語法高亮。

#### Scenario: 文章包含程式碼區塊

WHEN 文章 Markdown 中包含以三個反引號標記且指定語言的程式碼區塊
THEN 該區塊 SHALL 以 Shiki 語法高亮渲染，並正確識別對應語言

---

### Requirement: 程式碼區塊複製按鈕

每個程式碼區塊 SHALL 附帶一個複製按鈕，讓使用者可一鍵複製程式碼內容。

#### Scenario: 使用者點擊複製按鈕

WHEN 使用者點擊程式碼區塊右上角的複製按鈕
THEN 該區塊的完整程式碼內容 SHALL 被複製到剪貼簿
AND 按鈕 SHALL 短暫顯示「已複製」的視覺回饋

---

### Requirement: 行內代碼樣式

行內代碼（inline code） SHALL 以淡背景色呈現，與正文文字明確區隔。

#### Scenario: 文章包含行內代碼

WHEN 文章內容中出現以單個反引號包裹的行內代碼
THEN 該文字 SHALL 顯示淡背景色，與周圍正文形成視覺區隔

---

### Requirement: 目錄（TOC）導覽

長文 SHALL 提供目錄（Table of Contents），並在滾動時高亮當前閱讀章節。

#### Scenario: 使用者閱讀長文並滾動頁面

WHEN 文章包含兩個以上的標題層級
THEN 頁面 SHALL 顯示 TOC 目錄

WHEN 使用者滾動頁面至特定章節
THEN TOC 中對應的章節項目 SHALL 被高亮標示

#### Scenario: 使用者點擊 TOC 項目

WHEN 使用者點擊 TOC 中的某一項目
THEN 頁面 SHALL 平滑捲動至該章節位置

---

### Requirement: 圖片顯示與放大

文章中的圖片 SHALL 置中顯示、寬度為 100%，並支援點擊放大（medium-zoom）。

#### Scenario: 使用者點擊文章中的圖片

WHEN 使用者點擊文章內嵌圖片
THEN 圖片 SHALL 以 medium-zoom 效果放大顯示

#### Scenario: 圖片在正常狀態下的呈現

WHEN 文章包含圖片
THEN 圖片 SHALL 置中對齊且寬度為容器的 100%

---

### Requirement: Giscus 留言區

文章底部 SHALL 顯示 Giscus 留言區，供讀者留言討論。

#### Scenario: 使用者瀏覽至文章底部

WHEN 使用者捲動至文章頁面底部
THEN 頁面 SHALL 顯示 Giscus 留言元件
