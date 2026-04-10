# write-blog Skill Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend write-blog skill with content quality checks (banned phrases, voice guidance, 5-dimension scoring) across three iterations without expanding into a multi-skill ecosystem.

**Architecture:** Iteration-3 modifies SKILL.md and grade script for qualitative improvements. Iteration-4 builds a standalone `analyze_blog.py` Python script with 5-category scoring (Structure/Style/Originality/Technical/Readability) using only stdlib. Iteration-5 is conditional based on iter-4 benchmark results.

**Tech Stack:** Python 3.12 (stdlib only: re, json, pathlib, argparse, unittest), Markdown with YAML frontmatter, Claude Code subagents for benchmark execution.

**Reference spec:** `docs/superpowers/specs/2026-04-10-write-blog-skill-improvements-design.md`

---

## File Structure

**Files created:**

- `.claude/skills/write-blog-workspace/grade_iter3.py` — iter-3 grading with new `no-banned-phrases` assertion
- `.claude/skills/write-blog-workspace/iteration-3/<eval-name>/eval_metadata.json` (x4) — test metadata
- `.claude/skills/write-blog-workspace/iteration-3/<eval-name>/<config>/outputs/<filename>.md` (x8) — test outputs
- `.claude/skills/write-blog-workspace/iteration-3/<eval-name>/<config>/timing.json` (x8) — timing data
- `.claude/skills/write-blog-workspace/iteration-3/<eval-name>/<config>/grading.json` (x8) — graded results
- `.claude/skills/write-blog-workspace/iteration-3/benchmark.json` — aggregated iter-3 benchmark
- `.claude/skills/write-blog/scripts/analyze_blog.py` — 5-dimension scoring script
- `.claude/skills/write-blog/scripts/test_analyze_blog.py` — unittest suite
- `.claude/skills/write-blog-workspace/iteration-4/benchmark.json` — iter-4 scoring benchmark

**Files modified:**

- `.claude/skills/write-blog/SKILL.md` — add banned phrases + voice sections
- `.claude/skills/write-blog/references/quality_checklist.md` — add iter-3 and iter-4 results

---

# Iteration 3: Banned Phrases + Voice Guidance

## Task 1: Update SKILL.md with banned phrases and voice guidance

**Files:**

- Modify: `.claude/skills/write-blog/SKILL.md`

- [ ] **Step 1: Add banned phrases section after the 語氣與風格 section**

Insert new `## 禁用片語（AI 味指標）` section with this content:

```markdown
## 禁用片語（AI 味指標）

AI 寫的文章常用一些固定套話，讀起來很像業配軟文。以下列表的詞彙**不要使用**，寫完後搜尋一遍確認沒有漏。

### 英文禁用清單

- `delve` / `delve into`
- `leverage`（當動詞泛用時）
- `dive into` / `dive deep`
- `cutting-edge`
- `seamless`
- `robust`（當形容詞泛用時）
- `game-changer` / `game-changing`
- `revolutionize`
- `pivotal`
- `unlock` / `unleash`（比喻用法）
- `in today's fast-paced world`
- `landscape`（比喻用法）
- `tapestry`
- `embark on`

### 中文禁用清單

- `讓我們一起深入探討`
- `隨著...的快速發展`
- `值得注意的是`
- `不僅...更`
- `不可或缺`
- `至關重要`
- `綜上所述` / `總而言之`
- `在本文中，我們將會探討`
- `眾所周知`
- `毫無疑問`
- `眾多的`
- `諸如此類`

### Em Dash 是例外

Ray 的文章允許 em dash（`—`）。有些工具會把 em dash 當成 AI 寫作模式，但這是 Ray 的 signature style，**不要為此避免使用 em dash**。
```

- [ ] **Step 2: Add voice guidance section after banned phrases**

Insert `## 發揮你自己的聲音` section:

```markdown
## 發揮你自己的聲音

Ray's Notes 的差異化不在「寫得正確」，而在「寫得像 Ray」。純教學文容易淪為技術百科的複製品 — 讀者為什麼要看你的版本而不是官方文件？

**判斷 prompt 類型：**

- **有個人情境**（如「昨天 production 掛了」「我升級踩到這個坑」）→ 必須注入第一人稱經驗，結語可以帶個人觀點
- **純技術主題**（如「寫一篇 Docker 教學」）→ 至少加一個「我自己的做法是...」或「實務上我會怎麼選」的段落

**優先放進文章的東西：**

- 踩過的坑（即使是抽象主題，也可以說「有人會這樣寫但會出問題」）
- 跟官方文件不一樣的觀點
- 「我通常怎麼做」的取捨判斷
```

- [ ] **Step 3: Verify SKILL.md still under 500 lines and frontmatter still valid**

Run:

```bash
cd C:/Users/RayChiu/Desktop/Source/GithubRepos/raychiutw.github.io
PYTHONUTF8=1 python ~/.claude/skills/skill-creator-advanced/scripts/quick_validate.py .claude/skills/write-blog
```

Expected output: `Skill is valid!`

- [ ] **Step 4: Run Prettier to format the SKILL.md**

```bash
pnpm format -- .claude/skills/write-blog/SKILL.md
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/write-blog/SKILL.md
git commit -m "feat(write-blog): add banned phrases list and voice guidance for iter-3"
```

---

## Task 2: Create grade_iter3.py with no-banned-phrases assertion

**Files:**

- Create: `.claude/skills/write-blog-workspace/grade_iter3.py`

- [ ] **Step 1: Copy grade_iter2.py as starting point**

```bash
cp .claude/skills/write-blog-workspace/grade_iter2.py .claude/skills/write-blog-workspace/grade_iter3.py
```

- [ ] **Step 2: Update ITER_DIR constant and add banned phrase lists at module top**

In `grade_iter3.py`, change `ITER_DIR = os.path.join(WORKSPACE, "iteration-2")` to `ITER_DIR = os.path.join(WORKSPACE, "iteration-3")`.

Add after the imports:

```python
BANNED_EN = [
    "delve into", "delve", "leverage ",
    "dive into", "dive deep", "cutting-edge",
    "seamless", "game-changer", "game-changing",
    "revolutionize", "pivotal",
    "unlock", "unleash",
    "in today's fast-paced world",
    "tapestry", "embark on",
]

BANNED_ZH = [
    "讓我們一起深入探討", "隨著", "值得注意的是",
    "不僅", "不可或缺", "至關重要",
    "綜上所述", "總而言之",
    "在本文中，我們將會探討",
    "眾所周知", "毫無疑問", "眾多的", "諸如此類",
]
```

- [ ] **Step 3: Update EVALS constant to include new hexo-to-astro test case**

Change `EVALS` to:

```python
EVALS = [
    ("docker-multistage", "docker-multi-stage-build.md"),
    ("aspnet-middleware", "aspnet-core-global-exception-middleware.md"),
    ("git-rebase-vs-merge", "git-rebase-vs-merge.md"),
    ("hexo-to-astro-upgrade", "hexo-to-astro-upgrade.md"),
]
```

- [ ] **Step 4: Add no-banned-phrases assertion to the grade function**

Inside the `grade(content)` function, before the final `return results`, add:

```python
# 8. no-banned-phrases
violations = []
content_lower = content.lower()
for phrase in BANNED_EN:
    if phrase.lower() in content_lower:
        violations.append(f"EN: '{phrase}'")
for phrase in BANNED_ZH:
    if phrase in content:
        violations.append(f"ZH: '{phrase}'")

results.append({
    "text": "no-banned-phrases",
    "passed": len(violations) == 0,
    "evidence": "No banned phrases" if not violations else f"Found: {', '.join(violations)}",
})
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/write-blog-workspace/grade_iter3.py
git commit -m "feat(write-blog): add grade_iter3.py with no-banned-phrases assertion"
```

---

## Task 3: Setup iteration-3 directory structure and eval_metadata.json files

**Files:**

