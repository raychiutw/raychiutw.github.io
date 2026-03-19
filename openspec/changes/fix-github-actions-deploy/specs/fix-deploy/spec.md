# Spec: Fix Deploy Workflow

## Requirements

1. `pnpm/action-setup@v4` 必須能正確偵測 pnpm 版本
2. `Deploy to GitHub Pages` workflow（deploy.yml）push master 後應成功執行
3. `CI` workflow（ci.yml）PR 時應成功執行
4. `pages-build-deployment` 不應再被觸發（需手動調整設定）

## Changes

### package.json

新增 `packageManager` 欄位：
```json
"packageManager": "pnpm@10.32.1"
```

### GitHub repo Settings（手動）

Settings > Pages > Build and deployment > Source: "GitHub Actions"

## Verification Scenarios

### Scenario 1: 本地 build 成功
- 執行 `npx astro build`
- 預期：build 正常完成，產生 `dist/` 目錄

### Scenario 2: deploy.yml workflow 成功
- Push commit 到 master
- 預期：GitHub Actions `Deploy to GitHub Pages` workflow 全部 step 通過

### Scenario 3: ci.yml workflow 成功
- 開 PR 到 master
- 預期：GitHub Actions `CI` workflow 全部 step 通過

### Scenario 4: pages-build-deployment 不再觸發
- 確認 GitHub Pages Source 已改為 "GitHub Actions"
- 預期：push 後不再出現 `pages-build-deployment` workflow run
