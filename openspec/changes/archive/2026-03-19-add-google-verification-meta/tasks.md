## 1. 實作 Google 驗證 meta 標籤

- [x] 1.1 在 `src/components/SEO.astro` 加入 `<meta name="google-site-verification" content="googlefebc379374f1e9b3" />` 標籤
- [x] 1.2 確認 `public/googlefebc379374f1e9b3.html` 檔案存在

## 2. 驗證與品質檢查

- [x] 2.1 執行 `npx astro build` 確認建置成功
- [x] 2.2 確認產出的 HTML 中包含 google-site-verification meta 標籤
- [x] 2.3 執行 `pnpm lint` 確認零錯誤
- [x] 2.4 執行 `pnpm format:check` 確認格式正確

## 3. OpenSpec 文件

- [x] 3.1 建立 `openspec/changes/add-google-verification-meta/proposal.md`
- [x] 3.2 建立 `openspec/changes/add-google-verification-meta/design.md`
- [x] 3.3 建立 `openspec/changes/add-google-verification-meta/specs/google-verification/spec.md`
- [x] 3.4 建立 `openspec/changes/add-google-verification-meta/tasks.md`
