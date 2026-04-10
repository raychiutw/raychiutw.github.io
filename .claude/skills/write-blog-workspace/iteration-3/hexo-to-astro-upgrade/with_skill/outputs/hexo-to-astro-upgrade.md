---
title: '從 Hexo 搬到 Astro 的踩雷筆記'
description: '把 Hexo 部落格搬到 Astro 看起來只是換個框架，實際上踩了不少坑。Markdown 解析差異讓舊文章格式跑掉、圖片路徑全部要改寫、RSS 和 sitemap 的 slug 對不起來、Shiki 程式碼區塊也要重新調。這篇記錄我升級過程中遇到的幾個關鍵問題和對應解法。'
date: 2026-04-10
category: '程式開發'
tags: ['AI生成', 'Astro', 'Hexo', 'Markdown', 'Migration']
postSlug: 'hexo-to-astro-upgrade'
---

> 舊站跑 Hexo 跑了好幾年，文章累積快兩百篇。這次一狠心搬到 Astro，本以為只是換個靜態產生器，結果光 Markdown 行為差異就讓我重寫了半個晚上的 remark plugin。

我這個部落格從 Hexo 時代就開始寫，最早版本大概是 Hexo 3.x 左右。這幾年陸續換了幾次主題，但底層一直沒動。這次決定搬到 Astro，原因其實很簡單 — 我開始想用 React 元件做一些互動式範例，Hexo 的 EJS 模板對我來說綁手綁腳。

真的動手之後才發現，兩個框架對 Markdown 的處理完全是兩個世界。下面記錄幾個我撞到頭破血流的點，希望能讓想搬家的人少走一些彎路。

## 坑一：Markdown 解析器不是同一套

Hexo 預設用 `hexo-renderer-marked`，而 Astro 用的是 `remark` + `rehype` 的 pipeline。這兩套對 Markdown 的「嚴格程度」差很多。

最明顯的問題是 list 底下的換行。我舊文章有大量這種寫法：

```markdown
- 第一項
  接一段補充說明
- 第二項
```

Hexo 會把「接一段補充說明」當成第一項的延伸內容渲染在同一個 `<li>` 裡。Astro（嚴格的 CommonMark）則會把它當成獨立段落，結果整個 list 就斷掉了。

我試過兩種解法。第一種是寫 remark plugin 自動補 4 個空格縮排，但我發現這樣反而會污染其他正常格式。後來改用第二種：直接在搬遷腳本裡跑一次 `remark-parse` → `remark-stringify` 把所有文章重新 normalize 一次。

```javascript
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

const processor = remark().use(remarkGfm);

const normalized = await processor.process(rawMarkdown);
```

這個步驟讓我的 200 多篇文章全部變成 CommonMark-compliant 的格式，之後丟進 Astro 就不會再出怪招。

## 坑二：圖片路徑從 `./images/` 變成 `/images/blog/`

Hexo 的 asset folder 行為我一直覺得很方便 — 你可以在 `_posts/foo.md` 旁邊建一個 `foo/` 資料夾放圖片，然後在文章裡直接寫 `![](image.png)` 就好。Hexo 會在 build 時自動處理相對路徑。

Astro 的 content collections 沒這套行為。你有兩個選擇：

1. 把圖片搬到 `public/images/blog/` 下，路徑改成 `/images/blog/foo.png`
2. 用 Astro 的 `<Image>` 元件搭配 import

我一開始試第二種，想說反正順便拿到 image optimization，結果發現 200 多篇文章要把每個 `![](image.png)` 改成 `import` + JSX 語法實在不合成本。最後還是選第一種 — 無腦複製到 `public/images/blog/`，然後寫 regex 把路徑全部改寫。

```javascript
// 批次改寫圖片路徑的腳本
const updatedMarkdown = rawMarkdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
  // 排除已經是絕對路徑或 http 的
  if (src.startsWith('/') || src.startsWith('http')) return match;
  const filename = src.split('/').pop();
  return `![${alt}](/images/blog/${filename})`;
});
```

這裡有一個我本來沒注意的細節：Hexo 的 asset folder 允許同名檔案存在不同資料夾，但搬到 `public/images/blog/` 這種扁平結構就會互相覆蓋。我跑腳本的時候還特別加了一個 filename collision 檢查，結果真的撈出三個撞名的檔案。差點直接覆蓋掉。

## 坑三：RSS 跟 sitemap 的 slug 對不起來

這個是我最久才找到原因的。搬完上線之後，發現 RSS reader 裡所有舊文章都變成「新文章」— 訂閱者的收件匣瞬間被我洗了一百多篇。

追了半天才發現問題：Hexo 的 permalink 預設是 `:year/:month/:day/:title/`，而我的 Astro 設定是用 `postSlug` 當 URL。結果同一篇文章在 Hexo 時代的 URL 是 `/2023/05/10/some-post/`，搬到 Astro 變成 `/posts/some-post/`，RSS 的 `<guid>` 全部對不起來，feed reader 就當成新文章了。

