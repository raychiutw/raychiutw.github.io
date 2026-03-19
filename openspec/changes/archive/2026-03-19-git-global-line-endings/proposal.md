# Proposal: Git Global Line Endings Configuration

## Problem

On Windows, git may checkout files with CRLF line endings, leading to inconsistent line endings across platforms. This causes unnecessary diffs, potential build issues, and cross-platform collaboration problems.

## Proposed Solution

1. Set `git config --global core.autocrlf input` so Windows converts CRLF to LF on commit but does not convert on checkout.
2. Ensure `.gitattributes` enforces `text=auto eol=lf` for all text files and marks all image formats (including `*.webp` and `*.avif`) as binary.
3. Run `git add --renormalize .` to fix any existing CRLF files in the repository.

## Impact

- All text files in the repository will use LF line endings consistently.
- Binary image files will not be subject to line-ending conversion.
- No functional impact on build or runtime behavior.

## Status

Accepted
