## ADDED Requirements

### Requirement: ESLint 10 flat config 格式

專案 MUST 使用 ESLint 10 的 flat config 格式，設定檔 SHALL 為 `eslint.config.js`。

#### Scenario: Flat config 檔案存在

- **WHEN** 檢查專案根目錄
- **THEN** `eslint.config.js` SHALL 存在
- **AND** `.eslintrc.cjs` SHALL 不存在

#### Scenario: ESLint 版本驗證

- **WHEN** 檢查 `package.json` 的 devDependencies
- **THEN** `eslint` 版本 SHALL 為 10.x

### Requirement: Lint 規則一致性

升級後的 lint 規則 MUST 與升級前保持一致，包含 eslint:recommended、plugin:astro/recommended、plugin:@typescript-eslint/recommended。

#### Scenario: 規則涵蓋範圍

- **WHEN** 檢查 `eslint.config.js` 設定
- **THEN** SHALL 包含 eslint recommended 規則
- **AND** SHALL 包含 astro recommended 規則
- **AND** SHALL 包含 @typescript-eslint recommended 規則
- **AND** SHALL 設定 `@typescript-eslint/no-explicit-any` 為 error

### Requirement: 檔案類型覆蓋

ESLint MUST 覆蓋 .js、.ts、.tsx、.astro 四種檔案類型。

#### Scenario: 各檔案類型使用正確 parser

- **WHEN** 檢查 flat config 中的檔案覆寫設定
- **THEN** `.astro` 檔案 SHALL 使用 `astro-eslint-parser`
- **AND** `.ts`、`.tsx` 檔案 SHALL 使用 `@typescript-eslint/parser`

### Requirement: Ignore patterns 遷移

Flat config MUST 包含與原設定等效的 ignore patterns。

#### Scenario: Ignore patterns 驗證

- **WHEN** 檢查 `eslint.config.js` 的 ignores 設定
- **THEN** SHALL 忽略 `dist/`、`.astro/`、`node_modules/`、`playwright-report/`、`test-results/`

### Requirement: Lint script 更新

`package.json` 中的 lint script MUST 移除 `--ext` flag，改為純 `eslint .`。

#### Scenario: Lint script 驗證

- **WHEN** 檢查 `package.json` 的 scripts.lint
- **THEN** SHALL 為 `eslint .`（不含 `--ext`）

#### Scenario: Lint 執行成功

- **WHEN** 執行 `pnpm lint`
- **THEN** SHALL 無任何錯誤
