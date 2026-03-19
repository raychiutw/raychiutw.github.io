# content-migration Specification

## Purpose

TBD - created by archiving change rebuild-blog-with-astro. Update Purpose after archive.

## Requirements

### Requirement: 文章遷移數量與存放位置

所有現有 Hexo 部落格文章 SHALL 遷移至 Astro 內容集合，共計 30 篇文章 MUST 全數遷移至 `src/content/blog/` 目錄。

#### Scenario: 文章數量驗證

- WHEN 檢查 `src/content/blog/` 目錄中的 Markdown 檔案數量
- THEN SHALL 至少包含 30 個 `.md` 或 `.mdx` 檔案
- AND 每個檔案 SHALL 為獨立的部落格文章

#### Scenario: 原始文章完整性

- WHEN 比對原始 Hexo 文章與遷移後的文章
- THEN 每篇文章的主要內容 SHALL 完整保留，不得遺漏段落或程式碼區塊

---

### Requirement: Frontmatter Schema 定義

文章的 frontmatter MUST 使用 Zod schema 進行定義與驗證，確保所有欄位型別正確。

#### Scenario: Zod Schema 欄位驗證

- WHEN 檢查內容集合的 schema 定義
- THEN SHALL 包含以下必要欄位：
  - `title`：字串型別，MUST 為必填
  - `description`：字串型別，MUST 為必填
  - `date`：日期型別，MUST 為必填
  - `category`：字串型別
  - `tags`：字串陣列型別
  - `slug`：字串型別

#### Scenario: Frontmatter 驗證失敗處理

- WHEN 某篇文章的 frontmatter 缺少必要欄位
- THEN 建置過程 SHALL 拋出明確的驗證錯誤訊息
- AND 建置 SHALL 失敗，不產生錯誤頁面

---

### Requirement: 檔名命名規則

所有遷移後的 Markdown 檔案 MUST 使用 kebab-case 命名。

#### Scenario: 檔名格式驗證

- WHEN 檢查 `src/content/blog/` 中所有檔案名稱
- THEN 每個檔名 SHALL 僅包含小寫英文字母、數字與連字號（`-`）
- AND SHALL NOT 包含空格、底線、大寫字母或中文字元

#### Scenario: 檔名範例

- WHEN 一篇標題為「Docker 學習筆記」的文章遷移完成
- THEN 檔名 SHALL 類似 `docker-learning-notes.md`

---

### Requirement: URL 路徑格式保持一致

遷移後的文章 URL MUST 保持與原 Hexo 部落格相同的 `/YYYY/MM/DD/slug/` 格式，以避免既有連結失效。

#### Scenario: URL 路徑格式驗證

- WHEN 建置完成後檢查任一文章頁面 URL
- THEN URL SHALL 符合 `/YYYY/MM/DD/slug/` 格式
- AND 年月日 SHALL 與文章 frontmatter 中的 `date` 欄位一致

#### Scenario: 舊連結相容性

- WHEN 使用者透過原始 Hexo 文章 URL 存取
- THEN SHALL 能正確到達對應的文章頁面

---

### Requirement: 圖片資源遷移

所有文章中引用的圖片 MUST 搬移至 `public/images/` 目錄，並更新文章中的圖片路徑。

#### Scenario: 圖片存放位置驗證

- WHEN 檢查所有文章引用的圖片
- THEN 圖片檔案 SHALL 存在於 `public/images/` 目錄或其子目錄中

#### Scenario: 圖片路徑正確性

- WHEN 建置完成後檢視包含圖片的文章
- THEN 所有圖片 SHALL 正確顯示，無任何 404 錯誤
- AND 圖片 `src` 屬性 SHALL 以 `/images/` 開頭

---

### Requirement: 全部文章建置與渲染正確性

所有遷移後的文章 MUST 能成功建置且渲染結果正確無誤。

#### Scenario: 建置通過驗證

- WHEN 執行 `pnpm build`
- THEN 建置 SHALL 成功完成，無任何錯誤
- AND 所有 30 篇文章 SHALL 各自產生對應的 HTML 檔案

#### Scenario: 渲染內容正確性

- WHEN 檢視任一建置後的文章 HTML
- THEN Markdown 內容 SHALL 正確轉換為 HTML
- AND 程式碼區塊 SHALL 保留語法高亮標記
- AND 標題層級 SHALL 與原始 Markdown 一致