- Create: `.claude/skills/write-blog-workspace/iteration-3/docker-multistage/eval_metadata.json`
- Create: `.claude/skills/write-blog-workspace/iteration-3/aspnet-middleware/eval_metadata.json`
- Create: `.claude/skills/write-blog-workspace/iteration-3/git-rebase-vs-merge/eval_metadata.json`
- Create: `.claude/skills/write-blog-workspace/iteration-3/hexo-to-astro-upgrade/eval_metadata.json`

- [ ] **Step 1: Create directories**

```bash
mkdir -p .claude/skills/write-blog-workspace/iteration-3/docker-multistage/with_skill/outputs
mkdir -p .claude/skills/write-blog-workspace/iteration-3/docker-multistage/without_skill/outputs
mkdir -p .claude/skills/write-blog-workspace/iteration-3/aspnet-middleware/with_skill/outputs
mkdir -p .claude/skills/write-blog-workspace/iteration-3/aspnet-middleware/without_skill/outputs
mkdir -p .claude/skills/write-blog-workspace/iteration-3/git-rebase-vs-merge/with_skill/outputs
mkdir -p .claude/skills/write-blog-workspace/iteration-3/git-rebase-vs-merge/without_skill/outputs
mkdir -p .claude/skills/write-blog-workspace/iteration-3/hexo-to-astro-upgrade/with_skill/outputs
mkdir -p .claude/skills/write-blog-workspace/iteration-3/hexo-to-astro-upgrade/without_skill/outputs
```

- [ ] **Step 2: Create eval_metadata.json for docker-multistage**

Write to `.claude/skills/write-blog-workspace/iteration-3/docker-multistage/eval_metadata.json`:

```json
{
  "eval_id": 1,
  "eval_name": "docker-multistage",
  "prompt": "寫一篇關於 Docker multi-stage build 的教學文章",
  "assertions": [
    {
      "name": "frontmatter-complete",
      "description": "Has title, description, date, category, tags, postSlug"
    },
    { "name": "description-length", "description": "Description is 100-160 characters" },
    { "name": "ai-tag-first", "description": "First tag is AI生成" },
    { "name": "slug-kebab-case", "description": "postSlug uses kebab-case" },
    { "name": "blockquote-opening", "description": "First content is a blockquote" },
    { "name": "code-language-tags", "description": "ALL code blocks have language specifiers" },
    { "name": "h2-h3-structure", "description": "Uses ## headers" },
    { "name": "no-banned-phrases", "description": "No EN/ZH AI phrases from blacklist" }
  ]
}
```

- [ ] **Step 3: Create eval_metadata.json for aspnet-middleware**

Write to `.claude/skills/write-blog-workspace/iteration-3/aspnet-middleware/eval_metadata.json`:

```json
{
  "eval_id": 2,
  "eval_name": "aspnet-middleware",
  "prompt": "幫我寫一篇文章，介紹如何在 ASP.NET Core 中使用 Middleware 處理全域例外",
  "assertions": [
    {
      "name": "frontmatter-complete",
      "description": "Has title, description, date, category, tags, postSlug"
    },
    { "name": "description-length", "description": "Description is 100-160 characters" },
    { "name": "ai-tag-first", "description": "First tag is AI生成" },
    { "name": "slug-kebab-case", "description": "postSlug uses kebab-case" },
    { "name": "blockquote-opening", "description": "First content is a blockquote" },
    { "name": "code-language-tags", "description": "ALL code blocks have language specifiers" },
    { "name": "h2-h3-structure", "description": "Uses ## headers" },
    { "name": "no-banned-phrases", "description": "No EN/ZH AI phrases from blacklist" }
  ]
}
```

- [ ] **Step 4: Create eval_metadata.json for git-rebase-vs-merge**

Write to `.claude/skills/write-blog-workspace/iteration-3/git-rebase-vs-merge/eval_metadata.json`:

```json
{
  "eval_id": 3,
  "eval_name": "git-rebase-vs-merge",
  "prompt": "寫一篇 Git rebase vs merge 的比較文章",
  "assertions": [
    {
      "name": "frontmatter-complete",
      "description": "Has title, description, date, category, tags, postSlug"
    },
    { "name": "description-length", "description": "Description is 100-160 characters" },
    { "name": "ai-tag-first", "description": "First tag is AI生成" },
    { "name": "slug-kebab-case", "description": "postSlug uses kebab-case" },
    { "name": "blockquote-opening", "description": "First content is a blockquote" },
    { "name": "code-language-tags", "description": "ALL code blocks have language specifiers" },
    { "name": "h2-h3-structure", "description": "Uses ## headers" },
    { "name": "no-banned-phrases", "description": "No EN/ZH AI phrases from blacklist" }
  ]
}
```

- [ ] **Step 5: Create eval_metadata.json for hexo-to-astro-upgrade (NEW)**

Write to `.claude/skills/write-blog-workspace/iteration-3/hexo-to-astro-upgrade/eval_metadata.json`:

