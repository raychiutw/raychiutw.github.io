## 1. 安裝與設定

- [x] 1.1 安裝 `@sentry/browser` 套件（`pnpm add @sentry/browser`）
- [x] 1.2 建立 `src/utils/sentry.ts` 初始化模組，設定 DSN、環境區分、取樣率與忽略規則

## 2. 整合至頁面

- [x] 2.1 在 `src/layouts/BaseLayout.astro` 的 `</body>` 前加入 Sentry script 載入

## 3. 驗證

- [x] 3.1 執行 `npx astro build` 確認建置成功
- [x] 3.2 執行 `pnpm lint` 確認零錯誤
- [x] 3.3 執行 `pnpm format:check` 確認變更檔案格式正確
- [x] 3.4 確認 dist/ 產出中包含 Sentry SDK 打包內容

## 4. OpenSpec 文件

- [x] 4.1 建立 `proposal.md`
- [x] 4.2 建立 `design.md`
- [x] 4.3 建立 `specs/sentry-integration/spec.md`
- [x] 4.4 建立 `tasks.md` 並勾選完成項目
