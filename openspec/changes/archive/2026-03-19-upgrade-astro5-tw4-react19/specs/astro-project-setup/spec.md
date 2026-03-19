## MODIFIED Requirements

### Requirement: Astro 框架與輸出模式

系統 SHALL 使用 Astro 5.x 作為網站框架，且 SHALL 將輸出模式設定為 `output: 'static'`，以產生純靜態 HTML 網站。

#### Scenario: Astro 版本與靜態輸出驗證

- WHEN 檢查 `package.json` 中的 `astro` 依賴版本
- THEN 版本 SHALL 為 5.x 範圍內
- AND `astro.config.mjs` 中 SHALL 包含 `output: 'static'` 設定

#### Scenario: 靜態建置產出

- WHEN 執行 `pnpm build` 指令
- THEN 建置 SHALL 成功完成且不產生錯誤
- AND 產出目錄 SHALL 僅包含靜態 HTML、CSS、JS 檔案

### Requirement: TypeScript 嚴格模式

專案 SHALL 啟用 TypeScript strict mode，並 MUST 提供完整的 `tsconfig.json` 設定檔。tsconfig.json MUST 在 include 中包含 `.astro/types.d.ts` 以支援 Astro 5 型別系統。

#### Scenario: TypeScript 嚴格模式設定驗證

- WHEN 開啟 `tsconfig.json` 設定檔
- THEN `compilerOptions.strict` SHALL 為 `true`
- AND 設定 SHALL 繼承 Astro 提供的 TypeScript 基礎設定
- AND `include` 陣列 SHALL 包含 `.astro/types.d.ts`

#### Scenario: TypeScript 編譯檢查

- WHEN 執行 `pnpm astro check` 指令
- THEN SHALL 無任何型別錯誤

### Requirement: Tailwind CSS 整合

專案 SHALL 整合 Tailwind CSS 4.x，並透過 `@tailwindcss/vite` plugin 引入，而非 Astro 官方 tailwind integration。

#### Scenario: Tailwind CSS 版本與設定驗證

- WHEN 檢查 `package.json` 中的 `tailwindcss` 依賴版本
- THEN 版本 SHALL 為 4.x 範圍內
- AND `astro.config.mjs` 中 SHALL 透過 `vite.plugins` 包含 `@tailwindcss/vite`

#### Scenario: Tailwind 樣式生效

- WHEN 在任一 `.astro` 元件中使用 Tailwind utility class
- THEN 建置後的 HTML SHALL 包含對應的 CSS 樣式
