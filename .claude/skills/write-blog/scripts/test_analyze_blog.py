"""Unit tests for analyze_blog.py."""
import unittest
from analyze_blog import analyze, parse_frontmatter, split_sentences_zh

VALID_POST = """---
title: 'Test Post'
description: '這是一個測試用的描述，長度在一百到一百六十個字元之間，用來驗證 description-length assertion 能正確通過測試，需要多一點字數湊齊，所以再加一些文字讓它達到要求的長度範圍，這樣就夠了'
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
```

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


from analyze_blog import score_structure, score_style

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


if __name__ == "__main__":
    unittest.main()
