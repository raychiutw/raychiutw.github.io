# CLAUDE.md

## 專案：Ray's Notes 部落格重建

### 專案概述

重建 Ray 的個人技術部落格，從 Hexo 遷移至 Astro，部署於 GitHub Pages（raychiutw.github.io，master branch）。極簡文字風格，專注閱讀體驗，內容語言為繁體中文（zh-TW）。

- 留言系統：Giscus（GitHub Discussions）
- 站內搜尋：Pagefind（編譯時索引）
- 深色模式：prefers-color-scheme + 手動切換
- RSS Feed：@astrojs/rss
- SEO：Open Graph、sitemap、JSON-LD 結構化資料

### 團隊組織

| 角色              | 負責人         | 職責                                           |
| ----------------- | -------------- | ---------------------------------------------- |
| **Key User**      | Ray            | 需求提出、最終 Approve、驗收                   |
| **PM / PO**       | Claude         | 需求分析、產品建議、任務拆分、協調團隊、commit |
| **工程師**        | Teammate Agent | 開發、調查、修復                               |
| **Code Reviewer** | Teammate Agent | 審查六面向                                     |
| **QC**            | Teammate Agent | 執行驗證指令、回報 PASS/FAIL                   |
| **寫手**          | Teammate Agent | 撰寫/編輯文章、校對、SEO 文案                  |

### 角色權責矩陣

**核心原則：每個活動只有一個角色能做，其他角色的工作就是自己不能做的。**

| 活動                            | Key User | PM  | 工程師 | Reviewer | QC  | 寫手 |
| ------------------------------- | :------: | :-: | :----: | :------: | :-: | :--: |
| 提出需求 / Approve / Reject     |    ✅    | ❌  |   ❌   |    ❌    | ❌  |  ❌  |
| 產品建議、需求分析、任務拆分    |    ❌    | ✅  |   ❌   |    ❌    | ❌  |  ❌  |
| 派任務、協調團隊                |    ❌    | ✅  |   ❌   |    ❌    | ❌  |  ❌  |
| git commit / push               |    ❌    | ✅  |   ❌   |    ❌    | ❌  |  ❌  |
| PM 驗收、向 Key User 報告       |    ❌    | ✅  |   ❌   |    ❌    | ❌  |  ❌  |
| 調查問題、查 log、debug         |    ❌    | ❌  |   ✅   |    ❌    | ❌  |  ❌  |
| 撰寫/修改程式碼、設定檔         |    ❌    | ❌  |   ✅   |    ❌    | ❌  |  ❌  |
| 本地建置驗證（開發中）          |    ❌    | ❌  |   ✅   |    ❌    | ❌  |  ❌  |
| 審查程式碼（六面向 + CI/CD）    |    ❌    | ❌  |   ❌   |    ✅    | ❌  |  ❌  |
| APPROVE / REQUEST CHANGES       |    ❌    | ❌  |   ❌   |    ✅    | ❌  |  ❌  |
| 執行驗證指令（build/test/lint） |    ❌    | ❌  |   ❌   |    ❌    | ✅  |  ❌  |
| 回報 QC PASS / FAIL             |    ❌    | ❌  |   ❌   |    ❌    | ✅  |  ❌  |
| 撰寫/編輯文章（.md only）       |    ❌    | ❌  |   ❌   |    ❌    | ❌  |  ✅  |
| 文章校對與 SEO 優化             |    ❌    | ❌  |   ❌   |    ❌    | ❌  |  ✅  |
| 招募 Subagent 平行作業          |    ❌    | ✅  |   ✅   |    ✅    | ✅  |  ✅  |

**Subagent 必須遵守派出者的角色限制。**

### 關鍵禁令

- **PM**：禁止查 log、debug、改 code、跑測試
- **Code Reviewer**：禁止修改任何檔案
- **QC**：禁止修改任何檔案，發現問題只描述不修復
- **寫手**：禁止修改 .astro/.ts/.tsx/.css/.mjs 程式碼和設定檔

### 工作流程

開發流程依全域 Matt Pocock 工作流（`/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement`）；需求與規格走 GitHub Issues，現行架構以本文件、程式碼與測試為準。以下角色分工與審查關卡照舊適用。

```
Key User 需求 → PM 建立 GitHub Issue
  → 工程師實作
  → Code Reviewer 審查（APPROVE / REQUEST CHANGES）
  → QC 驗證（PASS / FAIL，禁止改檔案）
  → PM 驗收 → Key User Approve
  → PM commit / push
```

**QC FAIL 時：** PM 判斷 → 派工程師修復 → 重新 Code Review → 重新 QC

### PM 派任務 Checklist

1. 什麼類型？（調查/開發/測試/文章）→ 派哪個角色？
2. 需求與規格寫進 GitHub Issue
3. Prompt 包含：角色禁令提醒
4. 安排完整審查流程（Code Review → QC → PM 驗收）

### 寫手技能要求

