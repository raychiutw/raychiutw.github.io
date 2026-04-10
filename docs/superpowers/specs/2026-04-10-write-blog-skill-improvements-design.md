# write-blog Skill 改進設計（Iteration 3-5）

## Context

現有 write-blog skill 已通過 iteration-2 的 benchmark（100% pass rate），但現有的 7 個 assertion 只覆蓋結構面（frontmatter、blockquote、code tags 等），沒有評估文字品質、AI 味、個人觀點等內容層面。

本設計從 AgriciDaniel/claude-blog（438 stars 的 blog skill ecosystem）選擇性借鑑功能，但針對 Ray's Notes 個人技術部落格的場景客製化。目標是在不擴張成多 skill ecosystem 的前提下，提升單一 write-blog skill 的內容品質控管。

## Scope

本設計涵蓋三輪迭代，聚焦**內容品質**而非功能擴張：

- **Iteration 3**：加入 banned phrases 清單、voice 軟規則、第 4 個 personal context 測試案例
- **Iteration 4**：開發 `analyze_blog.py` 5 維度評分腳本，重跑 benchmark
- **Iteration 5**：根據 iter-4 結果從 4 個候選功能挑 1-2 個實作

**不在本設計範疇**：

- 不擴張成多 skill ecosystem（不做 /blog-analyze、/blog-seo 等獨立 skill）
- 不做 marketing 導向的 SEO / AI citation 優化（Ray's Notes 不是內容行銷站）
- 不做 Schema.org JSON-LD 生成、SVG 圖表引擎、AI 圖片生成

## Iteration 3：Banned Phrases + Voice 軟規則

### 3.1 英文 AI 片語黑名單

以下詞彙視為 AI 寫作指標，skill 必須明確迴避：

- `delve / delve into`
- `leverage`（當動詞泛用時）
- `dive into / dive deep`
- `cutting-edge`
- `seamless`
- `robust`（當形容詞泛用時）
- `game-changer / game-changing`
- `revolutionize`
- `pivotal`
- `unlock / unleash`（比喻用法）
- `in today's fast-paced world`
- `landscape`（比喻用法）
- `tapestry`
- `embark on`

### 3.2 中文 AI 套話黑名單

- `讓我們一起深入探討`
- `隨著...的快速發展`
- `值得注意的是`
- `不僅...更`
- `不可或缺`
- `至關重要`
- `綜上所述 / 總而言之`
- `在本文中，我們將會探討`
- `眾所周知`
- `毫無疑問`
- `眾多的`
- `諸如此類`

### 3.3 Em Dash 客製化

**允許 em dash（`—`）不禁用**。

理由：em dash 是 Ray 的 signature style，claude-blog 把它當 AI pattern 會誤傷 Ray 自己的寫作。SKILL.md 必須明寫「Ray's style 允許 em dash」，防止未來用 claude-blog 的腳本時被誤判。

### 3.4 Voice & Originality 軟規則

在 SKILL.md 新增區塊「發揮你自己的聲音」，內容涵蓋：

**判斷 prompt 類型**：

- 有個人情境（如「昨天 production 掛了」）→ 必須注入第一人稱經驗
- 純技術主題（如「寫一篇 Docker 教學」）→ 至少加一個「我自己的做法」或「實務上我會怎麼選」

**優先放進文章的內容**：

- 踩過的坑
- 跟官方文件不一樣的觀點
- 「我通常怎麼做」的取捨判斷

**不加硬 assertion**，理由：個人觀點太主觀，不適合機器判定。用第 4 個測試案例間接驗證。

### 3.5 新增 Assertion：`no-banned-phrases`

擴充 `grade_iter3.py`（從 `grade_iter2.py` 複製）加入一個新 assertion：

- 對每篇輸出掃描中英黑名單
- 發現任一詞即 FAIL
- 報告違例清單（哪個詞、出現幾次）

### 3.6 新增第 4 個測試案例

```json
{
  "prompt": "我剛把部落格從 Hexo 升級到 Astro，過程中踩了幾個坑，想寫一篇記錄",
  "eval_name": "hexo-to-astro-upgrade"
}
```

這個 prompt 帶 personal context，用來驗證 voice injection 是否生效（人工 review，不加硬 assertion）。

