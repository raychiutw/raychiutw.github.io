## ADDED Requirements

### Requirement: React 19 相容性

所有 React Island 元件（SearchDialog、ThemeToggle）MUST 與 React 19 相容，功能行為 SHALL 與升級前一致。

#### Scenario: SearchDialog 元件功能驗證

- **WHEN** 使用者按下 Ctrl+K / Cmd+K 或點擊搜尋圖示
- **THEN** 搜尋 modal SHALL 正常開啟
- **AND** 輸入關鍵字 SHALL 即時顯示搜尋結果

#### Scenario: ThemeToggle 元件功能驗證

- **WHEN** 使用者點擊主題切換按鈕
- **THEN** 主題 SHALL 正常在淺色/深色之間切換
- **AND** 偏好 SHALL 正確存入 localStorage

### Requirement: React 19 依賴版本

專案 MUST 使用 React 19.x 與對應的型別定義套件。

#### Scenario: React 依賴版本驗證

- **WHEN** 檢查 `package.json`
- **THEN** `react` 版本 SHALL 為 19.x
- **AND** `react-dom` 版本 SHALL 為 19.x
- **AND** `@types/react` 版本 SHALL 為 19.x
- **AND** `@types/react-dom` 版本 SHALL 為 19.x

### Requirement: @astrojs/react 5.x 整合

React 整合 MUST 使用 `@astrojs/react` 5.x 版本以支援 React 19。

#### Scenario: @astrojs/react 版本驗證

- **WHEN** 檢查 `package.json`
- **THEN** `@astrojs/react` 版本 SHALL 為 5.x
- **AND** `astro.config.mjs` 中 SHALL 包含 `react()` integration

### Requirement: 測試工具 React 19 相容

`@testing-library/react` MUST 升級至支援 React 19 的版本。

#### Scenario: 測試工具版本驗證

- **WHEN** 檢查 `package.json` 的 devDependencies
- **THEN** `@testing-library/react` 版本 SHALL 支援 React 19

#### Scenario: 單元測試通過

- **WHEN** 執行 `pnpm test`
- **THEN** 所有既有單元測試 SHALL 通過
