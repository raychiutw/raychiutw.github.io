# Design: integrate-sentry

## 架構決策

### 使用 @sentry/browser 而非 @sentry/astro

選用輕量的 `@sentry/browser` SDK，避免 `@sentry/astro` 帶入過多不必要的伺服器端依賴。本站為純靜態輸出（static output），僅需前端錯誤捕捉。

### 初始化模組設計

建立 `src/utils/sentry.ts` 作為統一初始化進入點：

- **DSN**：硬編碼於模組中（公開金鑰，非機密資訊）
- **環境區分**：透過 `import.meta.env.PROD` 自動判斷 production / development
- **啟用控制**：`enabled: import.meta.env.PROD`，開發環境不送錯誤
- **取樣率**：`sampleRate: 1.0`，捕捉所有錯誤
- **忽略規則**：過濾 `ResizeObserver loop` 與 `Non-Error promise rejection` 等非關鍵錯誤

### 載入方式

在 `BaseLayout.astro` 的 `</body>` 前加入 `<script>` 標籤匯入 Sentry 模組。不使用 `is:inline`，讓 Astro 的 Vite 打包機制處理 import，實現 tree-shaking 與程式碼分割。

## 檔案變更

| 檔案                           | 變更類型 | 說明                        |
| ------------------------------ | -------- | --------------------------- |
| `package.json`                 | 修改     | 新增 `@sentry/browser` 依賴 |
| `src/utils/sentry.ts`          | 新增     | Sentry 初始化模組           |
| `src/layouts/BaseLayout.astro` | 修改     | 載入 Sentry script          |
