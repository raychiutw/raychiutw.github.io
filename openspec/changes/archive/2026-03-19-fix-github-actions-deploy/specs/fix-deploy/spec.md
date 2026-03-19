## ADDED Requirements

### Requirement: packageManager 欄位
package.json MUST 包含 `packageManager` 欄位，指定精確的 pnpm 版本（如 `pnpm@10.32.1`），作為 `pnpm/action-setup@v4` 自動偵測版本的 single source of truth。

#### Scenario: CI 正確安裝 pnpm
- **WHEN** GitHub Actions 執行 `pnpm/action-setup@v4`
- **THEN** 自動讀取 `package.json` 的 `packageManager` 欄位並安裝對應版本的 pnpm

### Requirement: GitHub Pages Source 設定
GitHub repo 的 Pages Source MUST 設為 "GitHub Actions"（非 "Deploy from a branch"），以配合 `actions/deploy-pages@v4` 部署。

#### Scenario: 部署不衝突
- **WHEN** push 到 master
- **THEN** 僅觸發自訂的 `Deploy to GitHub Pages` workflow，不觸發 `pages-build-deployment`

### Requirement: Workflow 完整執行
deploy.yml 和 ci.yml 的所有步驟（install → lint → format:check → astro check → astro build → pagefind）MUST 全部通過。

#### Scenario: deploy workflow 成功
- **WHEN** push commit 到 master
- **THEN** GitHub Actions `Deploy to GitHub Pages` workflow 所有 step 為 green
