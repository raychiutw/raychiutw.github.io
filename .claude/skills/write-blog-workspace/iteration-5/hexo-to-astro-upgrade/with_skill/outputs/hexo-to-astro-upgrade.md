---
title: '從 Hexo 搬到 Astro 的踩坑記錄'
description: '從 Hexo 3.9.0 升級到 Astro 的完整踩坑記錄：Content Collection 的 slug 保留字衝突、Hexo frontmatter 格式不相容、圖片路徑全斷、URL 結構如何保持相容。把每個坑和解法都寫出來，給想做同樣升級的人參考。'
date: 2026-04-09
category: '程式開發'
tags: ['AI生成', 'Astro', 'Hexo', 'Content Collections', 'Migration']
postSlug: 'hexo-to-astro-upgrade'
---

> Ray's Notes 從 Hexo 3.9.0 搬到 Astro 4.x，文章、URL、圖片全都要遷。過程中踩了四個印象深刻的坑，這篇把它們整理成筆記，給想做同樣升級的人節省幾個小時。

我的部落格原本跑在 Hexo 3.9.0 + NexT 7.0.1 上，最後一次 push 停在 2020 年 2 月。六年過去，repo 裡只剩下編譯後的 97 個 HTML，原始的 Markdown 散在本機某個備份資料夾裡，npm install 跑起來一大串 deprecation warning。我終於受不了，決定整包搬去 Astro。

搬遷本身不難，難的是細節 — 有幾個坑是官方文件沒講清楚、Google 搜也搜不到一句中文答案的那種。以下四個是花我最多時間的。

## 坑一：Content Collection 的 `slug` 是保留字

這個坑踩得最痛，因為 error message 完全看不出是什麼問題。

我的 Hexo frontmatter 長這樣：

```yaml
---
title: '靜態網站產生器大比拚'
date: 2019-03-20
slug: static-site-generator-comparison
tags: ['Hexo', 'Hugo', 'Jekyll']
---
```

很直覺對吧？`slug` 欄位指定 URL 路徑。我把這批文章丟進 `src/content/blog/`，跑 `astro dev`，結果 terminal 吐出一句話：

```text
The slug field is reserved and cannot be used in frontmatter.
```

我當下的第一反應是「那我要怎麼指定 URL？」翻了 Astro 文件才發現，Content Collection 內建一個 `slug` property，是從檔名自動產生的，你在 frontmatter 裡不能覆寫它。如果你要自訂 slug，官方建議是直接把檔名改成你想要的 slug。

但我不想改檔名 — 我有 27 篇文章，檔名跟 Hexo 當年的命名習慣綁在一起，而且我還要用 slug 來組 URL 路徑。解法是換一個欄位名：

```yaml
---
title: '靜態網站產生器大比拚'
date: 2019-03-20
postSlug: 'static-site-generator-comparison'
tags: ['Hexo', 'Hugo', 'Jekyll']
---
```

然後在 `src/content.config.ts` 裡用 Zod schema 宣告 `postSlug`：

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    category: z.string(),
    tags: z.array(z.string()),
    postSlug: z.string(),
  }),
});

export const collections = { blog };
```

之後所有路由相關的地方改用 `entry.data.postSlug` 就好。這個教訓很簡單：**Astro 的保留字比你想像的多，自訂欄位最好加個前綴。**

## 坑二：URL 結構要完全對齊舊站

Hexo 預設的 URL 長這樣：`/2019/03/20/static-site-generator-comparison/`。Google 已經索引了六年，如果我改掉這個結構，SEO 直接歸零。

Astro 的動態路由會從 `src/pages/` 下的檔名解析，常見做法是建一個 `[slug].astro`。但我需要的是 `[year]/[month]/[day]/[slug]/` 這種四層結構。

我一開始試著用巢狀目錄 `src/pages/[year]/[month]/[day]/[slug].astro`，跑得起來，但 `getStaticPaths` 的程式碼長得很冗：

```astro
---
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => {
    const d = post.data.date;
    const year = d.getFullYear().toString();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {
      params: { year, month, day, slug: post.data.postSlug },
      props: { post },
    };
  });
}

