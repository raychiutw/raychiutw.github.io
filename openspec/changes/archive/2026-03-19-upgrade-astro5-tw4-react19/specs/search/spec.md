## MODIFIED Requirements

### Requirement: 搜尋 Modal 對話框

搜尋功能 SHALL 以 modal 對話框形式呈現，即時顯示搜尋結果。

搜尋元件 MUST 使用 React 19 Island 並以 `client:idle` 指令載入，透過 `@astrojs/react` 5.x 整合。

#### Scenario: 使用者輸入搜尋關鍵字

- WHEN 使用者在搜尋 modal 中輸入關鍵字
- THEN modal SHALL 即時顯示符合的搜尋結果

#### Scenario: 搜尋元件載入方式

- WHEN 頁面載入完成且瀏覽器進入閒置狀態
- THEN 搜尋 React 19 Island 元件 SHALL 以 `client:idle` 方式進行 hydration
