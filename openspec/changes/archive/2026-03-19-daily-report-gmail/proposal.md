## Why

目前缺乏自動化的網站健康監控機制，需要手動逐一檢查 Sentry 錯誤、GitHub Actions 狀態、壞連結、Lighthouse 分數和 GA4 流量。建立每日報告自動化流程，每天台灣時間 08:00 彙整五項關鍵指標，透過 Gmail 寄送 HTML 報告並建立 GitHub Issue 備份，讓維運狀況一目了然。

## What Changes

- 新增 `scripts/daily-report.mjs` ESM Node.js 腳本，負責收集五項資料（Sentry 錯誤、GitHub Actions 失敗、壞連結、Lighthouse 分數、GA4 流量）並產生 HTML 報告與純文字摘要
- 新增 `.github/workflows/daily-report.yml` GitHub Actions workflow，每日 UTC 00:00 排程執行，並支援手動觸發
- 透過 `dawidd6/action-send-mail@v3` 寄送 HTML email 至 lean.lean@gmail.com
- 透過 `gh issue create` 建立 GitHub Issue 備份，使用 `daily-report` label
- 新增 `@google-analytics/data` 開發依賴，用於 GA4 API 查詢

## Capabilities

### New Capabilities

- `daily-report`: 每日自動化報告收集、產生、寄送與備份的完整流程

### Modified Capabilities

## Impact

- 新增檔案：`scripts/daily-report.mjs`、`.github/workflows/daily-report.yml`
- 修改檔案：`package.json`（新增 devDependency）
- 依賴 GitHub Secrets：`SENTRY_AUTH_TOKEN`、`SENTRY_ORG`、`SENTRY_PROJECT`、`GA4_PROPERTY_ID`、`GA4_SERVICE_ACCOUNT_KEY`、`GMAIL_USERNAME`、`GMAIL_APP_PASSWORD`
- 外部 API：Sentry API、GitHub Actions API、Google PageSpeed Insights API、GA4 Data API、Gmail SMTP
- 新增 GitHub Label：`daily-report`
