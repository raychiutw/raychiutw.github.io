## 1. 環境設定

- [x] 1.1 安裝 `@google-analytics/data` 開發依賴（影響檔案：`package.json`、`pnpm-lock.yaml`）
- [x] 1.2 建立 `daily-report` GitHub Label（影響檔案：GitHub repo settings）

## 2. 報告產生腳本

- [x] 2.1 建立 `scripts/daily-report.mjs`，實作 Sentry 昨日錯誤收集（影響檔案：`scripts/daily-report.mjs`）
- [x] 2.2 實作 GitHub Actions 失敗 runs 收集（影響檔案：`scripts/daily-report.mjs`）
- [x] 2.3 實作壞連結檢查（sitemap HEAD request）（影響檔案：`scripts/daily-report.mjs`）
- [x] 2.4 實作 Lighthouse / PageSpeed Insights 分數收集（影響檔案：`scripts/daily-report.mjs`）
- [x] 2.5 實作 GA4 昨日流量收集（影響檔案：`scripts/daily-report.mjs`）
- [x] 2.6 實作 HTML 報告與純文字摘要產生（影響檔案：`scripts/daily-report.mjs`）

## 3. GitHub Actions Workflow

- [x] 3.1 建立 `.github/workflows/daily-report.yml`，設定排程、環境變數、報告產生步驟（影響檔案：`.github/workflows/daily-report.yml`）
- [x] 3.2 設定 Email 寄送步驟（dawidd6/action-send-mail@v3）（影響檔案：`.github/workflows/daily-report.yml`）
- [x] 3.3 設定 GitHub Issue 建立步驟（影響檔案：`.github/workflows/daily-report.yml`）

## 4. 驗證

- [x] 4.1 確認 workflow YAML 語法正確（影響檔案：`.github/workflows/daily-report.yml`）
- [x] 4.2 確認腳本可在 Node.js 20 環境下正常載入（影響檔案：`scripts/daily-report.mjs`）
