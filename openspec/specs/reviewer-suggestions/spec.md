# Spec: Reviewer Suggestions

## ADDED Requirements

### Requirement: Google Search Console 驗證檔案必須存在

系統 SHALL 在 `public/` 目錄下包含 `googlefebc379374f1e9b3.html` 驗證檔案，使得 Astro build 後該檔案出現在 `dist/` 輸出目錄中。

#### Scenario: Build 後驗證檔案存在

- Given 專案包含 `public/googlefebc379374f1e9b3.html`
- When 執行 `npx astro build`
- Then `dist/googlefebc379374f1e9b3.html` MUST 存在且內容為 Google 驗證標準格式

### Requirement: @ts-ignore 必須有 TODO 追蹤註解

`src/components/Giscus.astro` 中的 `@ts-ignore` 註解旁 SHALL 包含 TODO 註解，說明移除 `@ts-ignore` 的條件。

#### Scenario: 開發者可追蹤 @ts-ignore 移除時機

- Given Giscus.astro 中存在 `@ts-ignore` 註解
- When 開發者查看程式碼
- Then MUST 看到對應的 TODO 註解說明何時可移除 `@ts-ignore`

### Requirement: 專案必須統一使用 LF 換行符

專案根目錄 SHALL 包含 `.gitattributes` 檔案，強制所有文字檔使用 LF 換行，並將圖片格式標記為 binary。

#### Scenario: 跨平台換行符一致

- Given 專案包含 `.gitattributes` 設定 `* text=auto eol=lf`
- When 任何平台上 checkout 程式碼
- Then 所有文字檔 MUST 使用 LF 換行符
