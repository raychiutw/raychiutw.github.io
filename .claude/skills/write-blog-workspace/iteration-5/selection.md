# Iteration 5 Candidate Selection

## iter-4 Results

- **Total:** 88.5/100 (with_skill) vs 77.0/100 (baseline), delta +11.5
- Structure: 20.0/20 (maxed)
- Style: 20.0/25 (low burstiness/TTR on some evals)
- Originality: 25.0/25 (maxed)
- Technical: 12.5/15
- Readability: 11.0/15 (long paragraphs, heading jumps)

## Decision Flow Application

| Trigger                                    | Check                                 | Fires?                 |
| ------------------------------------------ | ------------------------------------- | ---------------------- |
| Style/Structure maxed AND Originality < 15 | Originality is 25/25 (maxed, not low) | No — skip C            |
| Manual review found factual errors         | None reported                         | No — skip A            |
| Dead links or missing images               | None reported                         | No — skip B            |
| Total > 90 AND delta > 20                  | 88.5/11.5 below threshold             | No — don't skip iter-5 |

No hard rule directly triggered. Analyzing the remaining gap:

- Style -5 points: burstiness + TTR checks suggest AI-like sentence uniformity
- Readability -4 points: long paragraphs + heading hierarchy issues
- Technical -2.5 points: code fragment detection

These are "feel" dimensions — hard to rule-ify, best taught by example.

## Selected Candidate: D (Few-shot Writing Style Calibration)

### Rationale

1. Remaining gaps are in style/readability, which are difficult to express as rules but easy to show with examples
2. Few-shot is low-cost, high-leverage (add one example to SKILL.md)
3. Using Ray's actual high-quality post as the example naturally addresses paragraph length and voice
4. Better than hardening rules (candidate C) because Originality is already maxed

### Reference Post

Selected: `src/content/blog/ai-agent-team-rebuild-blog.md`

Why this post:

- Strong blockquote opening style
- First-person narrative from the first sentence
- Personal story hook (6-year unused blog, decision to rebuild)
- Conversational tone mixed with technical depth
- Natural use of em dash (Ray's signature style)
- Contains opinion markers and specific concrete details
