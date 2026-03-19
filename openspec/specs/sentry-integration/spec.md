# sentry-integration Specification

## Purpose

TBD - created by archiving change integrate-sentry. Update Purpose after archive.

## Requirements

### Requirement: Sentry SDK 初始化

系統 MUST 在每個頁面載入時初始化 Sentry SDK，使用指定的 DSN 連線至 Sentry 平台。

#### Scenario: Production 環境初始化

- **WHEN** 使用者在 production 環境載入任意頁面
- **THEN** Sentry SDK MUST 以指定 DSN 完成初始化，environment 設為 `production`

#### Scenario: Development 環境停用

- **WHEN** 開發者在 development 環境載入頁面
- **THEN** Sentry SDK MUST 設定 `enabled: false`，不送出任何錯誤報告

### Requirement: 前端錯誤自動捕捉

系統 MUST 自動捕捉所有未處理的 JavaScript 錯誤與 Promise rejection，並回報至 Sentry。

#### Scenario: 未處理的 JavaScript 錯誤

- **WHEN** 頁面發生未被 try-catch 捕捉的 JavaScript 錯誤
- **THEN** Sentry MUST 自動捕捉該錯誤並送出至 Sentry 平台

#### Scenario: 未處理的 Promise rejection

- **WHEN** 頁面發生未處理的 Promise rejection
- **THEN** Sentry MUST 自動捕捉該 rejection 並送出至 Sentry 平台

### Requirement: 非關鍵錯誤過濾

系統 MUST 忽略已知的非關鍵錯誤，避免產生不必要的噪音。

#### Scenario: ResizeObserver loop 錯誤

- **WHEN** 瀏覽器觸發 ResizeObserver loop 相關錯誤
- **THEN** Sentry MUST 忽略該錯誤，不送出報告

#### Scenario: Non-Error promise rejection

- **WHEN** 發生 Non-Error promise rejection
- **THEN** Sentry MUST 忽略該錯誤，不送出報告

### Requirement: 不阻塞首屏渲染

Sentry SDK 的載入 MUST 不阻塞頁面的首屏渲染。

#### Scenario: 頁面載入效能

- **WHEN** 使用者載入頁面
- **THEN** Sentry script MUST 放置於 `</body>` 前，由 Astro 打包處理，不使用 `is:inline` 且不阻塞 DOM 解析
