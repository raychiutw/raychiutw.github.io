# taxonomy Specification

## Purpose

TBD - created by archiving change rebuild-blog-with-astro. Update Purpose after archive.

## Requirements

### Requirement: 分類頁面

系統 SHALL 提供 `/categories/[category]` 路由，列出該分類下的所有文章。

分類名稱 SHALL 包含：程式開發、應用程式、系統安裝、版本控制、雜記。

每個分類頁面 SHALL 顯示該分類下的文章數量。

系統 MUST 使用 `getStaticPaths` 產生所有分類的靜態路由。

#### Scenario: 使用者進入特定分類頁面

WHEN 使用者存取 `/categories/程式開發`
THEN 頁面 SHALL 列出所有屬於「程式開發」分類的文章
AND 頁面 SHALL 顯示該分類的文章總數

#### Scenario: 分類頁面靜態路由產生

WHEN 網站執行建置流程
THEN 系統 SHALL 透過 `getStaticPaths` 為每個分類產生對應的靜態頁面

---

### Requirement: 標籤頁面

系統 SHALL 提供 `/tags/[tag]` 路由，列出該標籤下的所有文章。

每個標籤頁面 SHALL 顯示該標籤下的文章數量。

系統 MUST 使用 `getStaticPaths` 產生所有標籤的靜態路由。

#### Scenario: 使用者進入特定標籤頁面

WHEN 使用者存取 `/tags/[tag]`
THEN 頁面 SHALL 列出所有帶有該標籤的文章
AND 頁面 SHALL 顯示該標籤的文章總數

#### Scenario: 標籤頁面靜態路由產生

WHEN 網站執行建置流程
THEN 系統 SHALL 透過 `getStaticPaths` 為每個標籤產生對應的靜態頁面

---

### Requirement: 歸檔頁面

系統 SHALL 提供 `/archives` 路由，依年月分組顯示所有文章。

歸檔頁面 SHALL 顯示每個年月分組下的文章數量。

#### Scenario: 使用者進入歸檔頁面

WHEN 使用者存取 `/archives`
THEN 頁面 SHALL 依年月由新至舊分組顯示所有文章
AND 每個年月分組 SHALL 顯示該期間的文章數量

#### Scenario: 歸檔頁面文章排序

WHEN 歸檔頁面載入完成
THEN 同一年月內的文章 SHALL 依發佈日期由新至舊排列