```json
{
  "eval_id": 4,
  "eval_name": "hexo-to-astro-upgrade",
  "prompt": "我剛把部落格從 Hexo 升級到 Astro，過程中踩了幾個坑，想寫一篇記錄",
  "assertions": [
    {
      "name": "frontmatter-complete",
      "description": "Has title, description, date, category, tags, postSlug"
    },
    { "name": "description-length", "description": "Description is 100-160 characters" },
    { "name": "ai-tag-first", "description": "First tag is AI生成" },
    { "name": "slug-kebab-case", "description": "postSlug uses kebab-case" },
    { "name": "blockquote-opening", "description": "First content is a blockquote" },
    { "name": "code-language-tags", "description": "ALL code blocks have language specifiers" },
    { "name": "h2-h3-structure", "description": "Uses ## headers" },
    { "name": "no-banned-phrases", "description": "No EN/ZH AI phrases from blacklist" }
  ]
}
```

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/write-blog-workspace/iteration-3/
git commit -m "feat(write-blog): setup iter-3 directory structure with 4 eval metadata files"
```

---

## Task 4: Dispatch 8 subagents for iteration-3 benchmark

**Files:**

- Output: `.claude/skills/write-blog-workspace/iteration-3/<eval>/<config>/outputs/*.md` (8 files)

**Note:** Use the Agent tool to dispatch each subagent. Do NOT use Bash. Dispatch all 8 agents in a single message using multiple Agent tool calls in parallel.

- [ ] **Step 1: Dispatch with_skill agent for docker-multistage**

Agent config:

- description: `with_skill: Docker multi-stage`
- subagent_type: `general-purpose`
- mode: `bypassPermissions`
- run_in_background: `true`
- prompt:

  ```
  Read .claude/skills/write-blog/SKILL.md and follow its instructions exactly to write:
  寫一篇關於 Docker multi-stage build 的教學文章

  Save output to: .claude/skills/write-blog-workspace/iteration-3/docker-multistage/with_skill/outputs/docker-multi-stage-build.md

  Do NOT save to src/content/blog/. Follow all skill rules (frontmatter, blockquote, code language tags, 100-160 char description, NO banned phrases from the list).
  ```

- [ ] **Step 2: Dispatch without_skill agent for docker-multistage**

Agent config:

- description: `without_skill: Docker multi-stage`
- subagent_type: `general-purpose`
- mode: `bypassPermissions`
- run_in_background: `true`
- prompt:

  ```
  Write a Traditional Chinese blog post for "Ray's Notes" technical blog:
  寫一篇關於 Docker multi-stage build 的教學文章

  Include proper markdown frontmatter (title, description, date: 2026-04-10, category, tags with 'AI生成' first, postSlug).
  Save to: .claude/skills/write-blog-workspace/iteration-3/docker-multistage/without_skill/outputs/docker-multi-stage-build.md
  ```

- [ ] **Step 3: Dispatch with_skill agent for aspnet-middleware**

Agent config:

- description: `with_skill: ASP.NET Middleware`
- subagent_type: `general-purpose`
- mode: `bypassPermissions`
- run_in_background: `true`
- prompt:

  ```
  Read .claude/skills/write-blog/SKILL.md and follow its instructions exactly to write:
  幫我寫一篇文章，介紹如何在 ASP.NET Core 中使用 Middleware 處理全域例外

  Save output to: .claude/skills/write-blog-workspace/iteration-3/aspnet-middleware/with_skill/outputs/aspnet-core-global-exception-middleware.md

  Do NOT save to src/content/blog/. Follow all skill rules including NO banned phrases.
  ```

- [ ] **Step 4: Dispatch without_skill agent for aspnet-middleware**

Agent config:

- description: `without_skill: ASP.NET Middleware`
- subagent_type: `general-purpose`
- mode: `bypassPermissions`
- run_in_background: `true`
- prompt:

  ```
  Write a Traditional Chinese blog post for "Ray's Notes" technical blog:
  幫我寫一篇文章，介紹如何在 ASP.NET Core 中使用 Middleware 處理全域例外

  Include proper markdown frontmatter (title, description, date: 2026-04-10, category, tags with 'AI生成' first, postSlug).
  Save to: .claude/skills/write-blog-workspace/iteration-3/aspnet-middleware/without_skill/outputs/aspnet-core-global-exception-middleware.md
  ```

- [ ] **Step 5: Dispatch with_skill agent for git-rebase-vs-merge**

Agent config:

- description: `with_skill: Git rebase vs merge`
- subagent_type: `general-purpose`
- mode: `bypassPermissions`
- run_in_background: `true`
- prompt:

  ```
  Read .claude/skills/write-blog/SKILL.md and follow its instructions exactly to write:
  寫一篇 Git rebase vs merge 的比較文章

  Save output to: .claude/skills/write-blog-workspace/iteration-3/git-rebase-vs-merge/with_skill/outputs/git-rebase-vs-merge.md

  Do NOT save to src/content/blog/. Follow all skill rules including NO banned phrases.
  ```

- [ ] **Step 6: Dispatch without_skill agent for git-rebase-vs-merge**

Agent config:

- description: `without_skill: Git rebase vs merge`
- subagent_type: `general-purpose`
- mode: `bypassPermissions`
- run_in_background: `true`
- prompt:

  ```
  Write a Traditional Chinese blog post for "Ray's Notes" technical blog:
  寫一篇 Git rebase vs merge 的比較文章

  Include proper markdown frontmatter (title, description, date: 2026-04-10, category, tags with 'AI生成' first, postSlug).
  Save to: .claude/skills/write-blog-workspace/iteration-3/git-rebase-vs-merge/without_skill/outputs/git-rebase-vs-merge.md
  ```

- [ ] **Step 7: Dispatch with_skill agent for hexo-to-astro-upgrade (NEW personal context)**

Agent config:

- description: `with_skill: Hexo to Astro upgrade`
- subagent_type: `general-purpose`
- mode: `bypassPermissions`
- run_in_background: `true`
- prompt:

  ```
  Read .claude/skills/write-blog/SKILL.md and follow its instructions exactly to write:
  我剛把部落格從 Hexo 升級到 Astro，過程中踩了幾個坑，想寫一篇記錄

  This prompt has personal context — inject first-person narrative, specific pain points, and personal takeaways. Do NOT write a generic Astro introduction.

  Save output to: .claude/skills/write-blog-workspace/iteration-3/hexo-to-astro-upgrade/with_skill/outputs/hexo-to-astro-upgrade.md

  Do NOT save to src/content/blog/. Follow all skill rules including NO banned phrases and voice guidance.
  ```

- [ ] **Step 8: Dispatch without_skill agent for hexo-to-astro-upgrade**

Agent config:

- description: `without_skill: Hexo to Astro upgrade`
- subagent_type: `general-purpose`
- mode: `bypassPermissions`
- run_in_background: `true`
- prompt:

  ```
  Write a Traditional Chinese blog post for "Ray's Notes" technical blog:
  我剛把部落格從 Hexo 升級到 Astro，過程中踩了幾個坑，想寫一篇記錄

  Include proper markdown frontmatter (title, description, date: 2026-04-10, category, tags with 'AI生成' first, postSlug).
  Save to: .claude/skills/write-blog-workspace/iteration-3/hexo-to-astro-upgrade/without_skill/outputs/hexo-to-astro-upgrade.md
  ```

- [ ] **Step 9: As each agent completes, save timing.json**

When each task notification arrives with `total_tokens` and `duration_ms`, write to the corresponding `<eval>/<config>/timing.json`:

```json
{
  "total_tokens": <from notification>,
  "duration_ms": <from notification>,
  "total_duration_seconds": <duration_ms / 1000>
}
```

- [ ] **Step 10: Verify all 8 output files exist**

```bash
ls .claude/skills/write-blog-workspace/iteration-3/*/with_skill/outputs/*.md
ls .claude/skills/write-blog-workspace/iteration-3/*/without_skill/outputs/*.md
```

Expected: 8 files total (4 with_skill + 4 without_skill).

---

## Task 5: Run grading and generate iteration-3 benchmark.json

**Files:**

- Create: `.claude/skills/write-blog-workspace/iteration-3/<eval>/<config>/grading.json` (x8)
- Create: `.claude/skills/write-blog-workspace/iteration-3/benchmark.json`

- [ ] **Step 1: Run grade_iter3.py**

```bash
cd C:/Users/RayChiu/Desktop/Source/GithubRepos/raychiutw.github.io
python .claude/skills/write-blog-workspace/grade_iter3.py
```

Expected output: 8 eval results printed, each showing pass/fail counts and the new `no-banned-phrases` assertion result.

- [ ] **Step 2: Manually construct benchmark.json from grading results**

Read each `grading.json` file and construct `iteration-3/benchmark.json` with this schema:

```json
{
  "skill_name": "write-blog",
  "iteration": 3,
  "configurations": [
    {
      "name": "with_skill",
      "evals": [
        {
          "eval_name": "docker-multistage",
          "pass_rate": <passed/total>,
          "total_tokens": <from timing.json>,
          "duration_seconds": <from timing.json>,
          "assertions": { <flat dict of name -> bool> }
        }
      ],
      "summary": {
        "mean_pass_rate": <average>,
        "mean_tokens": <average>,
        "mean_duration_seconds": <average>
      }
    },
    { "name": "without_skill", "evals": [...], "summary": {...} }
  ],
  "delta": {
    "pass_rate": "+X%",
    "tokens": "...",
    "duration": "..."
  }
}
```

- [ ] **Step 3: Verify with_skill 4/4 PASS for no-banned-phrases**

Check the benchmark: all 4 with_skill evals must have `"no-banned-phrases": true`.

If any FAIL: read the grading.json for the failing eval, identify which phrase was used, and note this in the iteration-3 findings. This is informational — iter-3 exit criteria is that the assertion is **measurable**, not necessarily all-pass.

- [ ] **Step 4: Generate review viewer**

```bash
PYTHONUTF8=1 python C:/Users/RayChiu/.claude/plugins/cache/claude-plugins-official/skill-creator/unknown/skills/skill-creator/eval-viewer/generate_review.py .claude/skills/write-blog-workspace/iteration-3 --skill-name write-blog --benchmark .claude/skills/write-blog-workspace/iteration-3/benchmark.json --previous-workspace .claude/skills/write-blog-workspace/iteration-2 --static .claude/skills/write-blog-workspace/iteration-3/review.html
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/write-blog-workspace/iteration-3/
git commit -m "feat(write-blog): complete iter-3 benchmark with no-banned-phrases assertion"
```

---

## Task 6: Update quality_checklist.md with iter-3 results

**Files:**

- Modify: `.claude/skills/write-blog/references/quality_checklist.md`

- [ ] **Step 1: Add Benchmark Results (Iteration 3) section**

After the `## Benchmark Results (Iteration 2)` section, add:

```markdown
## Benchmark Results (Iteration 3)

- Test cases: 4 (added hexo-to-astro-upgrade for personal context testing)
- New assertion: `no-banned-phrases` (EN + ZH AI phrase blacklist)
- with_skill pass rate: <X%> (<X/32 assertions across 4 evals>)
- baseline pass rate: <X%>
- Delta: <+X%>
- no-banned-phrases result: with_skill <X/4> PASS vs baseline <X/4> PASS
- Em dash explicitly allowed (Ray's signature style, not treated as AI pattern)
- Voice guidance added (soft rule, validated qualitatively via hexo-to-astro test)
```

Replace `<X>` placeholders with actual values from `iteration-3/benchmark.json`.

- [ ] **Step 2: Update Final Gate**

Change the `## Final Gate` line to:

```markdown
## Final Gate

- [x] PASS — skill passed iter-3 with banned phrases enforcement active
```

- [ ] **Step 3: Format with Prettier**

```bash
pnpm format -- .claude/skills/write-blog/references/quality_checklist.md
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/write-blog/references/quality_checklist.md
git commit -m "docs(write-blog): update quality_checklist with iter-3 results"
```

---

# Iteration 4: analyze_blog.py 5-Dimension Scoring Script

## Task 7: Create analyze_blog.py skeleton with CLI and data structures

**Files:**

- Create: `.claude/skills/write-blog/scripts/analyze_blog.py`

- [ ] **Step 1: Create scripts directory**

```bash
mkdir -p .claude/skills/write-blog/scripts
```

- [ ] **Step 2: Write the skeleton file**

Write to `.claude/skills/write-blog/scripts/analyze_blog.py`:

```python
"""5-dimension blog post quality analyzer for Ray's Notes write-blog skill."""
import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

CATEGORIES = {
    "structure": 20,
    "style": 25,
    "originality": 25,
    "technical": 15,
    "readability": 15,
}

BANNED_EN = [
    "delve into", "delve", "leverage ",
    "dive into", "dive deep", "cutting-edge",
    "seamless", "game-changer", "game-changing",
    "revolutionize", "pivotal",
    "unlock", "unleash",
    "in today's fast-paced world",
    "tapestry", "embark on",
]

BANNED_ZH = [
    "讓我們一起深入探討", "隨著", "值得注意的是",
    "不僅", "不可或缺", "至關重要",
    "綜上所述", "總而言之",
    "在本文中，我們將會探討",
    "眾所周知", "毫無疑問", "眾多的", "諸如此類",
]

OPINION_MARKERS = ["我的做法", "實務上", "我覺得", "踩過的坑", "我通常", "我會選"]


def parse_frontmatter(content: str) -> str:
    """Extract YAML frontmatter block as raw text."""
    m = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    return m.group(1) if m else ""


def split_sentences_zh(text: str) -> list[str]:
    """Split Chinese text into sentences by punctuation."""
    sentences = re.split(r"[。！？\n]+", text)
    return [s.strip() for s in sentences if s.strip()]


def analyze(content: str) -> dict[str, Any]:
    """Run all 5 category analyzers. Returns flat dict with scores and issues."""
    result: dict[str, Any] = {
        "categories": {},
        "total": 0,
    }
    # Filled in by subsequent tasks
    return result


def format_table(result: dict[str, Any], file_path: str) -> str:
    """Format result as human-readable table."""
    # Filled in by subsequent tasks
    return ""


def format_json(result: dict[str, Any], file_path: str) -> str:
    """Format result as JSON."""
    return json.dumps(result, indent=2, ensure_ascii=False)


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze blog post quality")
    parser.add_argument("path", help="Path to .md file or directory")
    parser.add_argument("--format", choices=["table", "json"], default="table")
    parser.add_argument("--threshold", type=int, default=80)
    args = parser.parse_args()

    target = Path(args.path)
    files = [target] if target.is_file() else list(target.rglob("*.md"))

    failed = False
    for f in files:
        content = f.read_text(encoding="utf-8")
        result = analyze(content)
        if args.format == "json":
            print(format_json(result, str(f)))
        else:
            print(format_table(result, str(f)))
        if result["total"] < args.threshold:
            failed = True

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 3: Verify skeleton runs without error**

```bash
cd C:/Users/RayChiu/Desktop/Source/GithubRepos/raychiutw.github.io
python .claude/skills/write-blog/scripts/analyze_blog.py src/content/blog/ai-agent-team-rebuild-blog.md
```

Expected: runs without crash, prints empty result (since analyzers not yet implemented).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/write-blog/scripts/analyze_blog.py
git commit -m "feat(write-blog): add analyze_blog.py skeleton with CLI and constants"
```

---

## Task 8: Create test_analyze_blog.py with unittest harness

**Files:**

- Create: `.claude/skills/write-blog/scripts/test_analyze_blog.py`

- [ ] **Step 1: Write the test file with initial structure test**

Write to `.claude/skills/write-blog/scripts/test_analyze_blog.py`:

````python
"""Unit tests for analyze_blog.py."""
import unittest
from analyze_blog import analyze, parse_frontmatter, split_sentences_zh

VALID_POST = """---
title: 'Test Post'
description: '這是一個測試用的描述，長度在一百到一百六十個字元之間，用來驗證 description-length assertion 能正確通過測試。'
date: 2026-04-10
category: '程式開發'
tags: ['AI生成', 'Test']
postSlug: 'test-post'
---

> 這是 blockquote 開場

## H2 標題一

一些內容。我的做法是這樣做。

```cs
public void Test() { }
````

## H2 標題二

更多內容。實務上我會選這個方案。
"""

class TestParseFrontmatter(unittest.TestCase):
def test_extracts_frontmatter(self):
fm = parse_frontmatter(VALID_POST)
self.assertIn("title: 'Test Post'", fm)
self.assertIn("postSlug: 'test-post'", fm)

    def test_no_frontmatter(self):
        self.assertEqual(parse_frontmatter("no frontmatter here"), "")

class TestSplitSentencesZh(unittest.TestCase):
def test_splits_by_period(self):
text = "第一句。第二句。第三句。"
self.assertEqual(len(split_sentences_zh(text)), 3)

    def test_splits_by_question_mark(self):
        text = "這是問題？這是答案。"
        self.assertEqual(len(split_sentences_zh(text)), 2)

class TestAnalyzeIntegration(unittest.TestCase):
def test_returns_dict_with_categories(self):
result = analyze(VALID_POST)
self.assertIn("categories", result)
self.assertIn("total", result)

if **name** == "**main**":
unittest.main()

````

- [ ] **Step 2: Run the tests (should pass)**

```bash
cd .claude/skills/write-blog/scripts
python -m unittest test_analyze_blog.py -v
````

Expected: `test_extracts_frontmatter`, `test_no_frontmatter`, `test_splits_by_period`, `test_splits_by_question_mark`, `test_returns_dict_with_categories` — all PASS.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/write-blog/scripts/test_analyze_blog.py
git commit -m "test(write-blog): add unittest harness for analyze_blog"
```

---

## Task 9: Implement Structure scoring (20 points)

**Files:**

- Modify: `.claude/skills/write-blog/scripts/analyze_blog.py`
- Modify: `.claude/skills/write-blog/scripts/test_analyze_blog.py`

- [ ] **Step 1: Write failing tests for Structure scoring**

Add to `test_analyze_blog.py` (after imports, before `if __name__`):

```python
from analyze_blog import score_structure

INVALID_POST_NO_FRONTMATTER = "# Just a title\n\nNo frontmatter."

class TestStructureScoring(unittest.TestCase):
    def test_valid_post_full_score(self):
        result = score_structure(VALID_POST)
        self.assertEqual(result["score"], 20)
        self.assertEqual(result["max"], 20)
        self.assertEqual(len(result["issues"]), 0)

    def test_missing_frontmatter_penalized(self):
        result = score_structure(INVALID_POST_NO_FRONTMATTER)
        self.assertLess(result["score"], 20)
        self.assertGreater(len(result["issues"]), 0)
```

- [ ] **Step 2: Run tests to confirm failure**

```bash
cd .claude/skills/write-blog/scripts
python -m unittest test_analyze_blog.TestStructureScoring -v
```

Expected: FAIL with `ImportError: cannot import name 'score_structure'`.

- [ ] **Step 3: Implement score_structure in analyze_blog.py**

Add after `analyze` function:

````python
def score_structure(content: str) -> dict[str, Any]:
    """Score structure dimension: 7 assertions, ~3 points each (20 total)."""
    issues: list[str] = []
    score = 20
    fm = parse_frontmatter(content)

    # frontmatter-complete (3 points)
    required = ["title", "description", "date", "category", "tags", "postSlug"]
    missing = [f for f in required if not re.search(rf"^{f}\s*:", fm, re.MULTILINE)]
    if missing:
        score -= 3
        issues.append(f"frontmatter missing: {missing}")

    # description-length (3 points)
    dm = re.search(r"^description:\s*['\"](.+?)['\"]", fm, re.MULTILINE)
    if not dm:
        score -= 3
        issues.append("description not found or not quoted")
    else:
        length = len(dm.group(1))
        if not (100 <= length <= 160):
            score -= 3
            issues.append(f"description length {length} out of range 100-160")

    # ai-tag-first (3 points)
    tm = re.search(r"^tags:\s*\[(.+?)\]", fm, re.MULTILINE)
    if tm:
        first = re.match(r"\s*['\"](.+?)['\"]", tm.group(1))
        if not first or first.group(1) != "AI生成":
            score -= 3
            issues.append("first tag is not 'AI生成'")
    else:
        score -= 3
        issues.append("tags not found")

    # slug-kebab-case (3 points)
    sm = re.search(r"^postSlug:\s*['\"](.+?)['\"]", fm, re.MULTILINE)
    if not sm or not re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", sm.group(1)):
        score -= 3
        issues.append("postSlug missing or not kebab-case")

    # blockquote-opening (3 points)
    after_fm = re.sub(r"^---.*?---\s*", "", content, count=1, flags=re.DOTALL)
    first_line = after_fm.strip().split("\n")[0] if after_fm.strip() else ""
    if not first_line.startswith(">"):
        score -= 3
        issues.append("no blockquote opening")

    # code-language-tags (3 points)
    in_block = False
    bare = 0
    for line in content.split("\n"):
        s = line.strip()
        if s.startswith("```"):
            if not in_block:
                if not s[3:].strip():
                    bare += 1
                in_block = True
            else:
                in_block = False
    if bare > 0:
        score -= 3
        issues.append(f"{bare} code blocks without language tag")

    # h2-h3-structure (2 points)
    h2_count = len(re.findall(r"^## ", content, re.MULTILINE))
    if h2_count < 2:
        score -= 2
        issues.append(f"only {h2_count} H2 headers (need >= 2)")

    return {"score": max(score, 0), "max": 20, "issues": issues}
````

- [ ] **Step 4: Run tests to confirm pass**

```bash
cd .claude/skills/write-blog/scripts
python -m unittest test_analyze_blog.TestStructureScoring -v
```

Expected: Both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/write-blog/scripts/analyze_blog.py .claude/skills/write-blog/scripts/test_analyze_blog.py
git commit -m "feat(write-blog): implement Structure scoring (20 points, 7 assertions)"
```

---

## Task 10: Implement Style scoring (25 points)

**Files:**

- Modify: `.claude/skills/write-blog/scripts/analyze_blog.py`
- Modify: `.claude/skills/write-blog/scripts/test_analyze_blog.py`

- [ ] **Step 1: Write failing tests for Style scoring**

Add to `test_analyze_blog.py`:

```python
from analyze_blog import score_style

BANNED_POST = VALID_POST + "\n\n這個功能至關重要，讓我們一起深入探討。"

class TestStyleScoring(unittest.TestCase):
    def test_clean_post_no_penalty(self):
        result = score_style(VALID_POST)
        self.assertEqual(result["score"], 25)

    def test_banned_phrase_detected(self):
        result = score_style(BANNED_POST)
        self.assertLess(result["score"], 25)
        issues_text = " ".join(result["issues"])
        self.assertIn("至關重要", issues_text)

    def test_low_burstiness_penalized(self):
        # All sentences exactly 20 chars → std dev = 0
        monotone = "---\ntitle: 't'\ndescription: '一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三'\ndate: 2026-04-10\ncategory: 'a'\ntags: ['AI生成']\npostSlug: 't'\n---\n\n> 短\n\n## H2\n\n這是一個剛剛好二十字元的句子測試資料。這也是剛好二十字元的句子測試資料。這同樣是剛好二十字元句子測試資料啦。"
        result = score_style(monotone)
        issues_text = " ".join(result["issues"])
        self.assertIn("burstiness", issues_text.lower())
```

- [ ] **Step 2: Run tests to confirm failure**

```bash
cd .claude/skills/write-blog/scripts
python -m unittest test_analyze_blog.TestStyleScoring -v
```

Expected: FAIL with `ImportError: cannot import name 'score_style'`.

- [ ] **Step 3: Implement score_style**

Add to `analyze_blog.py`:

````python
def score_style(content: str) -> dict[str, Any]:
    """Score style dimension: AI phrase detection + burstiness + TTR + repetitive structures."""
    issues: list[str] = []
    score = 25

    # banned-phrases: -3 per violation
    content_lower = content.lower()
    for phrase in BANNED_EN:
        count = content_lower.count(phrase.lower())
        if count > 0:
            penalty = 3 * count
            score -= penalty
            issues.append(f"banned EN '{phrase.strip()}' x{count} (-{penalty})")
    for phrase in BANNED_ZH:
        count = content.count(phrase)
        if count > 0:
            penalty = 3 * count
            score -= penalty
            issues.append(f"banned ZH '{phrase}' x{count} (-{penalty})")

    # Strip frontmatter and code blocks for sentence analysis
    body = re.sub(r"^---.*?---\s*", "", content, count=1, flags=re.DOTALL)
    body = re.sub(r"```.*?```", "", body, flags=re.DOTALL)
    sentences = split_sentences_zh(body)

    if len(sentences) >= 5:
        # burstiness: sentence length std dev
        lengths = [len(s) for s in sentences]
        mean = sum(lengths) / len(lengths)
        variance = sum((x - mean) ** 2 for x in lengths) / len(lengths)
        stddev = variance ** 0.5
        if stddev < 15:
            score -= 5
            issues.append(f"low burstiness {stddev:.1f} (std dev < 15)")

        # TTR: unique chars / total chars (simple proxy for Chinese)
        all_chars = "".join(sentences)
        unique = len(set(all_chars))
        total = len(all_chars)
        ttr = unique / total if total > 0 else 0
        if ttr < 0.35:
            score -= 5
            issues.append(f"low TTR {ttr:.2f} (< 0.35)")

    # repetitive structures
    if re.search(r"首先.*?其次.*?最後", content, re.DOTALL):
        score -= 3
        issues.append("repetitive '首先...其次...最後' structure")

    return {"score": max(score, 0), "max": 25, "issues": issues}
````

- [ ] **Step 4: Run tests to confirm pass**

```bash
cd .claude/skills/write-blog/scripts
python -m unittest test_analyze_blog.TestStyleScoring -v
```

Expected: 3 PASS.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/write-blog/scripts/analyze_blog.py .claude/skills/write-blog/scripts/test_analyze_blog.py
git commit -m "feat(write-blog): implement Style scoring (25 points, banned phrases + burstiness + TTR)"
```

---

## Task 11: Implement Originality scoring (25 points)

**Files:**

- Modify: `.claude/skills/write-blog/scripts/analyze_blog.py`
- Modify: `.claude/skills/write-blog/scripts/test_analyze_blog.py`

- [ ] **Step 1: Write failing tests for Originality scoring**

Add to `test_analyze_blog.py`:

```python
from analyze_blog import score_originality

IMPERSONAL_POST = """---
title: 'T'
description: '一個沒有第一人稱和沒有意見標記的測試文章描述，用來驗證 originality 維度扣分功能正常'
date: 2026-04-10
category: 'a'
tags: ['AI生成']
postSlug: 't'
---

> 客觀描述

## H2

這是一個完全客觀的技術說明，沒有任何個人觀點。
"""

GENERIC_INTRO_POST = """---
title: 'T'
description: '一個有 generic intro 的測試文章，用來驗證 generic-intro-check 可以偵測到「在本文中」這類 AI 開場白'
date: 2026-04-10
category: 'a'
tags: ['AI生成']
postSlug: 't'
---

> 在本文中我們將會探討這個主題

## H2

內容。
"""

class TestOriginalityScoring(unittest.TestCase):
    def test_post_with_opinion_markers_full_score(self):
        result = score_originality(VALID_POST)
        self.assertEqual(result["score"], 25)

    def test_no_first_person_penalized(self):
        result = score_originality(IMPERSONAL_POST)
        self.assertLess(result["score"], 25)
        issues_text = " ".join(result["issues"])
        self.assertIn("first-person", issues_text.lower())

    def test_generic_intro_penalized(self):
        result = score_originality(GENERIC_INTRO_POST)
        issues_text = " ".join(result["issues"])
        self.assertIn("generic", issues_text.lower())
```

- [ ] **Step 2: Run tests to confirm failure**

```bash
cd .claude/skills/write-blog/scripts
python -m unittest test_analyze_blog.TestOriginalityScoring -v
```

Expected: FAIL with ImportError.

- [ ] **Step 3: Implement score_originality**

Add to `analyze_blog.py`:

```python
def score_originality(content: str) -> dict[str, Any]:
    """Score originality: first-person presence + opinion markers + generic intro check."""
    issues: list[str] = []
    score = 25

    body = re.sub(r"^---.*?---\s*", "", content, count=1, flags=re.DOTALL)

    # first-person-presence: "我" or "筆者"
    first_person_count = body.count("我") + body.count("筆者")
    if first_person_count == 0:
        score -= 10
        issues.append("no first-person pronouns (我/筆者)")

    # opinion-markers
    opinion_count = sum(1 for m in OPINION_MARKERS if m in body)
    if opinion_count < 1:
        score -= 8
        issues.append(f"no opinion markers from {OPINION_MARKERS}")

    # generic-intro-check: look in first 200 chars after frontmatter
    intro = body.strip()[:200]
    generic_patterns = ["在本文中", "讓我們", "本篇文章將", "本文將"]
    for pattern in generic_patterns:
        if pattern in intro:
            score -= 7
            issues.append(f"generic intro phrase '{pattern}'")
            break

    return {"score": max(score, 0), "max": 25, "issues": issues}
```

- [ ] **Step 4: Run tests to confirm pass**

```bash
cd .claude/skills/write-blog/scripts
python -m unittest test_analyze_blog.TestOriginalityScoring -v
```

Expected: 3 PASS.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/write-blog/scripts/analyze_blog.py .claude/skills/write-blog/scripts/test_analyze_blog.py
git commit -m "feat(write-blog): implement Originality scoring (25 points, voice detection)"
```

---

## Task 12: Implement Technical scoring (15 points)

**Files:**

- Modify: `.claude/skills/write-blog/scripts/analyze_blog.py`
- Modify: `.claude/skills/write-blog/scripts/test_analyze_blog.py`

- [ ] **Step 1: Write failing tests**

Add to `test_analyze_blog.py`:

```python
from analyze_blog import score_technical

class TestTechnicalScoring(unittest.TestCase):
    def test_valid_post_with_import(self):
        post = VALID_POST.replace("public void Test() { }", "using System;\npublic void Test() { }")
        result = score_technical(post)
        self.assertGreaterEqual(result["score"], 10)

    def test_bare_url_penalized(self):
        bad = VALID_POST + "\n\n參考：https://example.com 這個網站。"
        result = score_technical(bad)
        issues_text = " ".join(result["issues"])
        self.assertIn("link", issues_text.lower())
```

- [ ] **Step 2: Run to confirm failure**

```bash
python -m unittest test_analyze_blog.TestTechnicalScoring -v
```

Expected: FAIL with ImportError.

- [ ] **Step 3: Implement score_technical**

Add to `analyze_blog.py`:

````python
def score_technical(content: str) -> dict[str, Any]:
    """Score technical: code completeness + version specificity + link format."""
    issues: list[str] = []
    score = 15

    # code-completeness: check that at least one code block has import/using/#include/function def
    code_blocks = re.findall(r"```\w+\n(.*?)\n```", content, re.DOTALL)
    if code_blocks:
        has_complete = any(
            re.search(r"\b(import|using|#include|def |function |public |class )\b", cb)
            for cb in code_blocks
        )
        if not has_complete:
            score -= 5
            issues.append("code blocks look like fragments (no import/using/#include/def)")

    # link-format: bare URL not wrapped in markdown [text](url)
    body = re.sub(r"\[([^\]]+)\]\(([^\)]+)\)", "", content)  # strip markdown links
    body = re.sub(r"```.*?```", "", body, flags=re.DOTALL)  # strip code blocks
    body = re.sub(r"`[^`]+`", "", body)  # strip inline code
    bare_urls = re.findall(r"https?://[^\s\)]+", body)
    if bare_urls:
        score -= 5
        issues.append(f"{len(bare_urls)} bare URLs (not markdown-linked)")

    # version-specificity: placeholder (hard to heuristic-detect reliably)
    # Award full 5 points for this criterion unless obvious issues
    # (Can be hardened in iter-5 if needed)

    return {"score": max(score, 0), "max": 15, "issues": issues}
````

- [ ] **Step 4: Run to confirm pass**

```bash
python -m unittest test_analyze_blog.TestTechnicalScoring -v
```

Expected: 2 PASS.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/write-blog/scripts/analyze_blog.py .claude/skills/write-blog/scripts/test_analyze_blog.py
git commit -m "feat(write-blog): implement Technical scoring (15 points)"
```

---

## Task 13: Implement Readability scoring (15 points)

**Files:**

- Modify: `.claude/skills/write-blog/scripts/analyze_blog.py`
- Modify: `.claude/skills/write-blog/scripts/test_analyze_blog.py`

- [ ] **Step 1: Write failing tests**

Add to `test_analyze_blog.py`:

```python
from analyze_blog import score_readability

class TestReadabilityScoring(unittest.TestCase):
    def test_valid_post_readable(self):
        result = score_readability(VALID_POST)
        self.assertGreaterEqual(result["score"], 12)

    def test_heading_skip_penalized(self):
        bad = VALID_POST.replace("## H2 標題一", "## H2 標題一\n\n#### H4 跳級標題")
        result = score_readability(bad)
        issues_text = " ".join(result["issues"])
        self.assertIn("heading", issues_text.lower())
```

- [ ] **Step 2: Run to confirm failure**

```bash
python -m unittest test_analyze_blog.TestReadabilityScoring -v
```

Expected: FAIL with ImportError.

- [ ] **Step 3: Implement score_readability**

Add to `analyze_blog.py`:

````python
def score_readability(content: str) -> dict[str, Any]:
    """Score readability: sentence length + paragraph length + code ratio + heading hierarchy."""
    issues: list[str] = []
    score = 15

    body = re.sub(r"^---.*?---\s*", "", content, count=1, flags=re.DOTALL)
    text_no_code = re.sub(r"```.*?```", "", body, flags=re.DOTALL)
    sentences = split_sentences_zh(text_no_code)

    # avg-sentence-length: sweet spot 15-35 chars
    if sentences:
        avg = sum(len(s) for s in sentences) / len(sentences)
        if avg > 50 or avg < 10:
            score -= 4
            issues.append(f"avg sentence length {avg:.0f} chars out of 10-50 range")

    # paragraph-length: < 200 chars
    paragraphs = [p.strip() for p in text_no_code.split("\n\n") if p.strip() and not p.startswith("#")]
    long_paras = [p for p in paragraphs if len(p) > 200]
    if long_paras:
        score -= 3
        issues.append(f"{len(long_paras)} paragraphs over 200 chars")

    # code-text-ratio: code should be 15-60% of content
    code_chars = sum(len(cb) for cb in re.findall(r"```.*?```", body, re.DOTALL))
    total_chars = len(body)
    if total_chars > 0:
        ratio = code_chars / total_chars
        if ratio < 0.10 or ratio > 0.70:
            score -= 4
            issues.append(f"code ratio {ratio:.0%} out of 10-70% range")

    # heading-hierarchy: no skipping levels
    headings = re.findall(r"^(#{1,6}) ", body, re.MULTILINE)
    for i in range(1, len(headings)):
        prev_level = len(headings[i - 1])
        curr_level = len(headings[i])
        if curr_level > prev_level + 1:
            score -= 4
            issues.append(f"heading jumps from H{prev_level} to H{curr_level}")
            break

    return {"score": max(score, 0), "max": 15, "issues": issues}
````

- [ ] **Step 4: Run to confirm pass**

```bash
python -m unittest test_analyze_blog.TestReadabilityScoring -v
```

Expected: 2 PASS.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/write-blog/scripts/analyze_blog.py .claude/skills/write-blog/scripts/test_analyze_blog.py
git commit -m "feat(write-blog): implement Readability scoring (15 points)"
```

---

## Task 14: Integrate scoring + implement output formats

**Files:**

- Modify: `.claude/skills/write-blog/scripts/analyze_blog.py`
- Modify: `.claude/skills/write-blog/scripts/test_analyze_blog.py`

- [ ] **Step 1: Write integration test**

Add to `test_analyze_blog.py`:

```python
class TestIntegration(unittest.TestCase):
    def test_analyze_returns_all_categories(self):
        result = analyze(VALID_POST)
        self.assertEqual(set(result["categories"].keys()), {"structure", "style", "originality", "technical", "readability"})
        self.assertLessEqual(result["total"], 100)
        self.assertGreaterEqual(result["total"], 0)

    def test_valid_post_above_threshold(self):
        result = analyze(VALID_POST)
        self.assertGreaterEqual(result["total"], 70)

    def test_format_table_contains_scores(self):
        from analyze_blog import format_table
        result = analyze(VALID_POST)
        output = format_table(result, "test.md")
        self.assertIn("Structure", output)
        self.assertIn("Total", output)
```

- [ ] **Step 2: Run to confirm failure**

```bash
python -m unittest test_analyze_blog.TestIntegration -v
```

Expected: FAIL — `analyze` returns empty dict, `format_table` returns empty string.

- [ ] **Step 3: Update analyze() to call all scorers**

Replace the stub `analyze` function with:

```python
def analyze(content: str) -> dict[str, Any]:
    """Run all 5 category analyzers."""
    categories = {
        "structure": score_structure(content),
        "style": score_style(content),
        "originality": score_originality(content),
        "technical": score_technical(content),
        "readability": score_readability(content),
    }
    total = sum(c["score"] for c in categories.values())
    return {
        "categories": categories,
        "total": total,
    }
```

- [ ] **Step 4: Implement format_table**

Replace the stub `format_table` with:

```python
def format_table(result: dict[str, Any], file_path: str, threshold: int = 80) -> str:
    """Format result as human-readable table."""
    lines = [f"\nBlog Analysis: {Path(file_path).name}\n"]
    lines.append(f"{'Category':<13} {'Score':<10} Issues")
    lines.append("-" * 70)
    for name, data in result["categories"].items():
        score_str = f"{data['score']}/{data['max']}"
        issues_str = "✓ PASS" if not data["issues"] else data["issues"][0]
        lines.append(f"{name.capitalize():<13} {score_str:<10} {issues_str}")
        for issue in data["issues"][1:]:
            lines.append(f"{'':<13} {'':<10} {issue}")
    lines.append("-" * 70)
    status = "PASS" if result["total"] >= threshold else "FAIL"
    lines.append(f"{'Total':<13} {result['total']}/100    {status} (threshold {threshold})")
    return "\n".join(lines)
```

- [ ] **Step 5: Run integration tests**

```bash
python -m unittest test_analyze_blog.TestIntegration -v
```

Expected: 3 PASS.

- [ ] **Step 6: Run the full test suite**

```bash
python -m unittest test_analyze_blog -v
```

Expected: all tests PASS (17+ tests across 6 test classes).

- [ ] **Step 7: Smoke-test on a real post**

```bash
cd C:/Users/RayChiu/Desktop/Source/GithubRepos/raychiutw.github.io
python .claude/skills/write-blog/scripts/analyze_blog.py src/content/blog/claude-code-skill-development-workflow.md
```

Expected: prints table with 5 category scores and total.

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/write-blog/scripts/analyze_blog.py .claude/skills/write-blog/scripts/test_analyze_blog.py
git commit -m "feat(write-blog): integrate 5-dimension scoring and table output"
```

---

## Task 15: Run iteration-4 benchmark on iter-3 outputs

**Files:**

- Create: `.claude/skills/write-blog-workspace/iteration-4/benchmark.json`

- [ ] **Step 1: Create iter-4 directory**

```bash
mkdir -p .claude/skills/write-blog-workspace/iteration-4
```

- [ ] **Step 2: Run analyze_blog.py on all 8 iter-3 outputs with JSON format**

For each eval in (docker-multistage, aspnet-middleware, git-rebase-vs-merge, hexo-to-astro-upgrade) and each config in (with_skill, without_skill):

```bash
python .claude/skills/write-blog/scripts/analyze_blog.py \
  .claude/skills/write-blog-workspace/iteration-3/<eval>/<config>/outputs/<filename>.md \
  --format json > .claude/skills/write-blog-workspace/iteration-4/<eval>-<config>.json
```

(Generate 8 JSON files total.)

- [ ] **Step 3: Aggregate into benchmark.json**

Read all 8 JSON files and construct `iteration-4/benchmark.json`:

```json
{
  "skill_name": "write-blog",
  "iteration": 4,
  "configurations": [
    {
      "name": "with_skill",
      "mean_scores": {
        "structure": <avg>,
        "style": <avg>,
        "originality": <avg>,
        "technical": <avg>,
        "readability": <avg>,
        "total": <avg>
      },
      "evals": [
        {
          "eval_name": "docker-multistage",
          "scores": { "structure": <>, "style": <>, ... },
          "total": <>
        }
      ]
    },
    { "name": "without_skill", ... }
  ],
  "delta": {
    "total": "+X",
    "style": "+X",
    "originality": "+X"
  }
}
```

- [ ] **Step 4: Verify exit criteria**

- [ ] Check `with_skill.mean_scores.total >= 80`
- [ ] Check `delta.total >= 10`

If not met: document which dimensions are failing in the exit criteria report. Do NOT automatically proceed to iter-5 — record the failure and stop for review.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/write-blog-workspace/iteration-4/
git commit -m "feat(write-blog): complete iter-4 5-dimension benchmark"
```

---

## Task 16: Update quality_checklist.md with iter-4 results

**Files:**

- Modify: `.claude/skills/write-blog/references/quality_checklist.md`

- [ ] **Step 1: Add Benchmark Results (Iteration 4) section**

After the iter-3 section, add:

```markdown
## Benchmark Results (Iteration 4)

- Scoring script: `.claude/skills/write-blog/scripts/analyze_blog.py`
- Test coverage: unittest suite in `test_analyze_blog.py` (17+ tests)
- Threshold: 80/100
- with_skill mean total: <X/100>
- baseline mean total: <X/100>
- Delta: <+X>
- Category breakdown (with_skill):
  - Structure: <X/20>
  - Style: <X/25>
  - Originality: <X/25>
  - Technical: <X/15>
  - Readability: <X/15>
```

Replace `<X>` with actual values from `iteration-4/benchmark.json`.

- [ ] **Step 2: Format and commit**

```bash
pnpm format -- .claude/skills/write-blog/references/quality_checklist.md
git add .claude/skills/write-blog/references/quality_checklist.md
git commit -m "docs(write-blog): update quality_checklist with iter-4 scoring results"
```

---

# Iteration 5: Conditional Advanced Features

## Task 17: Analyze iter-4 results and select candidates

**Files:**

- Read: `.claude/skills/write-blog-workspace/iteration-4/benchmark.json`

- [ ] **Step 1: Read benchmark.json and evaluate decision criteria**

Apply the decision flow from the spec:

```text
IF Style >= 20 AND Structure >= 18 AND Originality < 15:
    → Select candidate C (Originality hardening) OR D (few-shot)

IF manual review found factual errors in outputs:
    → Select candidate A (fact-check)

IF outputs contained dead links or missing images:
    → Select candidate B (link validation)

IF with_skill total > 90 AND delta > 20:
    → Skip iter-5, mark complete
```

- [ ] **Step 2: Document the selection**

Create `.claude/skills/write-blog-workspace/iteration-5/selection.md` with:

```markdown
# Iteration 5 Candidate Selection

## iter-4 Results

- Total: <X/100>
- Structure: <X/20>
- Style: <X/25>
- Originality: <X/25>
- Technical: <X/15>
- Readability: <X/15>

## Selected Candidates

- <A/B/C/D or "none">

## Rationale

<Why these were selected based on decision criteria>
```

- [ ] **Step 3: Commit selection doc**

```bash
mkdir -p .claude/skills/write-blog-workspace/iteration-5
git add .claude/skills/write-blog-workspace/iteration-5/selection.md
git commit -m "docs(write-blog): document iter-5 candidate selection"
```

---

## Task 18: Implement selected candidates (conditional on Task 17)

**Note:** This task is a placeholder with branches. Only the branch matching the selected candidate should be executed.

### Branch A: Fact-check Pipeline (if selected)

- [ ] **Step A1: Add fact-check prompt to SKILL.md**

Add section `## 事實驗證` to SKILL.md with instructions for Claude to list every statistic/version number and mark unverified claims with `[UNVERIFIED]`.

- [ ] **Step A2: Add `--fact-check` mode to analyze_blog.py**

Extend analyze_blog.py with a `--fact-check` flag that extracts URLs and statistics and reports them without scoring.

- [ ] **Step A3: Test on a real post**

```bash
python .claude/skills/write-blog/scripts/analyze_blog.py src/content/blog/claude-code-skill-development-workflow.md --fact-check
```

- [ ] **Step A4: Commit**

```bash
git add .claude/skills/write-blog/
git commit -m "feat(write-blog): add fact-check mode to analyze_blog"
```

### Branch B: Link Validation (if selected)

- [ ] **Step B1: Add `--check-links` mode to analyze_blog.py**

Implement:

- Extract all markdown links `[text](url)`
- For external URLs, run `curl -sI <url>` and check for `HTTP/.* 200`
- For `/images/blog/` paths, check file exists in `public/images/blog/`
- For internal `./post-name` links, verify the post exists in `src/content/blog/`

- [ ] **Step B2: Test on existing posts**

```bash
python .claude/skills/write-blog/scripts/analyze_blog.py src/content/blog/ --check-links
```

- [ ] **Step B3: Commit**

```bash
git add .claude/skills/write-blog/
git commit -m "feat(write-blog): add link validation mode to analyze_blog"
```

### Branch C: Originality Hardening (if selected)

- [ ] **Step C1: Add hard assertion `must-have-opinion-marker` to grade script**

Create `grade_iter5.py` from `grade_iter3.py`, add:

```python
# 9. must-have-opinion-marker
has_opinion = any(m in content for m in ["我的做法", "實務上", "我覺得", "踩過的坑", "我通常", "我會選"])
results.append({
    "text": "must-have-opinion-marker",
    "passed": has_opinion,
    "evidence": "Found opinion marker" if has_opinion else "No opinion markers",
})
```

- [ ] **Step C2: Update SKILL.md to make the voice rule mandatory**

Change the voice section in SKILL.md from "優先放進" to "必須包含至少一個：" for opinion markers.

- [ ] **Step C3: Re-dispatch iter-3 with_skill agents with updated skill**

Same as Task 4 steps but only the 4 with_skill agents.

- [ ] **Step C4: Run grade_iter5.py**

```bash
python .claude/skills/write-blog-workspace/grade_iter5.py
```

Verify `must-have-opinion-marker` passes 4/4.

- [ ] **Step C5: Commit**

```bash
git add .claude/skills/write-blog/ .claude/skills/write-blog-workspace/
git commit -m "feat(write-blog): harden Originality rules with must-have-opinion-marker assertion"
```

### Branch D: Writing Style Calibration / Few-shot (if selected)

- [ ] **Step D1: Identify a high-quality reference post**

Select one of Ray's existing posts that best represents the target voice:

```bash
ls -la src/content/blog/ai-agent-team-rebuild-blog.md
```

- [ ] **Step D2: Add few-shot section to SKILL.md**

Add `## 風格示範（Few-shot）` section to SKILL.md that excerpts 200-400 characters of the reference post showing:

- Blockquote opening style
- First-person narrative
- Opinion markers
- Concrete examples vs abstract

- [ ] **Step D3: Re-run iter-3 benchmark with updated skill**

Same dispatch process as Task 4.

- [ ] **Step D4: Compare new scores vs iter-3 baseline**

Specifically check Originality dimension improvement.

- [ ] **Step D5: Commit**

```bash
git add .claude/skills/write-blog/
git commit -m "feat(write-blog): add few-shot style calibration example to SKILL.md"
```

---

## Task 19: Run final benchmark and update quality_checklist

**Files:**

- Create: `.claude/skills/write-blog-workspace/iteration-5/benchmark.json`
- Modify: `.claude/skills/write-blog/references/quality_checklist.md`

- [ ] **Step 1: Re-run analyze_blog.py on iter-5 outputs (if new outputs generated)**

If Branch C or D was selected, new with_skill outputs were generated. Run analyze_blog.py on them and aggregate into `iteration-5/benchmark.json`.

If Branch A or B was selected, those don't generate new outputs — just document the new capability.

- [ ] **Step 2: Update quality_checklist.md with iter-5 section**

Add:

```markdown
## Benchmark Results (Iteration 5)

- Selected candidate: <A/B/C/D>
- Rationale: <from selection.md>
- Outcome: <scores or capability description>
- Compared with iter-4: <delta if applicable>
```

- [ ] **Step 3: Update Final Gate**

Change Final Gate to reflect iter-5 status:

```markdown
## Final Gate

- [x] PASS — skill completed through iter-5 with <selected candidate> applied
```

- [ ] **Step 4: Final commit and push**

```bash
pnpm format -- .claude/skills/write-blog/references/quality_checklist.md
git add .
git commit -m "docs(write-blog): complete iter-5 and finalize quality checklist"
git push origin master
```

---

## Self-Review Results

**1. Spec coverage check:**

- iter-3 banned phrases (EN + ZH) → Task 1, Task 2 ✓
- iter-3 em dash allowed → Task 1 Step 1 ✓
- iter-3 voice guidance → Task 1 Step 2 ✓
- iter-3 no-banned-phrases assertion → Task 2 Step 4 ✓
- iter-3 hexo-to-astro test case → Task 3 Step 5, Task 4 Steps 7-8 ✓
- iter-3 exit criteria (no-banned-phrases 4/4 PASS) → Task 5 Step 3 ✓
- iter-4 analyze_blog.py skeleton → Task 7 ✓
- iter-4 Structure 20 → Task 9 ✓
- iter-4 Style 25 (banned + burstiness + TTR + repetitive) → Task 10 ✓
- iter-4 Originality 25 (first-person + opinion + generic intro) → Task 11 ✓
- iter-4 Technical 15 (code completeness + link format) → Task 12 ✓
  - Note: version-specificity left as placeholder (heuristic hard to implement reliably, spec allows iter-5 hardening)
- iter-4 Readability 15 (sentence + paragraph + code ratio + heading) → Task 13 ✓
- iter-4 table + JSON output → Task 14 ✓
- iter-4 exit criteria (total >= 80, delta >= 10) → Task 15 Step 4 ✓
- iter-5 decision flow → Task 17 ✓
- iter-5 4 candidates with branches → Task 18 ✓
- iter-5 terminal conditions → Task 19 ✓

**2. Placeholder scan:**

- No TODOs or TBDs in implementation steps
- Task 15 Step 2 uses `<eval>` and `<config>` as loop variables (not placeholders)
- Task 16, 17 use `<X>` for values filled after running (expected, not skipped work)

**3. Type consistency:**

- `score_structure`, `score_style`, `score_originality`, `score_technical`, `score_readability` — consistent naming
- Each returns `dict[str, Any]` with `{score, max, issues}` structure
- `analyze()` returns `{categories, total}` — consistent across Tasks 14-16
- `format_table(result, file_path, threshold=80)` — threshold parameter added in Task 14 Step 4

Plan is complete and self-consistent.
