# Design: Fix GitHub Actions Deploy

## Root Cause Analysis

### 問題 1: pnpm 版本未指定

`deploy.yml` 和 `ci.yml` 都使用 `pnpm/action-setup@v4`，但未設定 `version` 參數：

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  # 缺少 version 參數
```

同時 `package.json` 也沒有 `packageManager` 欄位。`pnpm/action-setup@v4` 會依序檢查：
1. Action input 的 `version`
2. `package.json` 的 `packageManager`

兩者皆無，因此直接報錯。

### 問題 2: pages-build-deployment 衝突

GitHub Pages 預設會啟用 `pages-build-deployment` workflow（從 branch 部署靜態檔案）。
當自訂的 `deploy.yml` 也嘗試部署到 GitHub Pages 時，兩個 workflow 會衝突。

需要在 GitHub repo Settings > Pages 將 "Build and deployment" 的 Source 從 "Deploy from a branch" 改為 "GitHub Actions"，這樣 `pages-build-deployment` 就不會再觸發。

## Fix Plan

### 修復 1: 在 package.json 加入 packageManager

在 `package.json` 加入：
```json
"packageManager": "pnpm@10.32.1"
```

選擇此方案而非在 workflow YAML 中硬寫 version，原因：
- 單一來源（Single source of truth）
- 本地開發環境也可受益（corepack 會使用此欄位）
- 兩個 workflow 都自動取用，無需分別維護

### 修復 2: 手動調整 GitHub Pages 設定

使用者需至 GitHub repo Settings > Pages > Build and deployment，將 Source 改為 "GitHub Actions"。