- 繁體中文技術寫作，語氣輕鬆但專業
- Markdown 格式熟練
- frontmatter 符合 schema（title/description/date/category/tags/postSlug）
- AI 撰寫的文章 tags 第一個固定為「AI生成」
- description 100-160 字，圖片路徑 /images/blog/

### 升版作業經驗

- **Major 升版一律打包處理**：Dependabot 個別開的 PR 不適合 major upgrade，應關閉後統一在一個 PR 中處理所有相關套件
- **升版前先查 migration guide**：用 WebFetch 讀官方遷移文件，列出所有 breaking changes 再動手
- **有官方升版工具就用**：如 `npx @tailwindcss/upgrade`（Tailwind 4）、`npx @astrojs/upgrade`（Astro）
- **分階段驗證**：每完成一個框架升版就跑 build/test，不要全改完才驗證，否則難以定位問題來源

### 開發規範

#### 程式碼

- Astro 元件 PascalCase、工具函式 camelCase、Markdown 檔案 kebab-case
- 檔案結構：layouts/ 放佈局、components/ 放元件、pages/ 僅放路由、content/ 放文章、utils/ 放工具函式
- TypeScript strict:true，Props 必須定義 interface，禁止 any，Content Layer API 使用 glob loader + Zod schema（z 從 astro/zod 匯入）
- ESLint 使用 flat config（eslint.config.js），禁止使用 legacy .eslintrc 格式
- 預設使用 .astro 元件（零 JS），僅互動功能使用 React Island + client:visible 或 client:idle
- 禁止行內 style，Tailwind utility class 為主，重複樣式超過 3 處抽成元件
- Git commit 遵循 Conventional Commits：type(scope):description，subject 限 50 字元
- 外部連結加 rel="noopener noreferrer"，禁止前端存放 API key，使用者輸入必須 sanitize
- 圖片使用 Astro `<Image />` 自動產生 WebP/AVIF + srcset，非首屏圖片 loading="lazy"
- 靜態優先：文章排序、標籤聚合、RSS、sitemap 全部 build time 處理，不留到 runtime
- 共用常數集中於 src/consts.ts，佈局最多兩層巢狀，元件 Props 超過 4 個用物件參數
- package.json 必須包含 packageManager 欄位，指定精確版本，作為 CI 與本地的 single source of truth
- 新增或修改 GitHub Actions workflow 時，必須交叉驗證每個 Action 的所有必填 input 及隱性依賴

#### UI/UX

- 極簡設計：無裝飾性邊框陰影，僅用色彩與間距區隔區塊，視覺元素非必要不加
- 排版：內文襯線 Noto Serif TC / Georgia，標題無襯線 system-ui，內文 18px/1.8 行高，最大寬度 680px
- 留白：段落間距 1.5em，h2 前留 3em 後留 1em，頁面上下 padding ≥ 4rem
- 色彩：明模式 #FAFAF9 底 + #1C1917 字，暗模式反轉，強調色僅一個 #2563EB，全部定義為 CSS custom properties
- 深色模式：prefers-color-scheme 預設 + 手動切換存 localStorage，class 策略 html.dark，transition 200ms
- 響應式：三斷點 sm:640/md:768/lg:1024，mobile first，手機漢堡選單 md 以上展開
- 無障礙：圖片必須 alt、觸控面積 ≥ 44x44px、色彩對比 WCAG AA ≥ 4.5:1、語義標籤 h1-h6 不跳級
- 互動回饋：hover 0.2s 過渡、連結 underline-offset:4px、focus-visible 用 outline
- 圖片：寬度 100% + border-radius:4px、figure+figcaption 語義結構、OG 圖片 1200x630
- 閱讀體驗：程式碼 Shiki 高亮+複製按鈕、行內代碼淡背景、顯示預估閱讀時間、長文提供 TOC

#### 測試

- astro build + astro check 必須零錯誤零 warning
- 單元測試：Vitest + @testing-library/react，涵蓋 utility 與 React Island
- 整合測試：Astro Container API 驗證 meta 標籤、RSS、sitemap、分類/標籤頁
- E2E 測試：Playwright 涵蓋 5 大場景，Chromium/Firefox/WebKit 三引擎
- 連結檢查：內部連結 100% 200 OK、圖片路徑、anchor 有效
- SEO 驗證：h1 唯一、title/description 長度合規、OG/Twitter Card、JSON-LD
- 視覺回歸：3 斷點 × 明暗模式 = 至少 30 張基準截圖，差異閾值 0.1%
- 深色模式：對比度 WCAG AA、localStorage 持久化、prefers-color-scheme 跟隨
- 搜尋測試：Pagefind index 存在、中文搜尋正常、無結果提示
- RSS 驗證：W3C 格式合法、路徑為絕對路徑、30 筆 entry
- 遷移完整性：30 篇 frontmatter 齊全、URL 與舊站一致、語法高亮正確
- CI 環境一致性：QC 必須使用 pnpm install --frozen-lockfile 驗證，禁止僅用 pnpm install
- .github/workflows/\*.yml 視為待測產出物，QC 須確認語法正確且每步可本地重現
- 首次部署前，必須先用測試分支驗證 CI workflow 可正常執行

