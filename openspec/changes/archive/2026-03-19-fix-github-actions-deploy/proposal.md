# Proposal: Fix GitHub Actions Deploy

## Why

Push 到 master 後，GitHub Actions 的 `Deploy to GitHub Pages` 和 `CI` workflow 全部失敗。
錯誤訊息為：`Error: No pnpm version is specified.`

`pnpm/action-setup@v4` 要求必須透過以下方式之一指定 pnpm 版本：

1. GitHub Action config 的 `version` 參數
2. `package.json` 的 `packageManager` 欄位

目前兩者皆未設定，導致 workflow 在 "Setup pnpm" 步驟即失敗。

此外，`pages-build-deployment` workflow（GitHub Pages 預設的 branch 部署方式）也同時在執行，與自訂的 `deploy.yml` 產生衝突。

## What Changes

1. 在 `package.json` 加入 `"packageManager": "pnpm@10.32.1"` 欄位
2. 提醒使用者至 GitHub repo Settings > Pages > Build and deployment 將來源改為 "GitHub Actions"

## Impact

- `package.json` - 新增 packageManager 欄位
- `.github/workflows/deploy.yml` - 無需修改，修復後可正常運行
- `.github/workflows/ci.yml` - 無需修改，修復後可正常運行
- GitHub repo Settings - 需手動將 Pages 部署來源改為 GitHub Actions
