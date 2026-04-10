---
title: '從 Hexo 搬家到 Astro：踩坑紀錄與避雷指南'
description: '把停更六年的 Hexo 3.9 部落格整碗搬到 Astro 的實戰紀錄，從 Node.js 版本地獄、Markdown 相容性、frontmatter schema 到 GitHub Pages 部署，把我撞過的每個牆都攤出來給你看。'
date: 2026-04-10
category: '程式開發'
tags: ['AI生成', 'Astro', 'Hexo', '部落格', '靜態網站產生器']
postSlug: 'hexo-to-astro-upgrade'
---

> 停更六年的 Hexo 部落格終於熬不下去了，決定整碗搬到 Astro。本來以為只是換個產生器，沒想到從 Node 版本、Markdown 語法到部署流程全部都要重練。這篇把我踩過的坑一次講清楚，希望能幫到同樣想搬家的朋友。

## 為什麼要搬：Hexo 不是不好，是我跟它的距離太遠了

先講清楚，我沒有要黑 Hexo。它在 2018 年那個時代是超棒的選擇，快、穩、主題多、生態成熟。我的 Ray's Notes 從 2017 年用到現在，大部分時間都相安無事。

問題是 — 我停更太久了。最後一次 commit 是 2020 年，中間 Hexo 從 3.x 走到 7.x，Node.js 從 10 走到 22，npm 的 lockfile 格式換了兩次，我的 `node_modules` 跑起來像在考古。想寫一篇新文章，光是 `hexo new post` 前的環境修復就要半天，寫的慾望都磨光了。

後來用 Astro 幫朋友做了幾個專案，就愛上那種「Island Architecture + 原生 TypeScript + 零 JS by default」的開發體驗。既然反正都要大修，那就一次搬好。

## 搬家前的盤點：到底要搬什麼

動手前我列了一張清單，強烈建議你也列一張。我就是因為沒列完整，後面才一直補坑。

- 文章本體（`source/_posts/*.md`）共 31 篇
- 每篇文章的 frontmatter（Hexo 的格式跟 Astro 不完全相同）
- 圖片資源（散落在 `source/images/` 和 `source/_posts/` 同名資料夾）
- 永久連結（Hexo 的 `permalink` 格式 vs Astro 的 slug）
- Google Analytics / Disqus 等外掛
- Sitemap、RSS、robots.txt
- GitHub Pages 的部署流程

看起來不多，但魔鬼在細節裡。

## 坑一：Node.js 版本地獄

第一個撞牆的就是 Node.js。我的舊 Hexo 還在跑 Node 12，Astro 6 最低要 Node 20.3。單純的「升 Node」聽起來是個五分鐘的事對吧？錯。

我習慣用 `nvm` 管 Node 版本，Windows 上是 `nvm-windows`。結果裝完 Node 22 之後 `pnpm` 找不到，`corepack enable` 報一堆權限錯誤。後來才發現：

- `nvm-windows` 切換版本時不會自動重新啟用 Corepack
- Windows 的 `pnpm` global bin 路徑每個版本都不一樣
- 舊的 `package-lock.json` 含有只能在 Node 14 以下解析的 `integrity` 雜湊

**避雷法**：乾脆砍掉整個舊的 `node_modules` 和 lockfile，從頭來過。如果你的舊專案有自訂 Hexo 主題，先把主題程式碼獨立備份好再砍。

```bash
rm -rf node_modules
rm package-lock.json
# 切到新 Node 版本
nvm use 22
corepack enable
pnpm install
```

## 坑二：frontmatter 欄位對不起來

Hexo 的 frontmatter 長這樣：

```yaml
---
title: 我的文章
date: 2019-03-20 10:23:45
categories:
  - 程式開發
tags:
  - Hexo
  - Blog
---
```

Astro 的 Content Collections 會用 Zod schema 做嚴格驗證，我在 `src/content/config.ts` 寫的 schema 長這樣：

```ts
const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().min(50).max(160),
      date: z.date(),
      category: z.string(),
      tags: z.array(z.string()),
      postSlug: z.string().optional(),
    }),
});
```

差異一看就知道：

1. **`categories` vs `category`**：我的部落格其實每篇都只有一個分類，所以我改成單數。
2. **`date` 格式**：Hexo 可以吃 `2019-03-20 10:23:45`，Astro + Zod 會把它解析成 Date 物件，時區處理有雷，建議統一成 ISO 格式或純日期 `2019-03-20`。
3. **`description` 是必填且有字數限制**：Hexo 沒這個欄位，31 篇文章每篇都要補。
4. **`postSlug` 是新欄位**：我用它控制 URL，避免中文檔名造成 GitHub Pages 路徑亂碼。

**避雷法**：寫一個簡單的 Node.js script 批次轉換 frontmatter，不要手動改 31 次。我的 script 大概這個樣子：

```js
import { readdir, readFile, writeFile } from 'node:fs/promises';
import matter from 'gray-matter';
import path from 'node:path';

const SRC = './legacy/source/_posts';
const DEST = './src/content/blog';

for (const file of await readdir(SRC)) {
  if (!file.endsWith('.md')) continue;
  const raw = await readFile(path.join(SRC, file), 'utf8');
  const { data, content } = matter(raw);

  const newData = {
    title: data.title,
    description: data.description ?? content.slice(0, 120).replace(/\n/g, ' '),
    date: new Date(data.date).toISOString().slice(0, 10),
    category: Array.isArray(data.categories) ? data.categories[0] : data.categories,
    tags: data.tags ?? [],
    postSlug: path.basename(file, '.md'),
  };

  await writeFile(
    path.join(DEST, file),
    matter.stringify(content, newData),
    'utf8'
  );
}
```

