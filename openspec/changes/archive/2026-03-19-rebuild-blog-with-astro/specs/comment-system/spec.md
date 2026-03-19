# Giscus 留言系統規格

## ADDED Requirements

### Requirement: GitHub Discussions 留言後端

留言系統 MUST 使用 Giscus，以 GitHub Discussions 作為留言儲存後端。

Repo mapping MUST 使用 `pathname`，每篇文章 SHALL 對應一個獨立的 Discussion。

#### Scenario: 使用者在文章頁面留言

WHEN 使用者在某篇文章底部提交留言
THEN Giscus SHALL 在對應的 GitHub Discussion 中建立該留言
AND Discussion 的對應關係 SHALL 以文章 pathname 為依據

#### Scenario: 不同文章的留言隔離

WHEN 兩篇不同文章各自有留言
THEN 每篇文章 SHALL 對應各自獨立的 Discussion，留言互不混淆

---

### Requirement: 深色模式自動切換

Giscus 留言區 SHALL 支援深色模式，並自動跟隨網站主題切換。

#### Scenario: 使用者切換網站主題至深色模式

WHEN 使用者將網站主題從淺色切換為深色
THEN Giscus 留言區 SHALL 自動切換為深色模式外觀

#### Scenario: 使用者以深色模式開啟頁面

WHEN 使用者的系統偏好為深色模式且網站跟隨系統設定
THEN Giscus 留言區 SHALL 以深色模式載入

---

### Requirement: Lazy Load 載入策略

Giscus 元件 MUST 以 lazy load 方式載入，不得阻塞頁面渲染。

#### Scenario: 文章頁面初次載入

WHEN 使用者開啟文章頁面
THEN Giscus 的 JavaScript 資源 SHALL 延遲載入，不阻塞頁面主要內容的渲染

#### Scenario: 使用者捲動至留言區

WHEN 使用者捲動至文章底部留言區可見範圍
THEN Giscus 留言元件 SHALL 開始載入並顯示留言內容

---

### Requirement: 僅文章頁面顯示留言

Giscus 留言區 SHALL 僅顯示於文章頁面底部，其他頁面（首頁、分類頁、標籤頁、歸檔頁等）MUST NOT 顯示留言區。

#### Scenario: 使用者瀏覽非文章頁面

WHEN 使用者存取首頁、分類頁、標籤頁或歸檔頁
THEN 頁面 MUST NOT 包含 Giscus 留言元件

#### Scenario: 使用者瀏覽文章頁面

WHEN 使用者存取任一文章頁面
THEN 頁面底部 SHALL 顯示 Giscus 留言區
