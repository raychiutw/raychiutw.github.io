## ADDED Requirements

### Requirement: CSS-based Tailwind 設定

專案 MUST 使用 Tailwind CSS 4 的 CSS-based 設定方式。主題自訂 SHALL 在 `global.css` 中以 `@theme` 區塊定義，取代原本的 `tailwind.config.mjs`。

#### Scenario: CSS-based 設定生效

- **WHEN** 檢查 `src/styles/global.css`
- **THEN** SHALL 包含 `@import "tailwindcss"` 指令
- **AND** SHALL 包含 `@theme` 區塊定義自訂主題變數
- **AND** 專案根目錄 SHALL 不存在 `tailwind.config.mjs`

#### Scenario: 自訂主題變數遷移

- **WHEN** 檢查 `@theme` 區塊
- **THEN** SHALL 包含自訂字型設定（Noto Sans TC）
- **AND** SHALL 包含自訂色彩變數（bg、text、accent、link、border）
- **AND** SHALL 包含自訂最大寬度設定（prose: 680px）

### Requirement: @tailwindcss/vite 整合

專案 MUST 使用 `@tailwindcss/vite` 作為 Tailwind CSS 的建置整合方式，透過 Astro 的 Vite 配置引入。

#### Scenario: Vite plugin 設定

- **WHEN** 檢查 `astro.config.mjs`
- **THEN** SHALL 在 `vite.plugins` 中包含 `tailwindcss()` plugin
- **AND** integrations 陣列中 SHALL 不包含 tailwind()

#### Scenario: @astrojs/tailwind 移除

- **WHEN** 檢查 `package.json`
- **THEN** dependencies 中 SHALL 不包含 `@astrojs/tailwind`
- **AND** SHALL 包含 `@tailwindcss/vite` 與 `tailwindcss` 4.x

### Requirement: Tailwind 4 renamed utilities 遷移

所有 .astro、.tsx 檔案中的 Tailwind CSS renamed utilities MUST 更新為 Tailwind 4 對應名稱。

#### Scenario: shadow 系列 class 更名

- **WHEN** 搜尋所有模板檔案
- **THEN** SHALL 不存在 Tailwind 3 的 `shadow-sm`（應為 `shadow-xs`）
- **AND** SHALL 不存在 Tailwind 3 的 `shadow`（無後綴，應為 `shadow-sm`）

#### Scenario: rounded 系列 class 更名

- **WHEN** 搜尋所有模板檔案
- **THEN** SHALL 不存在 Tailwind 3 的 `rounded-sm`（應為 `rounded-xs`）
- **AND** SHALL 不存在 Tailwind 3 的 `rounded`（無後綴，應為 `rounded-sm`）

#### Scenario: outline-none 更名

- **WHEN** 搜尋所有模板檔案
- **THEN** `outline-none` SHALL 更新為 `outline-hidden`

### Requirement: @tailwind 指令移除

`global.css` 中 MUST 不存在 `@tailwind base`、`@tailwind components`、`@tailwind utilities` 等舊指令，SHALL 以 `@import "tailwindcss"` 取代。

#### Scenario: 舊指令移除驗證

- **WHEN** 檢查 `src/styles/global.css`
- **THEN** SHALL 不包含任何 `@tailwind` 指令
- **AND** SHALL 以 `@import "tailwindcss"` 作為 Tailwind 的引入方式
