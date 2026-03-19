# Spec: Cleanup Legacy Hexo Files

## ADDED Requirements

### REQ-CLEANUP-001: Remove Hexo build output directories

All Hexo-generated directories at the repo root must be removed from git tracking: `2018/`, `2019/`, `archives/`, `categories/`, `tags/`, `about/`, `schedule/`, `css/`, `js/`, `lib/`, `images/`, `gitment/`, `page/`.

#### Scenario: Hexo directories are removed

- GIVEN the repository contains legacy Hexo directories at root level
- WHEN `git rm -r` is executed on all identified Hexo directories
- THEN none of these directories exist in the working tree
- AND `git status` shows them as staged deletions

### REQ-CLEANUP-002: Remove Hexo build output files

All Hexo-generated files at the repo root must be removed: `atom.xml`, `search.xml`, `sitemap.xml`, `robots.txt`, `index.html`, `googlefebc379374f1e9b3.html`.

#### Scenario: Hexo files are removed

- GIVEN the repository contains legacy Hexo files at root level
- WHEN `git rm` is executed on all identified Hexo files
- THEN none of these files exist in the working tree

### REQ-CLEANUP-003: Preserve Astro project files

No Astro project files or directories shall be removed during cleanup. This includes `src/`, `public/`, `.github/`, `tests/`, configuration files, and all content under `public/images/blog/`.

#### Scenario: Astro files are preserved

- GIVEN the cleanup has been performed
- WHEN checking the file system
- THEN `src/`, `public/`, `public/images/blog/`, `.github/`, `tests/` all exist
- AND `package.json`, `astro.config.mjs`, `tsconfig.json` all exist

### REQ-CLEANUP-004: ESLint passes after cleanup

ESLint must not scan build output or legacy files. The `.eslintrc.cjs` must include `ignorePatterns` for `dist/`, `.astro/`, `node_modules/`, and test output directories.

#### Scenario: ESLint passes cleanly

- GIVEN legacy Hexo files are removed and ESLint config is updated
- WHEN `pnpm lint` is executed
- THEN the command exits with code 0 and reports no errors

### REQ-CLEANUP-005: Astro build succeeds

The Astro build must complete successfully after cleanup.

#### Scenario: Build succeeds

- GIVEN legacy Hexo files are removed
- WHEN `npx astro build` is executed
- THEN the command exits with code 0

### REQ-CLEANUP-006: Prettier formatting passes

All source files must pass Prettier formatting checks.

#### Scenario: Format check passes

- GIVEN all files have been formatted
- WHEN `pnpm format:check` is executed
- THEN the command exits with code 0
