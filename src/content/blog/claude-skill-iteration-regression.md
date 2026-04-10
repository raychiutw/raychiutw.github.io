---
title: 'Claude Skill 迭代實驗：當第 5 輪讓分數退步 3 分'
description: '用 superpowers 的 brainstorming → plan → subagent-driven 工作流跑 write-blog skill 三輪迭代，iter-3 assertion 100% PASS、iter-4 總分 88.5，iter-5 加 few-shot 後反而退步 3 分的實錄。'
date: 2026-04-10
category: '程式開發'
tags: ['AI生成', 'Claude Code', 'Skill Development', 'AI Agent']
postSlug: 'claude-skill-iteration-regression'
---

> 我昨天花了一個下午擴充 Ray's Notes 的 write-blog skill。從 iter-3 改到 iter-5，分數從 100% 的 assertion pass rate 做到 88.5/100 的 5 維度評分，然後 iter-5 加上 few-shot 範例後... 退步了 3 分。這是關於「為什麼更多的迭代不一定更好」的實錄。

## 起點：用 superpowers 完整工作流認真跑一次

我之前寫過一篇 skill 開發文章，介紹 skill-creator、writing-skills、skill-creator-advanced 這三個審核工具。但那篇只講到 iter-1 跟 iter-2。這次我想認真跑 superpowers 的完整工作流 — **brainstorming → writing-plans → subagent-driven-development** — 看看能把 skill 打磨到什麼程度。

觸發點是一個 438 stars 的 GitHub repo：`AgriciDaniel/claude-blog`。它是一個 22 個 skill 組成的 blog ecosystem，有 5 類別評分、AI 片語偵測、GEO 優化、fact-check pipeline 等複雜功能。看完後我在想：**我那個只有 7 個 assertion 的 write-blog skill 是不是該升級成這種等級？**

## Brainstorming：先確認方向再動手

Superpowers 的 brainstorming skill 很嚴格 — 它強迫你先釐清意圖、提出 2-3 個方案、一段一段 approve，才讓你進到寫 plan。我列了三個方向：

- **A. 選擇性借鑑**：挑幾個功能加到現有 skill，維持單一 skill 架構
- **B. 拆成多 skill 小型 ecosystem**：write-blog + blog-analyze + blog-seo
- **C. 全面對標**：重建成類似規模的 22 skill ecosystem

我選了 A。理由很簡單：**Ray's Notes 是個人部落格，不是 marketing 站**。claude-blog 的 GEO 優化、schema 生成、AI citation 稽核對我沒用。我想借鑑的是 AI 片語偵測跟 5 維度量化評分這兩個具體功能。

然後又確認方案 3（按實作複雜度分三輪迭代）：

- **Iter-3**：純 SKILL.md 文字改動（banned phrases + voice guidance）
- **Iter-4**：寫 Python 腳本做 5 維度評分
- **Iter-5**：根據 iter-4 結果從 4 個候選功能挑 1-2 個

## 19 個任務的 plan

Writing-plans 產出一份 1946 行的 plan 文件，把三輪迭代拆成 19 個 task。每個 task 有完整的 input/output、測試指令、commit message 範本。粒度很細 — 像「Run analyze_blog.py on all 8 files」就是一個獨立 task，不是某個大 task 裡的一步。

我印象最深的是 plan 強制 TDD：每個 scoring module 都要先寫會失敗的 unittest，跑一次確認 ImportError，再寫實作，再跑一次確認 PASS。19 個 task 走下來多了 19 個測試。

## Iter-3：文字改動帶來 +37.5pp 的大躍進

Iter-3 只做三件事：

1. 在 SKILL.md 加一份中英 AI 片語黑名單（14 + 14 個詞）
2. 加一段 voice guidance（判斷 prompt 類型 + 優先放進文章的內容）
3. 新增一個 personal context 測試案例（Hexo 升 Astro 踩坑）

然後用 subagent-driven-development 派了 8 個 subagent 跑 benchmark：4 個 with_skill + 4 個 baseline。結果：

```text
with_skill:   100.0% (32/32 assertions)
baseline:      62.5% (20/32 assertions)
delta:        +37.5 percentage points
```

**這是整個實驗 ROI 最高的一輪。** 純文字改動、沒寫任何 code，benchmark 就飆起來。baseline 的主要失分點是沒寫 blockquote 開場、code block 漏語言標記、description 字數不對 — 這些都是「知道規則就不會犯」的錯，skill 一提醒就全部修好。

## Iter-4：量化評分帶來可追蹤的 88.5 分

Iter-3 的 assertion 只有 true/false，看不出文章「有多好」。Iter-4 改成 100 分制，分成 5 個維度：

```text
Structure    20 分   frontmatter / blockquote / heading
Style        25 分   banned phrases / burstiness / TTR
Originality  25 分   first-person / opinion markers / generic intro
Technical    15 分   code completeness / link format
Readability  15 分   sentence length / paragraph length / code ratio
─────────────────
Total       100 分
```

跟 claude-blog 的 5 類別（Content / SEO / E-E-A-T / Technical / AI Citation）不同 — 我移除了 SEO 跟 AI Citation，個人部落格不需要；換成 Style 跟 Originality，這才是 Ray's Notes 的差異化。

