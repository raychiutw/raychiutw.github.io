## 1. ESLint 10 升級

- [x] 1.1 更新 package.json 中 eslint 版本至 ^10.0.0，安裝 @eslint/js【檔案：package.json】
- [x] 1.2 建立 eslint.config.js（flat config），遷移 .eslintrc.cjs 中的所有設定【檔案：eslint.config.js】
- [x] 1.3 刪除 .eslintrc.cjs【檔案：.eslintrc.cjs】
- [x] 1.4 更新 package.json lint script：移除 --ext flag【檔案：package.json】

## 2. 驗證

- [x] 2.1 執行 pnpm install 確認安裝成功【檔案：pnpm-lock.yaml】
- [x] 2.2 執行 pnpm lint 確認無錯誤【檔案：全專案】
- [x] 2.3 執行 pnpm build 確認建置正常【檔案：全專案】
- [x] 2.4 執行 pnpm format:check 確認格式正確【檔案：全專案】
