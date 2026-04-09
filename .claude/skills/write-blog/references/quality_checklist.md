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

## Final Gate
- [x] PASS — skill is functional, tested, and benchmarked (iteration 2, 100% pass rate)
