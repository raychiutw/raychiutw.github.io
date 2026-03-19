# Design: Git Global Line Endings

## Overview

This change configures git to normalize line endings to LF across the repository, regardless of the developer's operating system.

## Components

### 1. Global Git Config

- `core.autocrlf = input`: On commit, CRLF is converted to LF. On checkout, no conversion is performed.
- This is a per-developer setting applied via `git config --global`.

### 2. Repository `.gitattributes`

The `.gitattributes` file enforces repository-level line ending rules:

```
* text=auto eol=lf
*.png binary
*.jpg binary
*.gif binary
*.svg binary
*.ico binary
*.webp binary
*.avif binary
```

- `* text=auto eol=lf` — git auto-detects text files and normalizes to LF.
- Binary entries prevent git from applying text transformations to image files.

### 3. Renormalization

Running `git add --renormalize .` recalculates line endings for all tracked files, staging any that need conversion from CRLF to LF.

## Decisions

- **Why `input` over `true`?** `input` avoids converting LF back to CRLF on checkout, keeping the working tree consistent with the repository.
- **Why add `*.webp` and `*.avif`?** These modern image formats were missing from the original `.gitattributes` and should be treated as binary.