const { post } = Astro.props;
const { Content } = await post.render();
---
```

程式碼本身沒什麼問題，但有幾個雷要注意：

1. **月份跟日期要 padStart 補零**。Hexo 的 URL 是 `/2019/03/20/`，不是 `/2019/3/20/`，少補零就會產生 404
2. **`getMonth()` 從 0 開始**，所以要 `+1`。這個我第一次跑的時候忘了，結果所有三月的文章都變二月，花了十分鐘才發現
3. **檔名不能用 `[slug].astro`**，因為 `slug` 在 Astro 裡是保留概念（跟坑一同源）。我後來改用 `[postSlug].astro` 才穩

第二點是真的讓我哭笑不得 — 寫了這麼多年 code 還是會被 0-index 月份陰到。

## 坑三：Hexo 的 frontmatter 不完全是 YAML

這個坑比較隱晦。Hexo 的 frontmatter 看起來是 YAML，但它的 parser 比 YAML 寬鬆，很多地方可以不加引號。我的舊文章裡充滿了這種寫法：

```yaml
---
title: 隨手 Design Pattern (7) - 觀察者模式 (Observer Pattern)
date: 2018-05-20 21:30:00
tags:
  - Design Pattern
  - C#
---
```

丟進 Astro，`astro check` 立刻報錯：

```text
YAMLException: bad indentation of a mapping entry
```

原因有兩個：

1. **`title` 裡的括號沒加引號**，標準 YAML parser 會把它當成 flow sequence 或 mapping，直接炸
2. **`date` 是 `YYYY-MM-DD HH:MM:SS` 格式**，Astro 的 Zod schema 預期的是 ISO 8601 或純 `YYYY-MM-DD`

我寫了一個簡單的 Node.js 腳本批次處理。重點是不要相信任何「看起來沒問題」的 frontmatter，全部加引號就對了：

```javascript
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const BLOG_DIR = './src/content/blog';

for (const file of fs.readdirSync(BLOG_DIR)) {
  if (!file.endsWith('.md')) continue;
  const fullPath = path.join(BLOG_DIR, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const parsed = matter(raw);

  // 時間只保留日期部分
  if (parsed.data.date instanceof Date) {
    parsed.data.date = parsed.data.date.toISOString().slice(0, 10);
  }

  // 把舊的 slug 搬到 postSlug
  if (parsed.data.slug) {
    parsed.data.postSlug = parsed.data.slug;
    delete parsed.data.slug;
  }

  // gray-matter 的 stringify 會自動幫字串加引號
  fs.writeFileSync(fullPath, matter.stringify(parsed.content, parsed.data));
}
```

27 篇文章三秒跑完。省時間的重點是用 `gray-matter` 這個套件，它會自動幫字串加正確的引號，不用自己處理特殊字元的 escape。

## 坑四：`@astrojs/sitemap` 的版本衝突

這個是最後上 CI 的時候才爆出來的。我照 Astro 文件裝了最新版的 `@astrojs/sitemap`，`pnpm dev` 跑得好好的，結果 `pnpm build` 直接噴：

```text
[sitemap] Error: Cannot read properties of undefined (reading 'site')
```

追下去才發現，那時候 `@astrojs/sitemap` 3.7.1 跟 Astro 4.x 有相容性問題 — 3.7.x 系列是為了配合 Astro 5 的 API 改的，在 4.x 上會拿不到 `site` config。

解法很簡單，鎖回 3.2.1：

```sh
pnpm remove @astrojs/sitemap
pnpm add @astrojs/sitemap@3.2.1
```

再跑 `pnpm build`，sitemap 正常產出。這個坑的教訓是：**Astro 的 integration 套件升級頻率很高，遇到神祕錯誤時第一件事就是看 integration 版本有沒有跟主套件對齊**，不要鐵齒用最新版。我自己現在的習慣是 `astro` 跟 `@astrojs/*` 的版本都在 `package.json` 裡鎖死，升級時一起動，不讓 `^` 自作主張。

## 結語

升級完之後的感受是 — Astro 確實比 Hexo 舒服很多，build 時間從十幾秒掉到 3.5 秒，Content Collection 的 type safety 讓改 frontmatter 時再也不用擔心打錯欄位名。但遷移過程的坑多半卡在「Astro 跟 Hexo 對同一個概念的命名不同」這件事上，像是 slug、URL 結構、frontmatter 的寬鬆程度，每一個都需要你坐下來對著文件想清楚。

如果你也打算做類似的遷移，我的建議是先挑一篇最複雜的文章（有程式碼、有圖片、有奇怪字元）當白老鼠，把 pipeline 跑通再批次處理其餘文章。一次轉 27 篇然後 debug，絕對比一次轉 1 篇搞定後再複製貼上花更多時間。

[Astro Content Collections 文件](https://docs.astro.build/en/guides/content-collections/)
[gray-matter](https://github.com/jonschlinkert/gray-matter)
