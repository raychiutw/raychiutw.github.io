# daily-report Specification

## Purpose
TBD - created by archiving change daily-report-gmail. Update Purpose after archive.
## Requirements
### Requirement: 每日排程觸發報告產生

系統 SHALL 在每日 UTC 00:00（台灣時間 08:00）自動觸發報告產生流程，同時 MUST 支援手動觸發（workflow_dispatch）。

#### Scenario: 排程自動觸發

- **WHEN** UTC 時間到達 00:00
- **THEN** GitHub Actions 自動執行 daily-report workflow

#### Scenario: 手動觸發

- **WHEN** 使用者在 GitHub Actions 頁面點選 Run workflow
- **THEN** 立即執行 daily-report workflow

### Requirement: 收集 Sentry 昨日錯誤

系統 SHALL 透過 Sentry API 取得過去 24 小時的 Top 5 錯誤，包含 title、count、link。

#### Scenario: 成功取得 Sentry 錯誤

- **WHEN** Sentry API 回應正常
- **THEN** 報告中顯示 Top 5 錯誤的標題、發生次數、連結

#### Scenario: Sentry API 不可用

- **WHEN** Sentry API 回應異常或 timeout
- **THEN** 報告中該區塊顯示「無法取得 Sentry 資料」，不影響其他區塊

### Requirement: 收集 GitHub Actions 失敗 runs

系統 SHALL 透過 GitHub API 取得最近 24 小時內的失敗 workflow runs。

#### Scenario: 有失敗的 runs

- **WHEN** 最近 24 小時內存在失敗的 workflow runs
- **THEN** 報告中列出每個失敗 run 的 workflow 名稱、分支、連結

#### Scenario: 無失敗的 runs

- **WHEN** 最近 24 小時內無失敗的 workflow runs
- **THEN** 報告中顯示「過去 24 小時無失敗的 Actions runs」

### Requirement: 壞連結檢查

系統 SHALL 從 sitemap 取得所有 URL，對每個 URL 執行 HEAD request，回報非 200 狀態碼的連結。

#### Scenario: 發現壞連結

- **WHEN** 某些 URL 的 HEAD request 回應非 200
- **THEN** 報告中列出壞連結的 URL 與 HTTP 狀態碼

#### Scenario: 所有連結正常

- **WHEN** 所有 URL 的 HEAD request 回應 200
- **THEN** 報告中顯示「所有連結正常」

#### Scenario: 連結檢查 timeout

- **WHEN** HEAD request 超過 5 秒未回應
- **THEN** 該連結標記為 timeout 並列入報告

### Requirement: Lighthouse 分數檢查

系統 SHALL 透過 Google PageSpeed Insights API 取得四項 Lighthouse 分數：Performance、Accessibility、Best Practices、SEO。

#### Scenario: 成功取得分數

- **WHEN** PageSpeed Insights API 回應正常
- **THEN** 報告中以顏色標示分數（>=90 綠色、>=50 黃色、<50 紅色）

#### Scenario: PageSpeed API 不可用

- **WHEN** PageSpeed Insights API 回應異常
- **THEN** 報告中該區塊顯示「無法取得 Lighthouse 資料」

### Requirement: 收集 GA4 昨日流量

系統 SHALL 透過 GA4 Data API 取得昨日的 activeUsers、screenPageViews、bounceRate、averageSessionDuration。

#### Scenario: 成功取得 GA4 資料

- **WHEN** GA4 API 回應正常且有資料
- **THEN** 報告中顯示四項指標數值

#### Scenario: GA4 API 不可用

- **WHEN** GA4 API 回應異常或認證失敗
- **THEN** 報告中該區塊顯示「無法取得 GA4 資料」

### Requirement: 產生 HTML 報告

系統 MUST 將收集到的五項資料組合為 HTML 格式報告，標題為「Ray's Notes 每日報告 - YYYY-MM-DD」，包含五個區塊表格，底部附各服務連結。

#### Scenario: 報告產生成功

- **WHEN** 報告產生腳本執行完成
- **THEN** HTML 報告寫入 `/tmp/daily-report.html`，純文字摘要寫入 `/tmp/daily-report-summary.txt`

### Requirement: 寄送 Email 報告

系統 SHALL 透過 Gmail SMTP 將 HTML 報告寄送至 lean.lean@gmail.com。

#### Scenario: Email 寄送成功

- **WHEN** Gmail SMTP 連線正常且認證通過
- **THEN** 收件者收到主旨為「Ray's Notes 每日報告 - YYYY-MM-DD」的 HTML email

### Requirement: 建立 GitHub Issue 備份

系統 SHALL 使用報告純文字摘要建立 GitHub Issue，標題為「每日報告 - YYYY-MM-DD」，使用 `daily-report` label。

#### Scenario: Issue 建立成功

- **WHEN** GitHub Token 有效且 label 存在
- **THEN** 在 repository 建立帶有 `daily-report` label 的 Issue

