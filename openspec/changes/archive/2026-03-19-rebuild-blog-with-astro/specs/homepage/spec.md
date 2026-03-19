# 首頁

## ADDED Requirements

### Requirement: 文章列表時間排序

首頁 SHALL 顯示部落格文章列表，且 MUST 按照發佈日期倒序排列（最新文章在最上方）。

#### Scenario: 文章排序驗證

- WHEN 使用者造訪首頁
- THEN 文章列表 SHALL 按照日期由新到舊排列
- AND 第一篇文章的日期 SHALL 大於或等於第二篇文章的日期

#### Scenario: 新文章發佈後排序

- WHEN 新增一篇日期為今天的文章並重新建置
- THEN 該文章 SHALL 出現在首頁列表的最頂端

---

### Requirement: 文章卡片顯示內容

首頁每篇文章 SHALL 顯示發佈日期、文章標題與摘要，摘要 MUST 為文章前 150 個字元。

#### Scenario: 文章卡片資訊完整性

- WHEN 檢視首頁中的任一文章項目
- THEN SHALL 顯示發佈日期
- AND SHALL 顯示文章標題
- AND SHALL 顯示摘要文字

#### Scenario: 摘要長度驗證

- WHEN 一篇文章內容超過 150 個字元
- THEN 首頁顯示的摘要 SHALL 截取前 150 個字元
- AND 摘要末尾 SHALL 以省略符號或適當方式表示內容被截斷

#### Scenario: 標題連結

- WHEN 使用者點擊文章標題
- THEN SHALL 導向該文章的完整內容頁面

---

### Requirement: 分頁功能

首頁 MUST 實作分頁功能，每頁 SHALL 顯示 10 篇文章。

#### Scenario: 每頁文章數量

- WHEN 文章總數超過 10 篇
- THEN 首頁第一頁 SHALL 僅顯示 10 篇文章
- AND SHALL 提供前往下一頁的導覽連結

#### Scenario: 分頁導覽

- WHEN 使用者位於第一頁
- THEN SHALL 顯示「下一頁」連結
- AND SHALL NOT 顯示「上一頁」連結
- WHEN 使用者位於中間頁面
- THEN SHALL 同時顯示「上一頁」與「下一頁」連結
- WHEN 使用者位於最後一頁
- THEN SHALL 顯示「上一頁」連結
- AND SHALL NOT 顯示「下一頁」連結

#### Scenario: 分頁 URL 格式

- WHEN 使用者瀏覽第二頁
- THEN URL SHALL 為 `/page/2/` 或類似的分頁路徑格式

---

### Requirement: 極簡列表排版

首頁文章列表 SHALL 採用無封面圖、一行一篇的極簡排版方式。

#### Scenario: 無封面圖驗證

- WHEN 檢視首頁文章列表
- THEN 任何文章項目 SHALL NOT 顯示封面圖片或縮圖

#### Scenario: 單行排列驗證

- WHEN 檢視首頁文章列表
- THEN 每篇文章 SHALL 各佔一行（垂直排列）
- AND SHALL NOT 使用網格（grid）或多欄佈局
- AND 整體視覺 SHALL 保持簡潔、乾淨

---

### Requirement: PostCard 可重用元件

文章列表中的每篇文章項目 MUST 使用獨立的 `PostCard` 元件實作，且該元件 SHALL 可在其他頁面重用。

#### Scenario: PostCard 元件獨立性

- WHEN 檢查 `src/components/` 目錄
- THEN SHALL 存在 `PostCard.astro` 元件檔案
- AND 該元件 SHALL 接受文章資料作為 props

#### Scenario: PostCard 元件重用性

- WHEN 在歸檔頁面或分類頁面需要顯示文章列表
- THEN SHALL 能直接引用 `PostCard` 元件
- AND 顯示效果 SHALL 與首頁一致

#### Scenario: PostCard 元件 Props 介面

- WHEN 檢查 `PostCard` 元件的 props 定義
- THEN SHALL 至少接受以下屬性：
  - `title`：文章標題
  - `date`：發佈日期
  - `description`：文章摘要
  - `url`：文章連結路徑
