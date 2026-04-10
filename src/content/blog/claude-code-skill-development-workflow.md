---
title: 'Claude Code Skill 開發實戰：從 skill-creator 到 advanced 審核的完整流程'
description: '記錄用 skill-creator 開發 Claude Code Skill 的完整流程，涵蓋 iteration benchmark、description 優化與 skill-creator-advanced 審核，兩輪迭代從 81% 做到 100% pass rate。'
date: 2026-04-09
category: '程式開發'
tags: ['AI生成', 'Claude Code', 'Skill Development', 'AI Agent']
postSlug: 'claude-code-skill-development-workflow'
---

> Claude Code 的 Skill 機制讓你把重複性的工作流程封裝成可重用的指令。但做出一個「能用」的 skill 和做出一個「穩定好用」的 skill 之間，差的不只是一份 SKILL.md — 還有測試、benchmark、description 優化和格式審核。這篇記錄我從零開始開發 write-blog skill 的完整過程。

## 背景：為什麼要做 write-blog Skill

我的部落格 Ray's Notes 有一套固定的文章規範：frontmatter schema、blockquote 開場、code block 語言標記、description 字數限制... 每次叫 AI 寫文章，總有幾項會漏掉，寫完還得人工校對修正。

把這些規範封裝成 skill，讓 Claude 每次寫文章時自動載入，就不用重複交代了。

## 開發工具鏈：三個 Skill 各司其職

整個開發過程用了三個 skill 搭配使用，各自負責不同階段：

### /skill-creator — 起草與迭代測試

這是 skill 開發的起點。它會引導你從意圖釐清開始，一路走到測試與迭代：

- **起草 SKILL.md**：根據你描述的需求，產出包含 frontmatter、指令本體、output contract 的完整草稿
- **建立測試案例**：幫你設計 2-3 個真實的 eval prompt，存成 `evals.json`
- **平行 benchmark**：同時啟動 with_skill 和 without_skill 的 subagent 跑測試，用自動化腳本評分每個 assertion（frontmatter 完整性、description 字數、code block 語言標記等）
- **產生 review viewer**：把結果輸出成互動式 HTML，讓你可以逐篇檢閱文章品質、留下回饋，還有 benchmark 數據對照
- **Description optimization**：產生 trigger eval set（should-trigger / should-not-trigger 查詢），優化 description 的觸發準確率

簡單說，skill-creator 負責「做出來」和「測出來」。

### /superpowers:writing-skills — 結構與品質審查

這個 skill 專注在 SKILL.md 本身的寫作品質：

- 檢查 skill 結構是否符合最佳實踐（frontmatter、語意區塊、output contract）
- 確認 few-shot 範例的品質 — 範例不夠好，model 的輸出也不會好
- 審查指令是否用祈使句、步驟是否有 I/O、規則是否有驗證點
- 找出 context 膨脹問題 — 哪些內容應該從 SKILL.md 移到 `references/`

它的角色比較像「skill 的 code reviewer」，不跑測試，但會抓出寫法上的問題。

### /skill-creator-advanced — 八階段正式審核

這是最嚴格的審核流程，用自動化腳本逐項檢查：

- **Phase -1**：Portfolio audit — 判斷 skill 的 archetype（router / executor / ops / utility），列出鄰近 skill 確認不會互搶
- **Phase 2**：Naming & description — 檢查 slug、description 長度、trigger phrase 覆蓋率
- **Phase 4**：Compatibility — 跑 `format_check.py`、`quick_validate.py`、`audit_unreferenced_files.py` 等自動化腳本
- **Phase 5**：Trigger & overlap — 建立 overlap matrix，計算 repo 內所有 skill 之間的相似度
- **Phase 6**：Functional benchmark — 驗證 with_skill 的 pass rate、ROI 是否值得額外的 token 成本
- **Phase 7**：Regression gates — 檢查是否達到發版門檻

它會把所有結果回填到 `references/quality_checklist.md`，作為 skill 的 readiness gate。沒有通過這份 checklist 的 skill 不算完成。

三個工具的分工：

```text
skill-creator    → 開發 & 測試（做出來、測出來）
writing-skills   → 寫作品質審查（寫得好不好）
advanced         → 正式發版審核（能不能上線）
```

