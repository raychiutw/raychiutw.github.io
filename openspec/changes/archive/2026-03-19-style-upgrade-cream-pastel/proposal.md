## Why

Key User 反映目前部落格樣式「太素」且字體不喜歡。現有極簡風格（Noto Serif TC 襯線字體、冷白背景）缺乏個人特色和溫度。需要升級為「奶油暖甜」風格，增加辨識度和閱讀舒適感。

## What Changes

- **色彩系統全面更換**：冷白底 → 奶油黃底（#FDF6EC），灰色文字 → 暖棕文字（#3E2723）
- **字體更換**：Noto Serif TC 襯線字體 → Noto Sans TC 無襯線字體，更現代親和
- **強調色更換**：藍色 #2563EB → 珊瑚橘 #FF9A76
- **標籤樣式**：冷色標籤 → 珊瑚橘 + 抹茶綠彩色圓角標籤
- **品牌識別**：加入圓形珊瑚橘 Logo 圖示
- **程式碼區塊**：冷灰背景 → 暖色奶油背景
- **深色模式**：配合暖色系調整暗模式配色
- **整體氛圍**：從「冷靜極簡」轉為「溫馨手帳感」

## Capabilities

### New Capabilities

- `cream-pastel-theme`: 奶油暖甜主題系統 — 色彩、字體、標籤、程式碼區塊、深色模式全面改版

### Modified Capabilities

（無）

## Impact

- **檔案範圍**：src/styles/global.css、tailwind.config.mjs、src/layouts/BaseLayout.astro、src/components/ 下的 Header/Footer/PostCard 元件
- **無功能變更**：僅視覺樣式調整，不影響路由、內容、功能邏輯
- **Google Fonts**：Noto Serif TC → Noto Sans TC
