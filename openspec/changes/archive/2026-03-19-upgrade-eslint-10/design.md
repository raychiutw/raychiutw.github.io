## Context

專案使用 ESLint 8.57.1（已 deprecated）搭配 `.eslintrc.cjs` legacy config。ESLint 9 起強制使用 flat config，ESLint 10 已完全移除 legacy config 支援。現有 plugins 皆已支援 ESLint 10：

- `eslint-plugin-astro@1.6.0`：peerDep `eslint: >=8.57.0`
- `@typescript-eslint/eslint-plugin@8.57.1`：peerDep `eslint: ^8.57.0 || ^9.0.0 || ^10.0.0`
- `@typescript-eslint/parser@8.57.1`：同上

## Goals / Non-Goals

**Goals:**

- 升級 ESLint 至 10.x
- 將 `.eslintrc.cjs` 遷移至 `eslint.config.js`（flat config）
- 維持相同的 lint 規則與行為
- 確保 CI/CD lint 步驟正常運作

**Non-Goals:**

- 不新增或移除 lint 規則
- 不升級 eslint-plugin-astro 或 @typescript-eslint 版本（已相容）
- 不處理 Giscus.astro 中的 @ts-ignore 問題

## Decisions

### Decision 1：Flat config 遷移方式

**選擇：** 手動遷移 `.eslintrc.cjs` 至 `eslint.config.js`

**理由：** 專案 config 結構簡單（3 個 overrides：astro、ts/tsx、env.d.ts），手動遷移更精確。Flat config 語法：

- `extends` → 直接展開 config 物件
- `overrides` → 使用 `files` 屬性的 config 物件陣列
- `env` → 移除（flat config 使用 `languageOptions.globals`）
- `ignorePatterns` → 使用 `ignores` 屬性

### Decision 2：lint script 調整

**選擇：** 改為 `eslint .`（移除 `--ext .js,.ts,.astro`）

**理由：** ESLint 10 flat config 透過 config 中的 `files` glob 判斷檔案類型，不再支援 `--ext` flag。

## Risks / Trade-offs

- **[Plugin 相容性]** → 現有 plugin 版本已確認支援 ESLint 10，風險極低
- **[Lint 結果差異]** → Flat config 可能有微妙的規則行為差異 → 升級後比對 lint 結果
- **[@eslint/js 版本]** → 可能需要安裝 `@eslint/js` 作為 `eslint:recommended` 的替代