## Phase 1：用 skill-creator 起草與測試

### 起草 SKILL.md

skill-creator 會引導你走過幾個步驟：

1. **釐清意圖** — 這個 skill 要做什麼、什麼時候觸發、輸出格式是什麼
2. **撰寫 SKILL.md** — 包含 frontmatter（name + description）和指令本體
3. **建立測試案例** — 2-3 個真實的 prompt，存成 `evals.json`

我的三個測試案例：

```json
[
  { "prompt": "寫一篇關於 Docker multi-stage build 的教學文章" },
  { "prompt": "幫我寫一篇 ASP.NET Core Middleware 處理全域例外的文章" },
  { "prompt": "寫一篇 Git rebase vs merge 的比較文章" }
]
```

涵蓋三種文章類型：教學型、問題解決型、比較型。

### Iteration-1 結果

skill-creator 會同時跑 **with_skill**（載入 skill）和 **without_skill**（不載入）兩組，每組各跑三個測試案例，總共 6 個 subagent 平行執行。

跑完後用自動化腳本評分，檢查 7 個 assertion：

```text
frontmatter-complete    ✓ 必填欄位齊全
description-length      ✓ 100-160 字
ai-tag-first            ✓ 第一個 tag 是 AI生成
slug-kebab-case         ✓ postSlug 用 kebab-case
blockquote-opening      ✓ 第一行是 blockquote
code-language-tags      ✓ 每個 code block 都有語言標記
h2-h3-structure         ✓ 至少 2 個 H2
```

Iteration-1 的成績：

| 指標       | with_skill | baseline | 差異 |
| ---------- | ---------- | -------- | ---- |
| 平均通過率 | 81%        | 71%      | +10% |
| 平均耗時   | 76.6s      | 106.4s   | -28% |

有提升，但 81% 不夠好。兩個問題浮出水面：

- **code-language-tags：3/3 全部 FAIL** — ASCII art 的 commit graph 沒有標 `text`
- **description-length：1/3 FAIL** — Git rebase 文章的 description 只有 96 字

## Phase 2：針對弱點改善 SKILL.md

### 修 code-language-tags

原本的寫法把規則埋在一長串 bullet points 裡，model 很容易忽略。改善策略：

1. **獨立子標題** — 把「Code Block 語言標記」拉出來成為 `###` 層級
2. **加錯誤/正確對比範例** — 直接展示 ASCII art 忘記標 `text` 的錯誤寫法
3. **強調判斷原則** — 「如果不是程式碼，就是 `text`」

這種「壞例子 → 好例子」的對比在 skill 中特別有效，因為 model 看到具體的反面教材會比看到抽象規則更容易遵守。

### 修 description-length

原本只說「100-160 字之間，寫完數一下」。改成：

- 明確要求「寫完後務必數字數」
- 給出甜蜜點建議「110-140 字是最安全的範圍」
- 說明補救方法「低於 100 就多補一句」

## Phase 3：Iteration-2 Benchmark

改完後重跑同樣的三個測試案例，同樣 6 個 subagent 平行跑：

```text
docker-multistage/with_skill:      7/7 (100%)
aspnet-middleware/with_skill:       7/7 (100%)
git-rebase-vs-merge/with_skill:    7/7 (100%)

docker-multistage/without_skill:   6/7 (86%)
aspnet-middleware/without_skill:    6/7 (86%)
git-rebase-vs-merge/without_skill: 4/7 (57%)
```

| 指標       | Iter-1 | Iter-2     | 變化  |
| ---------- | ------ | ---------- | ----- |
| with_skill | 81%    | **100%**   | +19%  |
| baseline   | 71%    | 76.2%      | +5.2% |
| Delta      | +10%   | **+23.8%** | —     |

**code-language-tags 從 0/3 變成 3/3**，反面教材範例策略完全奏效。

## Phase 4：Description Optimization

Description 是 skill 能否被正確觸發的關鍵。我準備了 20 個 trigger eval queries：

**Should trigger（10 個）：**

