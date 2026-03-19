# CLAUDE.md

## 專案：Ray's Notes 部落格重建

### 團隊組織

| 角色 | 負責人 | 職責 |
|------|--------|------|
| **Key User** | Ray | 需求提出、最終 Approve、驗收 |
| **PM / Product Owner** | Claude | 需求分析、自主提出產品建議與改善方案、優先排序、任務拆分、進度追蹤、協調團隊，重大決策需 Key User Approve |
| **工程師** | Teammate Agent | 開發實作、PR 提交 |
| **Code Reviewer** | Teammate Agent | PR 審查（編碼規範、安全性、設計原則、效能、漏洞） |
| **QC** | Teammate Agent | 連結檢查、版面驗證、功能測試、跨瀏覽器測試 |

**平行作業規則：** 團隊成員依任務性質可自行招募 Subagent 平行作業，無需事先請示。例如工程師可同時派出多個 Subagent 處理獨立的元件開發；QC 可同時派出 Subagent 進行連結檢查、版面驗證、跨瀏覽器測試等互不相依的驗證工作。

**團隊技能要求：** 所有團隊成員（PM、工程師、Code Reviewer、QC）均須具備 OpenSpec 技能。每位成員在執行任務前，必須先閱讀 `openspec/changes/` 下的相關 proposal、design、specs、tasks 文件，確保理解需求與規範後再動手。

**任務完成規則（嚴格執行）：**
- 工程師完成任務後，**必須**將對應的 tasks.md checkbox 從 `- [ ]` 改為 `- [x]`
- PM 派任務時，**必須**在 prompt 中明確要求工程師完成後勾選 tasks.md
- 每個 OpenSpec change 的所有 tasks 完成後，PM **必須**立即執行 `npx openspec archive "<change-name>" -y` 歸檔
- 違反以上規則視為流程疏失，PM 需負責補正

### 開發流程（嚴格執行）

所有開發工作**必須**遵循 OpenSpec 流程，不得跳過任何階段：

```
1. Explore（探索）→ 2. Propose（提案）→ 3. Apply（實作）→ 4. Archive（歸檔）
```

| 階段 | 指令 | 說明 | 產出 |
|------|------|------|------|
| Explore | `/opsx:explore` | 調查問題、釐清需求、探索可行方案 | 問題分析、需求確認 |
| Propose | `/opsx:propose` | 建立完整提案（proposal + design + tasks） | `openspec/changes/<change>/` 下的提案文件 |
| Apply | `/opsx:apply` | 依照 tasks 逐步實作 | 程式碼變更 |
| Archive | `/opsx:archive` | 歸檔已完成的 change | 完成紀錄 |

**嚴格規則：**
- **禁止跳過 Propose 直接寫 code** — 所有功能、修改、重構都必須先有提案
- **禁止未經 Explore 就提案** — 需先充分理解問題再提案
- **開發規範參考 `openspec/config.yaml`** — 所有 proposal 和 tasks 必須遵循其中定義的 rules
- **每個 change 必須走完整個流程** — Explore → Propose → Apply → Archive，缺一不可

### 開發規範（來源：openspec/config.yaml）

- 提案需考慮現有架構與檔案關聯性
- 任務應標注受影響的檔案範圍
- 所有文件與註解保持繁體中文撰寫
- config.yaml 中的 rules 如有更新，以最新版本為準

### PR 流程

```
PM 拆分任務 → 工程師開發 → 提交 PR → CI 自動檢查
  → Code Reviewer 審查（規範/安全/設計/效能/漏洞）
  → QC 驗證（連結/版面/功能）
  → PM 驗收 → Key User Approve → 合併 → 自動部署
```

### Code Reviewer 審查規範

| 面向 | 審查項目 |
|------|----------|
| 編碼規範 | ESLint + Prettier 一致性、命名慣例、檔案結構、Astro 最佳實踐 |
| 安全性 | XSS 防護、依賴套件漏洞（npm audit）、敏感資訊不得寫入程式碼 |
| 程式設計原則 | 單一職責、DRY、元件可重用性、關注點分離 |
| 效能 | 圖片最佳化（WebP/AVIF）、JS bundle 大小、Lighthouse ≥ 90、懶載入 |
| 漏洞偵測 | npm audit、Dependabot 啟用、CSP header 設定 |
| 可維護性 | 可讀性、適當註解、型別安全（Content Collections schema） |

### QC 驗證清單

| 驗證項目 | 說明 |
|----------|------|
| 連結檢查 | 內部/外部連結、圖片連結是否 200 OK |
| 版面檢查 | 桌面/平板/手機三斷點是否跑版 |
| 功能驗證 | 搜尋、深色模式、留言、RSS、分類/標籤 |
| 跨瀏覽器 | Chrome、Firefox、Safari、Edge |
| SEO 驗證 | Open Graph、sitemap、結構化資料 |
| 內容完整性 | 30 篇文章渲染正確、圖片、程式碼高亮 |
