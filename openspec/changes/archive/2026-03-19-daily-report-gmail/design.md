## Context

Ray's Notes 部落格部署於 GitHub Pages，已整合 Sentry 錯誤追蹤、GitHub Actions CI/CD、GA4 流量分析。目前缺乏統一的每日健康檢查機制，維運者需手動查看多個服務 dashboard。本設計透過 GitHub Actions 排程觸發一支 Node.js 腳本，自動彙整五項指標並透過 email 與 GitHub Issue 送達。

## Goals / Non-Goals

**Goals:**

- 每日自動收集 Sentry 昨日錯誤、GitHub Actions 失敗 runs、壞連結、Lighthouse 分數、GA4 昨日流量
- 產生格式化 HTML email 報告，寄送至指定信箱
- 同步建立 GitHub Issue 作為報告備份
- 支援手動觸發（workflow_dispatch）方便測試

**Non-Goals:**

- 不做即時告警（Slack/webhook 通知）
- 不儲存歷史報告資料（僅 Issue 備份）
- 不做報告的 web dashboard 介面

## Decisions

### 1. 使用單一 ESM 腳本而非多個模組

**選擇：** 單一 `scripts/daily-report.mjs` 檔案
**理由：** 五項資料收集邏輯各自獨立且簡單，不需要模組化拆分。單一檔案易於維護與除錯。
**替代方案：** 拆分為 `scripts/collectors/*.mjs` + `scripts/report-builder.mjs`，但增加複雜度且收益有限。

### 2. 直接使用 fetch 而非安裝 SDK

**選擇：** Sentry API、GitHub API、PageSpeed Insights API 均使用 Node.js 內建 fetch
**理由：** 減少依賴套件數量，這些 API 呼叫都是簡單的 GET request，不需要 SDK 封裝。
**例外：** GA4 需要 service account JWT 認證，使用 `@google-analytics/data` SDK 處理認證流程。

### 3. 壞連結檢查使用 sitemap

**選擇：** 從 sitemap.xml 取得所有 URL，對每個 URL 做 HEAD request
**理由：** sitemap 已由 `@astrojs/sitemap` 自動產生，涵蓋所有公開頁面。HEAD request 比 GET 輕量。
**風險：** sitemap 可能不包含所有內部連結（如文章內的外部連結），但足以覆蓋主要頁面。

### 4. HTML 報告使用 template literal

**選擇：** 在腳本中使用 JavaScript template literal 組合 HTML
**理由：** 報告結構固定，不需要模板引擎。inline CSS 確保 email 客戶端相容性。

### 5. Email 寄送使用 GitHub Action

**選擇：** 使用 `dawidd6/action-send-mail@v3` Action
**理由：** 成熟的社群 Action，支援 HTML body from file、Gmail SMTP，無需在腳本中處理 SMTP。

## Risks / Trade-offs

- [Sentry API rate limit] → 僅取 Top 5 issues，單次 request，不會觸發限流
- [PageSpeed Insights API 延遲] → 單次分析可能需 10-30 秒，但在 CI 環境可接受
- [壞連結檢查 timeout] → 設定每個 HEAD request 5 秒 timeout，避免整體執行時間過長
- [GA4 service account key 安全性] → 儲存於 GitHub Secrets，透過環境變數傳入，不會出現在 log 中
- [外部服務不可用] → 每項收集任務獨立 try/catch，單項失敗不影響其他項目，報告中標示為「無法取得」

## Open Questions

- 是否需要設定報告的失敗重試機制？目前設計為單次執行，失敗則該日無報告。
