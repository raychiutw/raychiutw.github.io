# astro-project-setup Specification

## Purpose
TBD - created by archiving change rebuild-blog-with-astro. Update Purpose after archive.
## Requirements
### Requirement: Astro 框架與輸出模式

系統 SHALL 使用 Astro 4.x 作為網站框架，且 SHALL 將輸出模式設定為 `output: 'static'`，以產生純靜態 HTML 網站。

#### Scenario: Astro 版本與靜態輸出驗證

- WHEN 檢查 `package.json` 中的 `astro` 依賴版本
- THEN 版本 SHALL 為 4.x 範圍內
- AND `astro.config.mjs` 中 SHALL 包含 `output: 'static'` 設定

#### Scenario: 靜態建置產出

- WHEN 執行 `pnpm build` 指令
- THEN 建置 SHALL 成功完成且不產生錯誤
- AND 產出目錄 SHALL 僅包含靜態 HTML、CSS、JS 檔案

---

### Requirement: TypeScript 嚴格模式

專案 SHALL 啟用 TypeScript strict mode，並 MUST 提供完整的 `tsconfig.json` 設定檔。

#### Scenario: TypeScript 嚴格模式設定驗證

- WHEN 開啟 `tsconfig.json` 設定檔
- THEN `compilerOptions.strict` SHALL 為 `true`
- AND 設定 SHALL 繼承 Astro 提供的 TypeScript 基礎設定

#### Scenario: TypeScript 編譯檢查

- WHEN 執行 `pnpm astro check` 指令
- THEN SHALL 無任何型別錯誤

---

### Requirement: Tailwind CSS 整合

專案 SHALL 整合 Tailwind CSS 3.x，並透過 Astro 官方整合方式引入。

#### Scenario: Tailwind CSS 版本與設定驗證

- WHEN 檢查 `package.json` 中的 `tailwindcss` 依賴版本
- THEN 版本 SHALL 為 3.x 範圍內
- AND `astro.config.mjs` 中 SHALL 包含 `@astrojs/tailwind` 整合設定

#### Scenario: Tailwind 樣式生效

- WHEN 在任一 `.astro` 元件中使用 Tailwind utility class
- THEN 建置後的 HTML SHALL 包含對應的 CSS 樣式

---

### Requirement: ESLint 與 Prettier 程式碼品質工具

專案 MUST 設定 ESLint 搭配 `eslint-plugin-astro` 外掛，以及 Prettier 作為程式碼格式化工具。

#### Scenario: ESLint 設定驗證

- WHEN 檢查 ESLint 設定檔
- THEN SHALL 包含 `eslint-plugin-astro` 外掛
- AND 執行 `pnpm lint` SHALL 不產生任何錯誤

#### Scenario: Prettier 設定驗證

- WHEN 檢查 Prettier 設定檔
- THEN SHALL 存在 `.prettierrc` 或等效設定檔
- AND 執行 `pnpm format:check` SHALL 確認所有檔案格式正確

---

### Requirement: pnpm 套件管理器

專案 MUST 使用 pnpm 作為套件管理器，且 `pnpm-lock.yaml` 鎖定檔 MUST 提交至版本控制。

#### Scenario: pnpm 鎖定檔存在

- WHEN 檢查專案根目錄
- THEN `pnpm-lock.yaml` SHALL 存在
- AND `.gitignore` 中 SHALL NOT 包含 `pnpm-lock.yaml`

#### Scenario: 使用 pnpm 安裝依賴

- WHEN 執行 `pnpm install`
- THEN SHALL 成功安裝所有依賴且無錯誤

---

### Requirement: 專案目錄結構

專案 SHALL 符合以下目錄結構規範，確保程式碼組織清晰且可維護。

#### Scenario: 必要目錄存在

- WHEN 檢查 `src/` 目錄結構
- THEN 以下目錄 SHALL 全部存在：
  - `src/layouts/`
  - `src/components/`
  - `src/pages/`
  - `src/content/`
  - `src/utils/`
  - `src/styles/`
- AND `src/consts.ts` 檔案 SHALL 存在，用於存放全站常數設定

#### Scenario: 目錄用途正確

- WHEN 檢查各目錄內容
- THEN `src/layouts/` SHALL 僅包含佈局元件
- AND `src/components/` SHALL 僅包含可重用 UI 元件
- AND `src/pages/` SHALL 包含路由頁面
- AND `src/content/` SHALL 包含 Markdown 內容集合
- AND `src/utils/` SHALL 包含工具函式
- AND `src/styles/` SHALL 包含全域樣式檔案

