## MODIFIED Requirements

### Requirement: Pipeline 步驟

Pipeline MUST 依序執行以下步驟：`pnpm install` → `ESLint 10`（使用 flat config）→ `Prettier check` → `astro check`（TypeScript 型別檢查）→ `astro build` → `Vitest`（單元測試）→ `Playwright`（E2E 測試）。

#### Scenario: 完整 Pipeline 執行

- WHEN Pipeline 被觸發
- THEN 所有步驟 SHALL 依照指定順序執行，ESLint 步驟 SHALL 使用 ESLint 10 flat config 格式