跑完之後還是要逐篇校對 `description`，但至少結構對了。

## 坑三：Markdown 語法相容性

Hexo 預設用 `hexo-renderer-marked`，Astro 用的是 `remark` / `rehype` 生態。兩邊對某些 Markdown 語法的解讀不一樣，搬過來之後最容易中的幾個：

### 圖片路徑

Hexo 有個「asset folder」的功能，每篇文章可以有同名的資料夾放圖片，用 `{% asset_img name.jpg %}` 這種 tag 插入。Astro 沒這個東西，要嘛全部改成 `![](/images/blog/xxx.jpg)` 絕對路徑，要嘛用 Astro 的 `Image` 元件做圖片優化。

我選的是絕對路徑方案，因為我想讓 `.md` 檔案本身在任何地方都能預覽，不綁 Astro 特定語法。所有圖片統一搬到 `public/images/blog/` 底下。

### Code block 語言標記

Hexo 可以接受不寫語言的 code block：

````md
```
const a = 1;
```
````

Astro 的 Shiki / Prism 如果沒標語言就不會上色，看起來很醜。我用一個快速 regex 掃過所有 `.md`，把沒標語言的程式碼區塊找出來補上正確的語言。

### Hexo 專屬 tag plugin

這是最麻煩的一個。舊文章裡面有 `{% note info %}`、`{% cq %}`、`{% gist %}` 這類 Hexo NexT 主題特有的 tag，Astro 完全不認識，渲染出來會變成純文字。解法只有兩個：

1. 手動改成標準 Markdown 語法（我選這個）
2. 寫一個 remark plugin 去解析這些 tag

31 篇文章裡大概有 8 篇用到，手動改反而比較快。

## 坑四：永久連結與 SEO

這是我最擔心的一塊。舊部落格的 URL 格式是 `/2019/03/20/hexo-tutorial-quick-install/`，Google 已經收錄很多年，搬家後 URL 結構變了，直接炸掉所有外部連結。

Astro 預設會用 `src/content/blog/<filename>.md` 當作 slug，產生的 URL 是 `/blog/hexo-tutorial-quick-install/`。跟舊的差很多。

**避雷法**：在 `astro.config.mjs` 設 `redirects`，把舊 URL 全部對應到新 URL。

```js
export default defineConfig({
  redirects: {
    '/2019/03/20/hexo-tutorial-quick-install':
      '/blog/hexo-tutorial-quick-install',
    // ... 其他 30 篇
  },
});
```

這個清單一樣建議用 script 從舊檔名和 frontmatter 日期自動產生，不要手寫。

另外記得把 `sitemap.xml` 重新產生並提交到 Google Search Console，讓 Google 知道你的 URL 結構變了。我用 `@astrojs/sitemap` 這個官方 integration，設定超簡單。

## 坑五：GitHub Pages 部署流程

舊的 Hexo 是用 `hexo-deployer-git` 直接 push 到 `gh-pages` 分支。Astro 的官方做法是透過 GitHub Actions 建置後發布到 Pages，流程完全不同。

我用官方提供的 `actions/deploy-pages` workflow，重點是這幾個設定：

- `site` 要設對（`https://raychiutw.github.io`），不然 sitemap、canonical URL 都會出錯
- `base` 如果你的 repo 不是 `<username>.github.io` 要記得加
- Pages 的 source 在 repo 設定裡要改成「GitHub Actions」，不是「Deploy from a branch」

**避雷法**：第一次部署前先在本地跑 `pnpm build && pnpm preview`，確認 production build 的 URL 是對的，不要直接 push 上去等結果。

## 搬完之後：那些 Hexo 做不到、Astro 做得到的事

講了這麼多坑，你可能想說「那我繼續用 Hexo 就好啦」。但搬過來的好處確實很明顯：

1. **原生 TypeScript + Zod schema 驗證**：frontmatter 打錯字 build 就會報錯，不會等到上線才發現。
2. **Content Collections**：用程式方式查詢文章、篩選 tag、做關聯，寫起來像在寫 ORM。
3. **Island Architecture**：預設零 JavaScript，只有需要互動的元件才注入 JS，Lighthouse 分數爽拉到 95+。
4. **MDX 支援**：要在 Markdown 裡嵌 React / Vue / Svelte 元件都行，寫教學文章時超好用。
5. **建置速度**：31 篇文章 Hexo 大概要 8 秒，Astro 大概 3 秒，差異會隨文章變多拉開。

## 我會推薦你也搬嗎？看狀況

如果你的 Hexo 還在正常運作、Node 版本跟得上、你也滿意現在的寫作體驗，**不用搬**。搬家是有成本的，31 篇文章我花了兩個週末才完全收乾淨。

但如果你的 Hexo 卡在舊版本動彈不得、寫文章前要先修環境半小時、或是你想要更強的型別檢查和現代開發體驗，那就動手吧。先把文章備份，寫一個轉換 script，用本文的坑表當 checklist，一步一步來。

搬完之後回頭看舊的 `node_modules`，就像從 Windows XP 升級到 Windows 11 一樣，回不去了。