我用 TDD 寫 `analyze_blog.py`，每個 scoring module 一個 task，加上整合 task 總共 7 個 task。最後有 19 個 unittest 全部 PASS。腳本只用 Python 標準庫，沒裝任何外部套件 — 本來想用 textstat，但它對中文音節計算不準。

跑 benchmark 結果：

```text
with_skill total:  88.5/100
baseline total:    77.0/100
delta:             +11.5
```

兩個 exit criteria（total ≥ 80、delta ≥ 10）都過了。**這是第二個 sweet spot** — 花了約 2 小時寫腳本，換到可以追蹤、可以自動化、可以當 CI gate 的量化指標。

## Iter-5：Few-shot 的意外反效果

Iter-4 之後我該停手嗎？按 plan 的終止條件：「總分連續 2 輪沒有明顯改善就停」。但 88.5 離滿分還有距離，而且 plan 裡寫好 4 個候選功能可以選。我套用決策流程：

- **候選 A（fact-check）**：沒人工 review 發現事實錯誤，不觸發
- **候選 B（link validation）**：沒死連結回報，不觸發
- **候選 C（Originality 硬化）**：Originality 已經 25/25 maxed，不需要
- **候選 D（few-shot 範例）**：剩餘的 gap 在 Style / Readability 這種「語感」層面，規則難寫但範例可以教

**我選了 D。** 挑 `ai-agent-team-rebuild-blog.md` 當範例（295 字節錄），加到 SKILL.md 的 `## 風格示範（Few-shot）` 區塊，然後重跑 4 個 with_skill subagent。

結果讓我意外：

| 維度        | Iter-4   | Iter-5   | Delta  |
| ----------- | -------- | -------- | ------ |
| Structure   | 20.0     | 20.0     | ±0     |
| Style       | 20.0     | 20.0     | ±0     |
| Originality | 25.0     | **23.0** | **-2** |
| Technical   | 12.5     | 12.5     | ±0     |
| Readability | 11.0     | **10.0** | **-1** |
| **Total**   | **88.5** | **85.5** | **-3** |

**Few-shot 不但沒改善目標維度 Readability，反而讓 Originality 微幅下滑。** 加一個範例，總分退了 3 分。

## 為什麼 Few-shot 會讓分數變差？

我的幾個猜測：

**範例太短，訊號不夠強。** 295 字只夠展示一種開場風格，不足以教 model「段落該怎麼切」「標題階層怎麼排」。Readability 的問題主要是長段落跟 heading jump，但 few-shot 只示範了開場的 blockquote。

**Few-shot 會讓 model 太接近範例，失去多樣性。** 原本 iter-4 的 4 篇文章各有各的 personality，iter-5 可能都往那個 295 字範本靠攏，反而讓 Originality 分數下降 2 分。這跟 few-shot prompting 常見的 mode collapse 現象吻合。

**4 個樣本的變異太大。** 單篇分數 ±5 分的 noise 是正常的，4 篇平均下來 ±3 分可能還在雜訊範圍內。要確認是不是真的退步，該跑 8-10 篇才夠 — 但那成本太高了。

## 學到的事

**Stopping criteria 不是擺好看的。** 我在寫 plan 的時候有設終止條件，但真的碰到 iter-4 的好結果時，還是忍不住想「再多改一輪看會不會更好」。結果白做一輪還退步。**該停的時候要停**，這是我從這次拿到的最大教訓。

**Negative result 也是有效 result。** Iter-5 的退步不是失敗 — 它告訴我「few-shot 不適合解這個問題」。之後如果想再改，會避開這條路，改試別的候選（例如 B 的 link validation 或 A 的 fact-check）。

**Subagent-driven 的兩階段 review 很慢但很穩。** 每個 task 都過 implementer → spec reviewer → code quality reviewer 三關。Task 1 的 review 就抓到「第一人稱」的歧義（Claude 是用 AI 的第一人稱還是 Ray 的第一人稱？），我一併修了三個 minor 問題。如果沒這道 review，iter-3 的 skill 會帶著這個歧義跑完整輪 benchmark。

**單一資料點不夠。** 4 個測試案例對 assertion-based 的 iter-3 夠用，但對 5 維度量化評分，±3 分的變異很可能只是雜訊。之後認真跑 benchmark 該把測試案例擴到 8-10 個。

**我的做法是** 把 skill 停在 iter-4 狀態（88.5/100, +11.5 delta）。iter-5 的 few-shot 區塊還留在 SKILL.md 裡 — 雖然分數顯示它沒幫助，但對人類讀者理解 Ray 的風格還是有價值。這是量化指標跟實用價值不完全一致的例子，實務上我會選留著。

## 結語

整個實驗花了大概 3 小時、19 個 commit、5 個 iteration，最終結論是「第四輪最佳，第五輪不該做」。這聽起來像失敗的結局，但其實是好結局 — 我有具體數據告訴我「為什麼不該繼續改」，而不是憑直覺瞎猜。

如果沒有 `analyze_blog.py` 的量化評分，我根本不會知道 iter-5 讓分數退步。我會看到「文章看起來差不多」就以為沒事，帶著更差的 skill 繼續往前走。這就是為什麼 iter-4 的評分腳本是這次 ROI 最高的投資 — 它不只告訴我 skill 有多好，還告訴我什麼時候該停。

[AgriciDaniel/claude-blog](https://github.com/AgriciDaniel/claude-blog)
[superpowers skills](https://github.com/obra/superpowers)
