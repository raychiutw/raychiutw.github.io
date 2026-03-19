## Why

部落格目前缺乏前端錯誤追蹤機制，無法即時得知使用者遇到的 JavaScript 錯誤。整合 Sentry 可在 production 環境自動捕捉並回報前端錯誤，幫助快速定位與修復問題。

## What Changes

- 新增 `@sentry/browser` 套件作為前端錯誤追蹤 SDK
- 建立 `src/utils/sentry.ts` 初始化模組，設定 DSN、環境區分、取樣率與忽略規則
- 在 `BaseLayout.astro` 載入 Sentry 模組，透過 Astro 打包機制自動注入所有頁面

## Capabilities

### New Capabilities

- `sentry-integration`: 前端錯誤自動捕捉與回報至 Sentry 平台

### Modified Capabilities

（無）

## Impact

- 新增依賴：`@sentry/browser`
- 受影響檔案：`src/utils/sentry.ts`（新增）、`src/layouts/BaseLayout.astro`（修改）、`package.json`（修改）
- 打包產出增加約 27 kB（gzip），僅在 production 環境啟用
