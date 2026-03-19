---
title: "Hexo教學（1）－快速安裝"
description: "那我們就開始吧。安裝 Node.js，下載Node.js，安裝 Hexo，建立第一個 Blog，請在想要的目錄下打開命令列視窗。執行站台，在瀏覽器輸入 localhost:4000 有看到下圖就成功建立第一個部落格站囉"
date: 2018-04-29
category: "程式開發"
tags: ["Hexo", "Static Site Generator"]
postSlug: "hexo-tutorial-1-quick-install"
---

> 那我們就開始吧。

## 安裝 Node.js

[下載Node.js](https://nodejs.org/en/)

<!--more-->

## 安裝 Hexo

```sh
npm install -g hexo-cli
```

## 建立第一個 Blog

請在想要的目錄下打開命令列視窗。

```sh
hexo init myblog
cd myblog
npm install
```

## 執行站台

```sh
hexo server
```

或者

```sh
hexo s
```

在瀏覽器輸入 `http://localhost:4000` 有看到下圖就成功建立第一個部落格站囉。

![第一個Blog畫面](/images/blog/first-look.png "第一個畫面")。