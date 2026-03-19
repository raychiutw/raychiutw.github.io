# astro5-content-layer Specification

## Purpose
TBD - created by archiving change upgrade-astro5-tw4-react19. Update Purpose after archive.
## Requirements
### Requirement: Content Layer API 設定檔

系統 MUST 使用 Astro 5 Content Layer API，設定檔 SHALL 位於 `src/content.config.ts`（專案 src 目錄下），並使用 `glob` loader 定義 blog collection。

#### Scenario: Content config 檔案位置與格式

- **WHEN** 檢查專案目錄結構
- **THEN** `src/content.config.ts` SHALL 存在
- **AND** SHALL 從 `astro:content` 匯入 `defineCollection` 與 `z`
- **AND** SHALL 從 `astro/loaders` 匯入 `glob`
- **AND** blog collection SHALL 使用 `loader: glob({ pattern: "**/*.md", base: "./src/content/blog" })`

#### Scenario: 舊設定檔移除

- **WHEN** 檢查專案目錄結構
- **THEN** `src/content/config.ts` SHALL 不存在

### Requirement: id 欄位取代 slug

Content Layer API 中，文章識別欄位 MUST 使用 `id` 取代原本的 `slug`。所有引用 `post.slug` 的程式碼 SHALL 改為 `post.id`。

#### Scenario: 動態路由使用 id

- **WHEN** 檢查 `src/pages/[year]/[month]/[day]/[slug].astro` 的 `getStaticPaths`
- **THEN** SHALL 使用 `post.id` 取得文章識別符
- **AND** 產生的 URL 路徑 SHALL 與升級前一致

#### Scenario: 文章列表使用 id

- **WHEN** 任何頁面透過 `getCollection('blog')` 取得文章列表
- **THEN** SHALL 使用 `post.id` 作為唯一識別符（非 `post.slug`）

### Requirement: render 函式匯入方式

文章內容渲染 MUST 使用從 `astro:content` 匯入的 `render` 函式，而非透過 `post.render()` 方法呼叫。

#### Scenario: 文章頁面渲染

- **WHEN** 檢查文章頁面的渲染邏輯
- **THEN** SHALL 包含 `import { render } from 'astro:content'`
- **AND** SHALL 使用 `const { Content } = await render(post)` 取得渲染元件

### Requirement: Content Collection schema 維持一致

升級後的 blog collection schema MUST 與升級前保持一致，包含 title、description、date、category、tags、postSlug、draft 等欄位。

#### Scenario: Schema 欄位驗證

- **WHEN** 檢查 `src/content.config.ts` 中的 blog schema
- **THEN** schema SHALL 包含以下欄位：
  - `title`: z.string()
  - `description`: z.string()
  - `date`: z.date()
  - `category`: z.string()
  - `tags`: z.array(z.string())
  - `postSlug`: z.string().optional()
  - `draft`: z.boolean().default(false)