解法是在 Astro 的 RSS 產生邏輯裡手動指定 guid 為舊 URL 格式：

```typescript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  return rss({
    title: "Ray's Notes",
    description: 'Ray 的技術筆記',
    site: context.site,
    items: posts.map((post) => {
      const date = post.data.date;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      // 保留舊 URL 當 guid，避免被當成新文章
      const legacyGuid = `/${year}/${month}/${day}/${post.data.postSlug}/`;
      return {
        title: post.data.title,
        pubDate: date,
        description: post.data.description,
        link: `/posts/${post.data.postSlug}/`,
        customData: `<guid isPermaLink="false">${legacyGuid}</guid>`,
      };
    }),
  });
}
```

重點在 `isPermaLink="false"` — 這樣 RSS reader 不會試著去 fetch 那個網址，只會把它當成識別碼用。這個修好之後才沒繼續被罵。

## 坑四：Shiki 的 syntax highlighting 吃不懂我的舊語言標記

Hexo 時代我用的是 `highlight.js`，語言標記寫得很隨意，像 `ps1`、`cmd`、`batch`、`ini`、`dotnetcli` 這種都能跑。

換到 Astro，Shiki 的預設支援語言清單跟 highlight.js 完全不一樣。我的舊文章一堆這樣的區塊，開頭寫 `dotnetcli`、`ps1`、`cmd` 之類的：

```text
dotnet ef migrations add InitialCreate
```

build 起來會直接跳 warning 說找不到這個語言，然後整塊 code 退化成沒 highlight 的純文字。

我的做法是在 `astro.config.mjs` 裡掛一個 remark plugin，把舊語言標記 mapping 到 Shiki 支援的替代品：

```javascript
// 舊語言標記 → Shiki 對應名稱
const languageAliases = {
  dotnetcli: 'sh',
  ps1: 'powershell',
  cmd: 'batch',
  ini: 'toml',
  // 找不到語言就 fallback 到 text
};

function remarkLanguageAlias() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (node.lang && languageAliases[node.lang]) {
        node.lang = languageAliases[node.lang];
      }
    });
  };
}
```

這個 plugin 救了我大概 30 多篇以 .NET CLI 為主題的文章。

## 坑五：content collection 的 schema 驗證很嚴格

這個嚴格來說不是坑，是 feature，但第一次用 Astro 的人可能會被它擋住。

Astro 的 `defineCollection` 會用 Zod schema 驗證每篇文章的 frontmatter，只要有一個欄位不符就整個 build 失敗。我舊文章的 date 欄位有三種格式：

```text
date: 2023-05-10
date: 2023-05-10 14:30:00
date: '2023/05/10'
```

Zod 預設把這些當成不同型別。我的 schema 本來寫：

```typescript
date: z.date();
```

結果只有第一種格式能過。後來改成用 `z.coerce.date()` 才把三種都吃下去：

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().min(100).max(160),
    date: z.coerce.date(), // 關鍵：用 coerce 處理多種日期格式
    category: z.string(),
    tags: z.array(z.string()),
    postSlug: z.string(),
  }),
});

export const collections = { blog };
```

順便把 description 的長度限制也寫進去了，之後寫新文章超過 160 字 Astro 會直接擋，就不用我自己記得數。

## 我的搬遷流程長這樣

最後整理一下我實際跑的步驟，給有需要的人參考：

```text
1. 從 Hexo 匯出所有 _posts/*.md
2. 寫腳本做三件事：
   - remark normalize（修 list 縮排問題）
   - 圖片路徑改寫（相對 → 絕對）
   - 語言標記 mapping（舊 → Shiki 相容）
3. 複製 source/images/ 到 public/images/blog/（注意撞名）
4. 設定 content collection schema（用 z.coerce.date）
5. 客製 RSS 輸出（保留舊 URL 當 guid）
6. 跑 astro build 看錯誤，一篇一篇修
7. 對照舊站的 sitemap.xml 寫 301 redirect 規則
```

整個過程大概花了我兩個週末。Markdown normalize 那一步是最花時間的 — 我一開始想手動改，改到第 20 篇就放棄了，最後還是乖乖寫腳本。

## 結語

如果讓我重來一次，我會先花半天時間寫一份 dry-run 的 migration script，把所有文章跑過一遍，先把「哪些會出錯」列出來再動手。我這次是邊搬邊修，結果每次 build 都跳一兩個新問題，心理負擔蠻大的。

另外一個心得是 — 不要在搬站的同時改設計。我這次順手把主題也換掉了，結果後來分不清到底是搬遷搞壞的還是新主題的問題，debug 時間直接翻倍。下次有類似工程，我會先 1:1 搬過去、build 綠了再動樣式。

最後提醒一下：搬完之後記得跑一次 Lighthouse 和 broken link checker。我就是沒跑，結果三天後被朋友回報有幾篇文章的內部連結 404，因為舊站有些 slug 帶了中文，在新站被 URL encode 了才發現。

[Astro Content Collections 官方文件](https://docs.astro.build/en/guides/content-collections/)
[remark 生態系](https://github.com/remarkjs/remark)
