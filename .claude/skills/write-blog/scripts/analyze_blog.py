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
    "眾所周知", "深入淺出", "毫無疑問",
    "眾多的", "諸如此類",
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


def score_structure(content: str) -> dict[str, Any]:
    """Score structure dimension: 7 assertions, ~3 points each (20 total)."""
    issues: list[str] = []
    score = 20
    fm = parse_frontmatter(content)

    required = ["title", "description", "date", "category", "tags", "postSlug"]
    missing = [f for f in required if not re.search(rf"^{f}\s*:", fm, re.MULTILINE)]
    if missing:
        score -= 3
        issues.append(f"frontmatter missing: {missing}")

    dm = re.search(r"^description:\s*['\"](.+?)['\"]", fm, re.MULTILINE)
    if not dm:
        score -= 3
        issues.append("description not found or not quoted")
    else:
        length = len(dm.group(1))
        if not (100 <= length <= 160):
            score -= 3
            issues.append(f"description length {length} out of range 100-160")

    tm = re.search(r"^tags:\s*\[(.+?)\]", fm, re.MULTILINE)
    if tm:
        first = re.match(r"\s*['\"](.+?)['\"]", tm.group(1))
        if not first or first.group(1) != "AI生成":
            score -= 3
            issues.append("first tag is not 'AI生成'")
    else:
        score -= 3
        issues.append("tags not found")

    sm = re.search(r"^postSlug:\s*['\"](.+?)['\"]", fm, re.MULTILINE)
    if not sm or not re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", sm.group(1)):
        score -= 3
        issues.append("postSlug missing or not kebab-case")

    after_fm = re.sub(r"^---.*?---\s*", "", content, count=1, flags=re.DOTALL)
    first_line = after_fm.strip().split("\n")[0] if after_fm.strip() else ""
    if not first_line.startswith(">"):
        score -= 3
        issues.append("no blockquote opening")

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

    h2_count = len(re.findall(r"^## ", content, re.MULTILINE))
    if h2_count < 2:
        score -= 2
        issues.append(f"only {h2_count} H2 headers (need >= 2)")

    return {"score": max(score, 0), "max": 20, "issues": issues}


def analyze(content: str) -> dict[str, Any]:
    """Run all 5 category analyzers. Returns flat dict with scores and issues."""
    result: dict[str, Any] = {
        "categories": {},
        "total": 0,
    }
    # Filled in by subsequent tasks
    return result


def format_table(result: dict[str, Any], file_path: str, threshold: int = 80) -> str:
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