### 3.7 Iteration 3 Exit Criteria

- SKILL.md 加入 banned phrases 清單和 voice 指引
- `grade_iter3.py` 加 `no-banned-phrases` assertion
- 新增 Hexo 升級測試案例
- 重跑 8 個 subagent（4 with_skill + 4 baseline）
- 產出 `iteration-3/benchmark.json` 並更新 `quality_checklist.md`
- `no-banned-phrases` assertion with_skill 4/4 PASS

## Iteration 4：analyze_blog.py 5 維度評分腳本

### 4.1 腳本定位

擴充 `grade_iter2.py` 的 pattern，建立 `.claude/skills/write-blog/scripts/analyze_blog.py`。

**用法**：

- 單檔：`python analyze_blog.py path/to/post.md`
- 批次：`python analyze_blog.py src/content/blog/`
- CI gate：exit code 0 (PASS) / 1 (FAIL)
- 交稿前自檢：給 writer 一個客觀分數

### 4.2 5 類別權重

```text
Structure    20 分
Style        25 分
Originality  25 分
Technical    15 分
Readability  15 分
─────────────────
Total       100 分
```

**為什麼跟 claude-blog 不一樣**：移除 SEO（25）、AI Citation（15），提高 Style 和 Originality 的權重。個人技術部落格的差異化在個人觀點，不在 Google 排名。

### 4.3 各維度評分細節

**Structure 20 分**

- 延續現有 7 個 assertion（frontmatter-complete、description-length、ai-tag-first、slug-kebab-case、blockquote-opening、code-language-tags、h2-h3-structure）
- 每項約 3 分，FAIL 扣對應分數

**Style 25 分**

- `banned-phrases`：iter-3 清單，每違例 -3 分
- `burstiness`：句長標準差 < 15 扣 5 分
- `ttr`（Type-Token Ratio）：< 0.35 扣 5 分
- `repetitive-structures`：「首先...其次...最後」類結構扣 3 分

**Originality 25 分**

- `first-person-presence`：「我」「筆者」出現 0 次扣 10 分
- `opinion-markers`：「我的做法」「實務上」「我覺得」「踩過的坑」< 1 個扣 8 分
- `generic-intro-check`：首段出現「在本文中」「讓我們」立即扣 7 分

**Technical 15 分**

- `code-completeness`：code block 是否完整可執行（heuristic：有 import / using / #include）
- `version-specificity`：技術工具是否標版本號
- `link-format`：外部連結 markdown 語法正確

**Readability 15 分**

- `avg-sentence-length`：中文句子 15-30 字甜蜜點
- `paragraph-length`：段落 < 150 字
- `code-text-ratio`：code block 佔比 20%-50%
- `heading-hierarchy`：H2 不跳到 H4

### 4.4 Output 格式

**Table mode**（預設，人類閱讀）：顯示 5 類別分數、issues 清單、總分與 PASS/FAIL 狀態。

**JSON mode**（`--format json`，CI 整合）：完整結構化資料，含 file、total、pass、threshold、categories。

### 4.5 技術實作

**語言**：Python（沿用 `grade_iter2.py` pattern）

**依賴最小化**：

- 標準庫：`re`、`json`、`pathlib`、`argparse`
- 不用外部套件（textstat 對中文效果差），所有 heuristic 自己寫
- 中文斷句用 `[。！？]` regex 切

**Pass threshold**：80 分（可用 `--threshold` 參數調整）

### 4.6 Iteration 4 Benchmark 流程

1. 重跑 iter-3 的 4 個測試案例
2. 對 8 個輸出檔（4 with_skill + 4 baseline）執行 `analyze_blog.py`
3. 彙整 5 類別 mean score
4. 對比 with_skill vs baseline 的 delta
5. 特別關注 Style + Originality 的新維度差異

### 4.7 Iteration 4 Exit Criteria

- `analyze_blog.py` 5 維度評分腳本完成且 self-test PASS
- 對 iter-3 的 8 個輸出跑完分數
- 產出 `iteration-4/benchmark.json` 含 5 類別 mean score
- with_skill 總分 ≥ 80
- with_skill 與 baseline delta ≥ 10 分

