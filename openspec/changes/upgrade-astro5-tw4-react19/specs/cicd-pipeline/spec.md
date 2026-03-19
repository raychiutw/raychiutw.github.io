## MODIFIED Requirements

### Requirement: Pipeline 步驟

Pipeline MUST 依序執行以下步驟：`pnpm install` → `ESLint` → `Prettier check` → `astro check`（TypeScript 型別檢查，使用 @astrojs/check 0.9.x）→ `astro build` → `Vitest`（單元測試）→ `Playwright`（E2E 測試）。

#### Scenario: 完整 Pipeline 執行

- WHEN Pipeline 被觸發
- THEN 所有步驟 SHALL 依照指定順序執行，每個步驟的輸出與結果 SHALL 可在 GitHub Actions 介面中檢視

### Requirement: 部署設定

部署 MUST 使用 `actions/deploy-pages@v4`，Node.js 版本 SHALL 為 20 LTS。所有 Astro 5 + Tailwind 4 + React 19 相關依賴 SHALL 能在 Node.js 20 環境下正常安裝與建置。

#### Scenario: 部署環境

- WHEN Pipeline 執行部署步驟
- THEN SHALL 使用 `actions/deploy-pages@v4` action 與 Node.js 20 LTS 環境
- AND `pnpm build` SHALL 在 Node.js 20 環境下成功完成
