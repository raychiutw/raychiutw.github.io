# Tasks: Fix GitHub Actions Deploy

- [x] 調查 GitHub Actions 失敗的 root cause（gh run view --log-failed）
- [x] 確認 deploy.yml 和 ci.yml 的 pnpm/action-setup 設定
- [x] 確認 package.json 缺少 packageManager 欄位
- [x] 在 package.json 加入 `"packageManager": "pnpm@10.32.1"`
- [x] 確認 deploy.yml workflow YAML 語法正確
- [x] 確認 ci.yml workflow YAML 語法正確
- [x] 本地執行 astro build 驗證
- [x] 建立 OpenSpec 文件（proposal, design, spec, tasks）
- [ ] 提醒使用者手動調整 GitHub Pages Settings（Source 改為 GitHub Actions）
- [ ] Push 後確認 GitHub Actions workflow 成功
