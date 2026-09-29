# write-blog Quality Checklist

## Format Checks

- [x] YAML frontmatter: name + description present
- [x] Description starts with "Use when..."
- [x] Name uses only letters, numbers, hyphens
- [x] SKILL.md under 500 lines

## Requirement Checks

- [x] Frontmatter schema documented (title/description/date/category/tags/postSlug)
- [x] Description length range specified (100-160 chars)
- [x] AI tag rule documented (first tag = "AI生成")
- [x] Blockquote opening required
- [x] Code language tags mandatory (no empty ``` blocks)
- [x] File path conventions documented
- [x] Image path conventions documented

## Common Error Checks

- [x] code-language-tags: Strengthened to explicitly ban empty code blocks, added fallback tags (text, yaml)
- [x] description-length: Added "count after writing" instruction with remediation steps
- [x] blockquote-opening: Required as first element after frontmatter

## Automated Validation Results (2026-04-09, post-iteration-2)

- format_check.py: 0 errors, 1 warning (false positive on trigger language detection — description starts with "Use when")
- quick_validate.py: PASS ("Skill is valid!")
- check_skill_name_surface.py: PASS (0 blocking issues)
- audit_unreferenced_files.py: PASS (0 issues, 2 source files, 1 referenced file)
- YAML frontmatter: fixed — description now uses single-quoted string to avoid colon/bracket parsing issues

## Benchmark Results (Iteration 1)

- with_skill pass rate: 81% (avg 6/7 assertions)
- baseline pass rate: 71% (avg 5/7 assertions)
- Delta: +10% pass rate, -28% duration
- Key differentiators: blockquote-opening (3/3 vs 2/3), description-length (2/3 vs 1/3)
- Known gap: code-language-tags (0/3 both) — FIXED in Iteration 2

## Benchmark Results (Iteration 2)

- with_skill pass rate: **100%** (21/21 assertions, 3/3 evals perfect)
- baseline pass rate: 76.2% (16/21 assertions)
- Delta: +23.8% pass rate
- Key fix: code-language-tags now 3/3 PASS (was 0/3) — added error/correct examples + dedicated subsection
- description-length: 3/3 PASS (was 2/3) — added explicit counting instruction + sweet spot guidance
- blockquote-opening: 3/3 PASS (unchanged from iter-1)

## Benchmark Results (Iteration 3)

- Test cases: 4 (added hexo-to-astro-upgrade for personal context testing)
- New assertion: `no-banned-phrases` (EN + ZH AI phrase blacklist)
- with_skill pass rate: **100%** (32/32 assertions across 4 evals, all 8/8)
- baseline pass rate: 62.5% (20/32 assertions)
- Delta: **+37.5 percentage points**
- no-banned-phrases result: with_skill 4/4 PASS vs baseline 3/4 PASS
  - Baseline failure: aspnet-middleware hit ZH phrase "不僅"
- Mean tokens: with_skill 39,588 vs baseline 31,469 (+26%)
- Mean duration: with_skill 143.3s vs baseline 108.1s (+33%)
- Em dash explicitly allowed (Ray's signature style, not treated as AI pattern)
- Voice guidance added (soft rule, validated qualitatively via hexo-to-astro test case)

## Benchmark Results (Iteration 4)

- Scoring script: `.claude/skills/write-blog/scripts/analyze_blog.py`
- Test coverage: 19 unittest tests (all PASS)
- Threshold: 80/100
- with_skill mean total: **88.5/100** (PASS)
- baseline mean total: 77.0/100
- Delta: **+11.5** (exit criteria ≥ 10 met)
- Category breakdown (with_skill vs baseline):
  - Structure: 20.0/20 vs 11.8/20 (+8.2) — dominant differentiator
  - Style: 20.0/25 vs 19.2/25 (+0.8)
  - Originality: 25.0/25 vs 23.0/25 (+2.0)
  - Technical: 12.5/15 vs 11.2/15 (+1.3)
  - Readability: 11.0/15 vs 11.8/15 (-0.8) — with_skill posts have longer paragraphs
- Best eval: hexo-to-astro-upgrade with_skill (92/100)

## Benchmark Results (Iteration 5)

- Branch: D — Few-shot Writing Style Calibration
- Reference example: `src/content/blog/ai-agent-team-rebuild-blog.md` (opening paragraphs)
- Action: Added `## 風格示範（Few-shot）` section to SKILL.md with 295-char excerpt
- Baseline: iter-4 with_skill means (88.5/100)
- **iter-5 with_skill mean total: 85.5/100**
- Delta vs iter-4: -3.0
- Category breakdown (iter-5 vs iter-4):
  - Structure: 20.0 vs 20.0
  - Style: 20.0 vs 20.0
  - Originality: 23.0 vs 25.0
  - Technical: 12.5 vs 12.5
  - Readability: 10.0 vs 11.0 (target: improvement from long-paragraph issue)
- Target dimension (Readability): not met (10.0 vs 11.0 baseline; target was +5 improvement to ≥16.0)

## Final Gate

- [x] PASS — skill completed through iter-5 with Branch D (few-shot style calibration) applied