## Iteration 5：根據結果決定的進階功能

### 5.1 定位

**不預先決定具體做什麼**，根據 iter-4 benchmark 結果選擇 1-2 個候選功能。理由：iter-3 和 iter-4 跑完後對「哪裡不夠好」會有清楚數據，iter-5 才能對症下藥。

### 5.2 候選功能清單

**候選 A：Fact-check Pipeline**

- 驗證文章中的統計、版本號、API 名稱
- 實作：subagent + WebSearch
- 觸發條件：iter-4 人工 review 發現事實錯誤
- 複雜度：高
- 價值：高（技術文章不能錯 API 名稱或版本號）

**候選 B：Link / Image Validation**

- `analyze_blog.py` 加 `--check-links` mode
- `curl -sI` 驗證外部連結 HTTP 200
- 驗證 `/images/blog/` 路徑檔案存在
- 驗證內部連結指向實際文章
- 觸發條件：iter-4 發現死連結或找不到圖
- 複雜度：低
- 價值：中

**候選 C：Originality Rules 硬化**

- 將 iter-3 的軟規則轉為硬 assertion
- 例：`must-have-opinion-marker`、`must-have-first-person`
- 觸發條件：iter-4 的 Originality mean score < 15/25
- 複雜度：低
- 價值：高

**候選 D：Writing Style Calibration（Few-shot）**

- 挑 1-2 篇 Ray 的高品質文章當 few-shot 範例放進 SKILL.md
- 讓新文章學 Ray 的實際語氣
- 觸發條件：iter-4 發現 voice 方向對但味道不對
- 複雜度：低
- 價值：中到高

### 5.3 Iter-5 決策流程

```text
完成 iter-4 benchmark →
讀 5 類別的 delta →

如果 Style 或 Structure 已接近滿分，但 Originality < 15/25：
    → 選 候選 C（硬化）或 候選 D（few-shot）

如果人工 review 發現事實錯誤：
    → 選 候選 A（fact-check）

如果外部連結或圖片常掛掉：
    → 選 候選 B（link validation）

如果都還不錯：
    → iter-5 跳過，結束迭代
```

### 5.4 Iteration 5 Exit Criteria

- 根據決策流程選出 1-2 個候選功能
- 實作並重跑評分
- 對應維度有可量化改善（≥ 5 分）

## 終止條件

**什麼時候停止迭代**：

- 總分連續 2 輪沒有明顯改善（< 3 分 delta）
- 每輪 ROI 變小（token 成本持續增加但分數停滯）
- 已經接近滿分（> 95），再改是過度工程

## Roadmap 總覽

| Iter  | 範疇                                       | 變更檔案                                       | 驗收標準                         |
| ----- | ------------------------------------------ | ---------------------------------------------- | -------------------------------- |
| **3** | Banned phrases + voice 軟規則 + 新測試案例 | SKILL.md / grade_iter3.py / eval_metadata.json | `no-banned-phrases` 4/4 PASS     |
| **4** | analyze_blog.py 5 維度評分腳本             | scripts/analyze_blog.py / workspace/iter-4     | with_skill 總分 ≥ 80，delta ≥ 10 |
| **5** | 根據 iter-4 結果挑 1-2 個候選              | 依選擇而定                                     | 對應維度改善 ≥ 5 分              |

## Decisions & Trade-offs

### 為何不擴張成多 skill ecosystem

使用者明確選擇方案 A（選擇性借鑑），維持單一 write-blog skill 架構。多 skill 的維護成本和觸發複雜度對個人部落格不划算。

### 為何保留 em dash

Ray 的現有文章大量使用 em dash，這是個人 style。若照搬 claude-blog 的規則會誤傷作者自己的寫作。這是本設計最重要的客製化點。

### 為何 Originality 不加硬 assertion（iter-3）

個人觀點的判定太主觀，regex 只能抓到表面訊號（「我」「實務上」），抓不到真正的原創價值。iter-3 用軟規則 + 新測試案例間接驗證，若 iter-4 發現 Originality 分數低再硬化（候選 C）。

### 為何不用 textstat / 外部套件

textstat 針對英文設計，對中文音節數、句長統計都失準。用 regex 和字元計算反而更準確。
