## ADDED Requirements

### Requirement: 奶油暖甜色彩系統

系統 SHALL 使用奶油暖甜配色方案。明亮模式背景 MUST 為 #FDF6EC，文字 MUST 為 #3E2723，強調色 MUST 為 #FF9A76。深色模式背景 MUST 為 #1A1410，文字 MUST 為 #E8DDD0。所有色彩 MUST 定義為 CSS custom properties。

#### Scenario: 明亮模式配色

- **WHEN** 頁面以明亮模式載入
- **THEN** 背景色為奶油黃 #FDF6EC，文字為暖棕 #3E2723，強調色為珊瑚橘 #FF9A76

#### Scenario: 深色模式配色

- **WHEN** 頁面切換至深色模式
- **THEN** 背景色為暖深棕 #1A1410，文字為暖白 #E8DDD0，強調色為淺珊瑚 #FFB088

### Requirement: Noto Sans TC 字體

全站 SHALL 使用 Noto Sans TC 無襯線字體取代 Noto Serif TC。標題 font-weight MUST 為 700，內文 MUST 為 400。

#### Scenario: 字體載入

- **WHEN** 頁面載入
- **THEN** 標題和內文均使用 Noto Sans TC 字體，不顯示襯線字體

### Requirement: 暖色標籤系統

分類與標籤 SHALL 使用暖色系圓角標籤。MUST 包含至少 5 種配色：珊瑚橘、抹茶綠、奶茶棕、薰衣草、天空藍。border-radius MUST ≥ 8px。

#### Scenario: 標籤顯示

- **WHEN** 文章頁面顯示標籤
- **THEN** 標籤使用暖色背景 + 深色文字的圓角標籤樣式

### Requirement: 品牌 Logo

Header 站名前 SHALL 顯示圓形品牌 Logo。Logo MUST 為 24x24px 圓形，背景色 #FF9A76，內容為白色 "R" 字母。

#### Scenario: Logo 顯示

- **WHEN** 頁面載入
- **THEN** Header 左側顯示珊瑚橘圓形 Logo + 站名

### Requirement: 暖色程式碼區塊

程式碼區塊背景 SHALL 使用暖色調。明亮模式 MUST 為 #FFF3E0，深色模式 MUST 為 #231C14。行內代碼明亮模式 MUST 為 #FFF8E1。

#### Scenario: 程式碼區塊配色

- **WHEN** 文章內有程式碼區塊
- **THEN** 背景為暖色而非冷灰色

### Requirement: 色彩對比度

所有文字與背景的色彩組合 MUST 符合 WCAG AA 標準（對比度 ≥ 4.5:1）。

#### Scenario: 無障礙檢查

- **WHEN** 以 axe-core 或 Lighthouse 檢查頁面
- **THEN** 無色彩對比度違規
