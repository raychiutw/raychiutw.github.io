# CLAUDE.md

## 專案：Ray's Notes 部落格重建

### 團隊組織

| 角色              | 負責人         | 職責                                           |
| ----------------- | -------------- | ---------------------------------------------- |
| **Key User**      | Ray            | 需求提出、最終 Approve、驗收                   |
| **PM / PO**       | Claude         | 需求分析、產品建議、任務拆分、協調團隊、commit |
| **工程師**        | Teammate Agent | 開發、調查、修復、撰寫 OpenSpec 文件           |
| **Code Reviewer** | Teammate Agent | 審查六面向 + OpenSpec 文件完整性               |
| **QC**            | Teammate Agent | 執行驗證指令、回報 PASS/FAIL                   |
| **寫手**          | Teammate Agent | 撰寫/編輯文章、校對、SEO 文案                  |

### 角色權責矩陣

**核心原則：每個活動只有一個角色能做，其他角色的工作就是自己不能做的。**

| 活動                            | Key User | PM  | 工程師 | Reviewer | QC  | 寫手 |
| ------------------------------- | :------: | :-: | :----: | :------: | :-: | :--: |
| 提出需求 / Approve / Reject     |    ✅    | ❌  |   ❌   |    ❌    | ❌  |  ❌  |
| 產品建議、需求分析、任務拆分    |    ❌    | ✅  |   ❌   |    ❌    | ❌  |  ❌  |
| 派任務、協調團隊                |    ❌    | ✅  |   ❌   |    ❌    | ❌  |  ❌  |
| git commit / push / archive     |    ❌    | ✅  |   ❌   |    ❌    | ❌  |  ❌  |
| PM 驗收、向 Key User 報告       |    ❌    | ✅  |   ❌   |    ❌    | ❌  |  ❌  |
| 調查問題、查 log、debug         |    ❌    | ❌  |   ✅   |    ❌    | ❌  |  ❌  |
| 撰寫/修改程式碼、設定檔         |    ❌    | ❌  |   ✅   |    ❌    | ❌  |  ❌  |
| 撰寫 OpenSpec 文件內容          |    ❌    | ❌  |   ✅   |    ❌    | ❌  |  ❌  |
| 本地建置驗證（開發中）          |    ❌    | ❌  |   ✅   |    ❌    | ❌  |  ❌  |
| 審查程式碼（六面向 + CI/CD）    |    ❌    | ❌  |   ❌   |    ✅    | ❌  |  ❌  |
| 審查 OpenSpec 文件完整性        |    ❌    | ❌  |   ❌   |    ✅    | ❌  |  ❌  |
| APPROVE / REQUEST CHANGES       |    ❌    | ❌  |   ❌   |    ✅    | ❌  |  ❌  |
| 執行驗證指令（build/test/lint） |    ❌    | ❌  |   ❌   |    ❌    | ✅  |  ❌  |
| 回報 QC PASS / FAIL             |    ❌    | ❌  |   ❌   |    ❌    | ✅  |  ❌  |
| 撰寫/編輯文章（.md only）       |    ❌    | ❌  |   ❌   |    ❌    | ❌  |  ✅  |
| 文章校對與 SEO 優化             |    ❌    | ❌  |   ❌   |    ❌    | ❌  |  ✅  |
| 勾選 tasks.md checkbox          |    ❌    | ❌  |   ✅   |    ❌    | ❌  |  ✅  |
| 招募 Subagent 平行作業          |    ❌    | ✅  |   ✅   |    ✅    | ✅  |  ✅  |

**Subagent 必須遵守派出者的角色限制。**

### 關鍵禁令

- **PM**：禁止查 log、debug、改 code、跑測試、用 `--no-validate` 繞過 archive
- **Code Reviewer**：禁止修改任何檔案
- **QC**：禁止修改任何檔案，發現問題只描述不修復
- **寫手**：禁止修改 .astro/.ts/.tsx/.css/.mjs 程式碼和設定檔

### 工作流程

```
Key User 需求 → PM 建立 OpenSpec change
  → 工程師實作 + 勾 tasks.md
  → Code Reviewer 審查（APPROVE / REQUEST CHANGES）
  → QC 驗證（PASS / FAIL，禁止改檔案）
  → PM 驗收 → Key User Approve
  → PM commit / push / archive（所有 tasks 完成才能 archive）
```

**QC FAIL 時：** PM 判斷 → 派工程師修復 → 重新 Code Review → 重新 QC

### PM 派任務 Checklist

1. 什麼類型？（調查/開發/測試/文章）→ 派哪個角色？
2. 建立 OpenSpec change（`npx openspec new change "<name>"`）
3. Prompt 包含：完成後勾 tasks.md + 角色禁令提醒
4. Prompt 包含：OpenSpec 文件 template（見下方）
5. 安排完整審查流程（Code Review → QC → PM 驗收）

### OpenSpec 流程（嚴格執行）

```
Explore → Propose → Apply → Archive（缺一不可）
```

| 階段    | 指令                               | 產出                              |
| ------- | ---------------------------------- | --------------------------------- |
| Explore | `/opsx:explore`                    | 問題分析                          |
| Propose | `/opsx:propose`                    | proposal + design + specs + tasks |
| Apply   | `/opsx:apply`                      | 程式碼變更                        |
| Archive | `npx openspec archive "<name>" -y` | 歸檔（禁止 `--no-validate`）      |

**工程師建立 OpenSpec 文件前必須先執行：**

```
npx openspec instructions <artifact> --change <name> --json
```

從 `template` 欄位取得正確格式。

### OpenSpec 文件格式（必須嚴格遵守）

**proposal.md：**

```
## Why
## What Changes
## Capabilities
### New Capabilities
### Modified Capabilities
## Impact
```

**specs/\<name\>/spec.md：**

```
## ADDED Requirements

### Requirement: <名稱>
<描述，必須包含 SHALL 或 MUST>

#### Scenario: <名稱>
- **WHEN** ...
- **THEN** ...
```

**tasks.md：**

```
## 1. <分組名稱>
- [ ] 1.1 <任務描述>【檔案：...】
```

### 寫手技能要求

- 繁體中文技術寫作，語氣輕鬆但專業
- Markdown 格式熟練
- frontmatter 符合 schema（title/description/date/category/tags/postSlug）
- AI 撰寫的文章 tags 第一個固定為「AI生成」
- description 100-160 字，圖片路徑 /images/blog/

### 升版作業經驗

- **Major 升版一律打包處理**：Dependabot 個別開的 PR 不適合 major upgrade，應關閉後統一在一個 OpenSpec change 中處理所有相關套件
- **升版前先查 migration guide**：用 WebFetch 讀官方遷移文件，列出所有 breaking changes 再動手
- **有官方升版工具就用**：如 `npx @tailwindcss/upgrade`（Tailwind 4）、`npx @astrojs/upgrade`（Astro）
- **分階段驗證**：每完成一個框架升版就跑 build/test，不要全改完才驗證，否則難以定位問題來源
- **archive 後必須 format**：`npx openspec archive` 產出的 spec 檔不一定符合 Prettier 格式，commit 前必須跑 `pnpm format`

### 開發規範

以 `openspec/config.yaml` 為準，涵蓋：coding、uiux、testing、quality、tech_stack、deployment、review_process、tasks。config.yaml 更新時以最新版為準。
