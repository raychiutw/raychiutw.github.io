## MODIFIED Requirements

### Requirement: Tailwind darkMode 設定

Tailwind CSS 4 MUST 支援 class-based dark mode。深色模式啟用時，HTML `<html>` 根元素 SHALL 加上 `dark` class。Tailwind 4 預設支援 class-based dark mode（透過 `@custom-variant` 或內建行為），無需額外設定檔。

#### Scenario: 深色模式啟用

- WHEN 深色模式被啟用（無論透過系統偏好或手動切換）
- THEN `<html>` 元素 SHALL 包含 `class="dark"`
- AND Tailwind 的 `dark:` variant SHALL 正確套用對應樣式

#### Scenario: 淺色模式啟用

- WHEN 淺色模式被啟用
- THEN `<html>` 元素 SHALL 不包含 `dark` class
