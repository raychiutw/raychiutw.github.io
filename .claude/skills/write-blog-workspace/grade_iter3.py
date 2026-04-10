"""Grade iteration-3 outputs for write-blog skill."""
import json, re, os, sys

WORKSPACE = os.path.dirname(os.path.abspath(__file__))
ITER_DIR = os.path.join(WORKSPACE, "iteration-3")

EVALS = [
    ("docker-multistage", "docker-multi-stage-build.md"),
    ("aspnet-middleware", "aspnet-core-global-exception-middleware.md"),
    ("git-rebase-vs-merge", "git-rebase-vs-merge.md"),
    ("hexo-to-astro-upgrade", "hexo-to-astro-upgrade.md"),
]

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
    "眾所周知", "深入淺出", "毫無疑問",
    "眾多的", "諸如此類",
]
CONFIGS = ["with_skill", "without_skill"]


def parse_frontmatter(content):
    """Extract frontmatter as raw text between --- delimiters."""
    m = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    return m.group(1) if m else ""


def grade(content):
    """Return list of {text, passed, evidence} for each assertion."""
    fm = parse_frontmatter(content)
    results = []

    # 1. frontmatter-complete
    required = ["title", "description", "date", "category", "tags", "postSlug"]
    missing = [f for f in required if not re.search(rf"^{f}\s*:", fm, re.MULTILINE)]
    results.append({
        "text": "frontmatter-complete",
        "passed": len(missing) == 0,
        "evidence": f"Missing: {missing}" if missing else "All required fields present",
    })

    # 2. description-length
    desc_match = re.search(r"^description:\s*['\"](.+?)['\"]", fm, re.MULTILINE)
    if desc_match:
        desc = desc_match.group(1)
        length = len(desc)
        passed = 100 <= length <= 160
        results.append({
            "text": "description-length",
            "passed": passed,
            "evidence": f"Description length: {length} chars",
        })
    else:
        results.append({"text": "description-length", "passed": False, "evidence": "No description found"})

    # 3. ai-tag-first
    tags_match = re.search(r"^tags:\s*\[(.+?)\]", fm, re.MULTILINE)
    if tags_match:
        tags_str = tags_match.group(1)
        first_tag = re.match(r"\s*['\"](.+?)['\"]", tags_str)
        first = first_tag.group(1) if first_tag else ""
        results.append({
            "text": "ai-tag-first",
            "passed": first == "AI生成",
            "evidence": f"First tag: '{first}'",
        })
    else:
        results.append({"text": "ai-tag-first", "passed": False, "evidence": "No tags found"})

    # 4. slug-kebab-case
    slug_match = re.search(r"^postSlug:\s*['\"](.+?)['\"]", fm, re.MULTILINE)
    if slug_match:
        slug = slug_match.group(1)
        is_kebab = bool(re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", slug))
        results.append({
            "text": "slug-kebab-case",
            "passed": is_kebab,
            "evidence": f"postSlug: '{slug}'",
        })
    else:
        results.append({"text": "slug-kebab-case", "passed": False, "evidence": "No postSlug found"})

    # 5. blockquote-opening
    after_fm = re.sub(r"^---.*?---\s*", "", content, count=1, flags=re.DOTALL)
    first_line = after_fm.strip().split("\n")[0] if after_fm.strip() else ""
    results.append({
        "text": "blockquote-opening",
        "passed": first_line.startswith(">"),
        "evidence": f"First line: '{first_line[:80]}...'",
    })

    # 6. code-language-tags - THE KEY ASSERTION
    code_blocks = re.findall(r"```(.*?)$", content, re.MULTILINE)
    total = len([b for b in code_blocks if b.strip() != "" or code_blocks.index(b) % 2 == 0])
    # More precise: find opening ``` (odd occurrences in pairs)
    lines = content.split("\n")
    in_block = False
    opening_blocks = 0
    bare_blocks = 0
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):
            if not in_block:
                opening_blocks += 1
                lang = stripped[3:].strip()
                if not lang:
                    bare_blocks += 1
                in_block = True
            else:
                in_block = False

    results.append({
        "text": "code-language-tags",
        "passed": bare_blocks == 0 and opening_blocks > 0,
        "evidence": f"{opening_blocks} code blocks, {bare_blocks} without language tag",
    })

    # 7. h2-h3-structure
    h2_count = len(re.findall(r"^## ", content, re.MULTILINE))
    h3_count = len(re.findall(r"^### ", content, re.MULTILINE))
    results.append({
        "text": "h2-h3-structure",
        "passed": h2_count >= 2,
        "evidence": f"{h2_count} H2 headers, {h3_count} H3 headers",
    })

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

    return results


def main():
    all_results = {}
    for eval_name, filename in EVALS:
        for config in CONFIGS:
            path = os.path.join(ITER_DIR, eval_name, config, "outputs", filename)
            if not os.path.exists(path):
                print(f"SKIP: {path} not found")
                continue
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            results = grade(content)
            grading = {"expectations": results}

            out_path = os.path.join(ITER_DIR, eval_name, config, "grading.json")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(grading, f, indent=2, ensure_ascii=False)

            passed = sum(1 for r in results if r["passed"])
            total = len(results)
            key = f"{eval_name}/{config}"
            all_results[key] = {"passed": passed, "total": total, "details": results}
            print(f"{key}: {passed}/{total}")
            for r in results:
                status = "PASS" if r["passed"] else "FAIL"
                print(f"  [{status}] {r['text']}: {r['evidence']}")

    print("\n--- Summary ---")
    for key, data in all_results.items():
        print(f"{key}: {data['passed']}/{data['total']} ({data['passed']/data['total']*100:.0f}%)")


if __name__ == "__main__":
    main()
