# Tasks: Git Global Line Endings

- [x] Set `git config --global core.autocrlf input`
- [x] Verify `git config --global core.autocrlf` returns `input`
- [x] Add `*.webp binary` to `.gitattributes`
- [x] Add `*.avif binary` to `.gitattributes`
- [x] Run `git add --renormalize .` to fix existing file line endings
- [x] Check `git status` for renormalized files
- [x] Run `npx astro build` to confirm build success
- [ ] Commit changes
