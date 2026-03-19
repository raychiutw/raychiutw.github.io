# ai-agent-team-article Specification

## Purpose
TBD - created by archiving change write-ai-agent-team-article. Update Purpose after archive.
## Requirements
### Requirement: 文章 Frontmatter
文章 MUST 包含符合 Content Collection schema 的 frontmatter。tags 陣列的第一個元素 MUST 為「AI生成」。category MUST 為「程式開發」。postSlug MUST 為 "ai-agent-team-rebuild-blog"。

#### Scenario: Frontmatter 驗證
- **WHEN** astro build 執行
- **THEN** 文章 frontmatter 通過 Zod schema 驗證，無錯誤

### Requirement: 文章內容完整性
文章 MUST 涵蓋以下主題：AI Agent 團隊組成、OpenSpec 開發流程、實戰過程、遇到的問題與解決、成果數據。文章長度 SHALL 為 1500-2500 字。

#### Scenario: 內容涵蓋
- **WHEN** 讀者閱讀文章
- **THEN** 能理解 AI Agent 團隊協作開發的完整流程和實際成果

### Requirement: 參考連結
文章 MUST 包含 Facebook 原始貼文連結作為參考。

#### Scenario: 連結有效
- **WHEN** 文章內提及 Facebook 貼文
- **THEN** 附上原始連結 https://www.facebook.com/share/p/1FVqM4pjjk/

