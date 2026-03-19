## Why

延續 Astro 5 升版後，將所有依賴一次升至最新穩定版。ESLint 8 已 deprecated 需升至 10（flat config）。Astro 6 已發佈帶來 Vite 7、Zod v4、Shiki v4 等升級。全面更新確保技術棧處於最新狀態。

## What Changes

- **BREAKING** 升級 Astro 5.x → 6.0.6（需 Node 22+、Zod v4、Shiki v4）
- **BREAKING** 升級 ESLint 8.57.1 → 10.x，遷移至 flat config
- **BREAKING** Node.js 20 → 22（Astro 6 要求）
- 升級 Vitest 2.x → 4.x
- 升級所有 @astrojs/\* 至最新穩定版
- 升級所有 devDependencies 至最新穩定版
- 遷移 `.eslintrc.cjs` → `eslint.config.js`
- 遷移 Zod import：`astro:content` → `astro/zod`

## Capabilities

### New Capabilities

- `eslint-flat-config`: 遷移至 ESLint 10 flat config 格式
- `astro6-upgrade`: Astro 6 升級，包含 Zod v4 遷移、Node 22 需求

### Modified Capabilities

- `astro-project-setup`: Astro 版本升至 6.x、Node 22
- `cicd-pipeline`: CI Node 版本升至 22、ESLint 10 flat config

## Impact

- **Node.js**：CI workflows 需從 Node 20 改為 Node 22
- **設定檔**：`.eslintrc.cjs` → `eslint.config.js`、Content config Zod import
- **依賴**：package.json 全面更新
- **CI/CD**：ci.yml、deploy.yml 的 Node 版本