```text
「寫一篇關於 C# record type 跟 class 差別的文章」
「ASP.NET Core Middleware pipeline 我研究了一陣子，想整理成一篇 blog post」
「昨天 production 又掛了，想記錄一下怎麼用 EF Core 避免 N+1 query」
```

**Should NOT trigger（10 個）：**

```text
「幫我看看 design-pattern-1-intro.md 有沒有 typo」        → 校對不是寫新文
「幫我寫一個 ASP.NET Core Middleware 來做 rate limiting」  → 寫程式碼不是文章
「blog 頁面的 Lighthouse 分數只有 78，怎麼優化？」         → 網站效能不是寫文
```

重點是 **should-not-trigger 的 near-miss** — 跟 skill 主題相關但不該觸發的查詢。「幫我寫一個 Middleware」和「幫我寫一篇 Middleware 的文章」只差幾個字，但一個是寫 code、一個是寫文章。

最終 description 加入了明確的排除清單：

```text
Do NOT trigger for editing/reviewing existing posts, fixing blog site bugs,
writing code (not articles), updating README/docs, checking frontmatter format,
translating posts, or optimizing site performance.
```

## Phase 5：skill-creator-advanced 八階段審核

這是更嚴格的審核流程，用自動化腳本逐項檢查：

```sh
python scripts/format_check.py <skill-path>          # 格式與結構
python scripts/quick_validate.py <skill-path>         # 最小合規
python scripts/check_skill_name_surface.py <skill-path>  # 命名衝突
python scripts/audit_unreferenced_files.py <skill-path>  # 孤立檔案
python scripts/audit_skill_overlap.py <skills-dir>    # Overlap 矩陣
```

### 被抓到的問題：YAML Frontmatter

description 裡有個冒號：

```yaml
# 這會破壞 YAML 解析
description: Do NOT trigger for: editing/reviewing...
```

YAML 把 `for:` 當成一個新的 key-value pair。修正方式是用單引號包裹整個 description，並把 em dash `—` 換成 `--`：

```yaml
description: "Use when the user wants to create NEW blog content for Ray's Notes -- writing..."
```

### Overlap 矩陣

`audit_skill_overlap.py` 會計算 repo 內所有 skill 之間的相似度。write-blog 的最高 overlap 分數只有 0.077（跟 openspec-propose），表示沒有搶 query 的問題。

### 最終結果

| 檢查               | 結果                       |
| ------------------ | -------------------------- |
| format_check       | 0 errors                   |
| quick_validate     | PASS                       |
| name_surface       | PASS (0 blocking)          |
| unreferenced_files | PASS                       |
| skill_overlap      | 最高 0.077（無風險）       |
| Benchmark          | 100% pass rate             |
| ROI                | +18% tokens 換 +23.8% 品質 |

## 學到的事

### 反面教材比正面規則有效

在 skill 裡寫「每個 code block 都要有語言標記」不如直接展示一個忘記標 `text` 的錯誤範例。Model 對具體的對比反應比抽象的規則好得多。

### Description 是 routing，不是介紹

Description 不是在跟人類介紹這個 skill 能做什麼，而是在幫 Claude 判斷「這個 query 該不該用這個 skill」。所以重點是 trigger phrases 和 negative boundaries，不是功能描述。

### YAML 是地雷區

Skill 的 frontmatter 是 YAML 格式，冒號、引號、角括弧都可能炸。寫完一定要跑 `format_check.py` — 人眼很難抓到 YAML 的語法問題。

### Benchmark 要跟 baseline 比

只看 with_skill 的數字沒有意義。如果 baseline 也是 100%，那 skill 就沒有價值。重點是 **delta** — skill 帶來多少額外的提升。

## 結語

整個 skill 開發流程大概長這樣：

```text
skill-creator 起草 → iteration-1 測試 → 找出弱點 → 改善 → iteration-2 驗證
→ description optimization → skill-creator-advanced 正式審核 → 上線
```

花了大概兩輪迭代就從 81% 做到 100%。最花時間的不是寫 SKILL.md，而是設計好的測試案例和分析為什麼某個 assertion 會 fail。有了 benchmark 資料，改善方向就很明確。

[Claude Code Skills 官方文件](https://docs.anthropic.com/en/docs/claude-code/skills)
