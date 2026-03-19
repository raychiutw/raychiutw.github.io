# edit-article Specification

## Purpose

TBD - created by archiving change edit-ai-agent-article. Update Purpose after archive.

## Requirements

### Requirement: 文章不得包含 Facebook 連結

文章 `ai-agent-team-rebuild-blog.md` MUST NOT 包含任何指向 `facebook.com` 的超連結。

#### Scenario: 讀者閱讀文章時不會遇到 Facebook 連結

- Given 文章已完成編輯
- When 讀者開啟文章頁面
- Then 頁面中 SHALL 不存在任何 `https://www.facebook.com` 開頭的連結

### Requirement: 移除僅含 Facebook 連結的參考段落

若「參考」段落中所有條目皆為 Facebook 連結，該段落 MUST 被完整移除。

#### Scenario: 文章底部不再顯示空的參考區塊

- Given 原「參考」段落僅包含一筆 Facebook 連結
- When 編輯完成後
- Then 文章 SHALL 不包含 `## 參考` 標題及其下方的 Facebook 連結項目

### Requirement: 文章內文中的 Facebook 提及須改寫

文章正文中提及 Facebook 平台的句子 MUST 改寫為不指向特定平台的版本，且語意 SHALL 保持通順。

#### Scenario: 結語段落改寫後語意完整

- Given 原文為「用我在 Facebook 上的那句話來總結」
- When 改寫完成後
- Then 該句 SHALL 讀作「用我當時的一句感想來總結」，語氣與前後文保持一致

### Requirement: Frontmatter 格式正確

文章的 frontmatter MUST 符合 Content Collection schema，且 `tags` 陣列的第一個元素 SHALL 為 `'AI生成'`。

#### Scenario: Frontmatter 驗證通過

- Given 文章編輯完成
- When 檢查 frontmatter
- Then `tags` 的第一個值 SHALL 為 `'AI生成'`
- And `title`、`description`、`date`、`category`、`postSlug` 欄位 MUST 皆存在且非空
