---
title: "Hexo教學（2）－第一篇文章"
description: "快速建立第一個 Blog 之後，接下當然是來產生第一篇文章。用指令產生文章，Hexo new 文章名稱可以快速產生一個 markdown 出來，產生的檔案放在 source post 下。產生靜態檔，Hexo 是將 markdown 產生靜態 html 的框架"
date: 2018-04-29
category: "程式開發"
tags: ["Hexo", "Static Site Generator"]
postSlug: "hexo-tutorial-2-first-post"
---

> 快速建立第一個 Bolg 之後，接下當然是來產生第一篇文章。

<!--more-->

#### 用指令產生文章

Hexo new "文章名稱" 可以快速產生一個 markdown 出來，產生的檔案放在 /source/post/ 下。

```sh
npm new first-post
```

#### 產生靜態檔

還記得上篇說提，Hexo 是將 markdown 產生靜態 html 的框架，有了 markdown 後，那就讓我們來產生靜態檔吧。

```sh
hexo generate
```

或者

```sh
hexo g
```

檢查 /public/ 下是否有剛剛那篇的 html 了呢？

讓我們再去看看 `http://localhost:4000` 是否有新文章了。