#### 品質

- Lighthouse：Performance ≥ 90、Accessibility ≥ 95、Best Practices ≥ 95、SEO ≥ 95
- 測試覆蓋率：整體 ≥ 80%、utility ≥ 90%、React 元件 ≥ 85%
- Bundle 大小：頁面 JS ≤ 50KB gzip、CSS ≤ 20KB gzip
- 圖片：WebP 必備、單張 ≤ 200KB、必填 width/height/alt
- 無障礙：axe-core 零 violation、鍵盤可操作、對比度 AA
- SEO：sitemap 自動產生、canonical 唯一、404.html 正確
- Core Web Vitals：LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1
- 依賴安全：npm audit high/critical 阻擋合併、Dependabot 啟用
- 靜態分析：ESLint 零 error、TypeScript strict、禁止 any
- 效能預算：首頁 ≤ 3s (Fast 3G)、請求 ≤ 30、Island 用 client:visible
- 跨瀏覽器：Chrome/Firefox/Safari/Edge ≥ 90，Playwright 三引擎通過

#### 技術棧

- 核心框架：Astro 6.x（static output mode），需 Node.js 22+
- 樣式：Tailwind CSS 4.x，CSS-based @theme 設定 + @tailwindcss/vite（非 @astrojs/tailwind）
- 語言：TypeScript strict mode
- 互動元件：React 19.x，僅限 Island 模式
- 套件管理：pnpm，lockfile 必須提交
- 內容管理：Content Layer API + glob loader，Zod 從 astro/zod 匯入（非 astro:content）
- 品質工具：ESLint 10（flat config eslint.config.js，含 eslint-plugin-astro）+ Prettier 為必備
- 測試：Vitest 4.x（單元）+ Playwright（E2E）
- 部署：GitHub Actions + actions/deploy-pages，Node.js 22 LTS
- 禁止使用：jQuery、Lodash、Moment.js、CSS-in-JS、SSR adapter、Bootstrap

#### 部署

- CI pipeline：install → lint → format:check → tsc → build → test，任一失敗阻擋合併
- 僅 master 分支觸發自動部署，feature/\* 分支僅跑 CI 檢查
- 使用 GitHub Actions + actions/deploy-pages@v4，Node.js 22 LTS
- 部署前五項必要條件：CI 通過、Reviewer Approve、QC PASS、PM 驗收、Key User Approve
- 部署後 5 分鐘內驗證：首頁、文章頁、RSS、sitemap、搜尋功能
- 回滾策略：使用上一個正常 commit SHA 重新部署，修復後仍需完整走 PR 流程
- Lighthouse 四項指標皆 ≥ 90 才允許部署
- 環境變數透過 GitHub Secrets 管理，禁止寫入程式碼
- 建置產出目錄 dist/，禁止手動修改產出檔案
- 部署紀錄保留在 GitHub Actions 歷史中，可追溯任一版本
- GitHub Pages Source 必須設為 GitHub Actions（非 Deploy from a branch），QC 須用 gh api 驗證
- 首次部署 Checklist：packageManager 欄位、Pages Source 設定、permissions 宣告、測試分支 CI green，四項缺一不可
- Workflow 修改視同程式碼變更，須經 Code Review → QC → PM 驗收完整流程

#### 審查流程

- PR 必須關聯對應的 GitHub Issue，一 PR 對一 task
- Code Review 五面向逐項檢查：規範、安全、設計原則、效能、型別安全，不得僅留 LGTM
- QC 六面向 checklist：連結、版面、功能、跨瀏覽器、SEO、無障礙，附截圖佐證
- PM 驗收：確認與 Issue 需求一致、所有 task 完成、無遺留問題
- Key User Approve 為最終關卡，未經 Key User 明確 Approve 禁止合併，違反視為嚴重流程疏失
- 上版五關缺一不可：CI 通過 → Reviewer Approve → QC PASS → PM 驗收 → Key User Approve
- 開發完成後，PM 彙整成果向 Key User 報告，取得 Approve 後才能 commit 上版
- 合併方式：Merge commit（不用 squash），保留 PR 的 commit 歷史
- 合併後自動刪除 feature 分支
- 緊急修復允許簡化驗證範圍，但 Key User Approve 仍不可省略
- 所有流程紀錄保留在 PR comments 中，可追溯審查歷程
- 每個 Phase 完成後必須觸發 Code Review，禁止累積多個 Phase 後才一次性審查
- Code Review 五面向擴充為六面向，新增第六面向：CI/CD 與部署完整性
- CI/CD PR 合併前，必須在 feature branch 成功觸發 workflow 至少一次，附 run link 佐證
- 涉及 repo settings 變更（Pages Source、Secrets）的 task，PR 中必須列出變更項目

#### 任務

- 任務應標注受影響的檔案範圍
- 一個 PR 對應一個 task
- 任務完成後需經完整檢核流程才能上版
- CI/CD 類 task 的受影響檔案範圍必須包含所有聯動檔案（workflow YAML + package.json + 平台設定）
