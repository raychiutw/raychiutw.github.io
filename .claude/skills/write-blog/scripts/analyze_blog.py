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


def score_originality(content: str) -> dict[str, Any]:
    """Score originality: first-person presence + opinion markers + generic intro check."""
    issues: list[str] = []
    score = 25

    body = re.sub(r"^---.*?---\s*", "", content, count=1, flags=re.DOTALL)

    first_person_count = body.count("我") + body.count("筆者")
    if first_person_count == 0:
        score -= 10
        issues.append("no first-person pronouns (我/筆者)")

    opinion_count = sum(1 for m in OPINION_MARKERS if m in body)
    if opinion_count < 1:
        score -= 8
        issues.append(f"no opinion markers from {OPINION_MARKERS}")

    intro = body.strip()[:200]
    generic_patterns = ["在本文中", "讓我們", "本篇文章將", "本文將"]
    for pattern in generic_patterns:
        if pattern in intro:
            score -= 7
            issues.append(f"generic intro phrase '{pattern}'")
            break

    return {"score": max(score, 0), "max": 25, "issues": issues}


def score_style(content: str) -> dict[str, Any]:
    """Score style dimension: AI phrase detection + burstiness + TTR + repetitive structures."""
    issues: list[str] = []
    score = 25

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

    body = re.sub(r"^---.*?---\s*", "", content, count=1, flags=re.DOTALL)
    body = re.sub(r"```.*?```", "", body, flags=re.DOTALL)
    # Strip markdown structural lines (headings, blockquotes, blank lines) before sentence analysis
    prose_lines = [
        line for line in body.split("\n")
        if line.strip() and not re.match(r"^#{1,6}\s", line) and not line.strip().startswith(">")
    ]
    sentences = split_sentences_zh("\n".join(prose_lines))

    if len(sentences) >= 5:
        lengths = [len(s) for s in sentences]
        mean = sum(lengths) / len(lengths)
        variance = sum((x - mean) ** 2 for x in lengths) / len(lengths)
        stddev = variance ** 0.5
        if stddev < 15:
            score -= 5
            issues.append(f"low burstiness {stddev:.1f} (std dev < 15)")

        all_chars = "".join(sentences)
        unique = len(set(all_chars))
        total = len(all_chars)
        ttr = unique / total if total > 0 else 0
        if ttr < 0.35:
            score -= 5
            issues.append(f"low TTR {ttr:.2f} (< 0.35)")

    if re.search(r"首先.*?其次.*?最後", content, re.DOTALL):
        score -= 3
        issues.append("repetitive '首先...其次...最後' structure")

    return {"score": max(score, 0), "max": 25, "issues": issues}


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
