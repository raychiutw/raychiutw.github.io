# Proposal: Cleanup Legacy Hexo Files

## Why

This repository was originally a Hexo-generated static site deployed to GitHub Pages. After rebuilding as an Astro project, the root directory still contained ~191 old Hexo build output files (HTML, CSS, JS, XML, images, libraries). These legacy files caused ESLint CI failures because ESLint scanned bundled vendor JS (e.g., jQuery, Velocity.js) that violates modern linting rules.

## What Changes

### Deleted Directories (13 directories)

| Directory     | Description                                    | Size   |
| ------------- | ---------------------------------------------- | ------ |
| `2018/`       | Hexo-rendered blog post pages (2018)           | 1.2 MB |
| `2019/`       | Hexo-rendered blog post pages (2019)           | 1.5 MB |
| `archives/`   | Hexo archive listing pages                     | 496 KB |
| `categories/` | Hexo category listing pages                    | 256 KB |
| `tags/`       | Hexo tag listing pages                         | 1.3 MB |
| `about/`      | Hexo about page                                | 32 KB  |
| `schedule/`   | Hexo schedule page                             | 32 KB  |
| `css/`        | Hexo theme stylesheets                         | 68 KB  |
| `js/`         | Hexo theme scripts                             | 73 KB  |
| `lib/`        | Hexo vendor libraries (jQuery, Velocity, etc.) | 1.4 MB |
| `images/`     | Hexo theme images (root-level)                 | 123 KB |
| `gitment/`    | Gitment comment system assets                  | 0 KB   |
| `page/`       | Hexo pagination pages                          | 152 KB |

### Deleted Files (6 files)

| File                          | Description                           | Size   |
| ----------------------------- | ------------------------------------- | ------ |
| `atom.xml`                    | Hexo Atom feed                        | 24 KB  |
| `search.xml`                  | Hexo search index                     | 100 KB |
| `sitemap.xml`                 | Hexo sitemap                          | 7 KB   |
| `robots.txt`                  | Old robots.txt (new one in `public/`) | 1 KB   |
| `index.html`                  | Hexo root index page                  | 81 KB  |
| `googlefebc379374f1e9b3.html` | Google verification file              | 1 KB   |

### Additional Fixes

- Added `ignorePatterns` to `.eslintrc.cjs` to exclude `dist/`, `.astro/`, `node_modules/`, `playwright-report/`, `test-results/`
- Fixed TypeScript annotations in `Giscus.astro` `<script>` tag causing ESLint parse errors
- Added `env.d.ts` triple-slash-reference rule exception
- Fixed `dataLayer` global reference in `BaseLayout.astro`
- Ran `pnpm format` to fix Prettier formatting across all source files

### Total Space Freed

Approximately 6.5 MB of legacy files removed from git tracking (191 files).
