# Tasks: Cleanup Legacy Hexo Files

- [x] Investigate and identify all legacy Hexo files/directories at repo root
- [x] Remove Hexo directories: 2018/, 2019/, archives/, categories/, tags/, about/, schedule/, css/, js/, lib/, images/, gitment/, page/
- [x] Remove Hexo files: atom.xml, search.xml, sitemap.xml, robots.txt, index.html, googlefebc379374f1e9b3.html
- [x] Update .eslintrc.cjs with ignorePatterns for dist/, .astro/, node_modules/, playwright-report/, test-results/
- [x] Fix ESLint errors in source files (Giscus.astro, env.d.ts, BaseLayout.astro)
- [x] Run pnpm format to fix Prettier formatting
- [x] Verify: npx astro build succeeds
- [x] Verify: pnpm lint passes (0 errors)
- [x] Verify: pnpm format:check passes
- [x] Create OpenSpec documentation (proposal.md, design.md, specs/cleanup/spec.md, tasks.md)
