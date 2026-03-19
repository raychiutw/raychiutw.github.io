---
title: '靜態網站產生器大比拚'
description: '靜態網站產生器 (Static Site Generator) 是快速架站的利器，更是輕量級部落格架站的好幫手，本篇將常見的 Jekyll、Hexo、Hugo 三套工具做了評比'
date: 2019-03-20
category: '程式開發'
tags: ['Static Site Generator', 'Hexo', 'Hugo', 'Jekyll']
postSlug: 'static-site-generator-comparison'
---

> 靜態網站產生器 (Static Site Generator) 是快速架站的利器，更是輕量級部落格架站的好幫手，本篇將常見的 Jekyll、Hexo、Hugo 三套工具做了評比‧。

### 選擇靜態網站的原因？

現在有很多網站後端程式語言可供選擇，為什麼許多網站仍選擇靜態網站？

- 不需要 Database。
- 不需要後端程式。
- 要速度快
  - 靜態網站與動態網站相比更快，因為它們不需要後端處理或 Database 處理。
- 要安全性高
  - 靜態網站比任何動態網站都更安全，因為安全漏洞更少。
- Cache 靜態頁較容易且有效率。

### Jekyll

Jekyll是基於 Ruby Gem 的解析引擎，能夠將樣板、liquid 語言、markdown 轉換為"靜態網頁"的產生器。

#### Jekyll 優點

- 免費和開源。
- 簡單易用。
- 輕鬆地從熱門平台（例如WordPress）遷移內容。
- Github Pages 支援。
- 自帶默認主題，安裝後即可使用。
- 眾多的插件。
- 完整的教學文件。

#### Jekyll 缺點

- 隨著網站內容的增長，構建過程變得非常慢。
- 很多插件都過時了。

### Hugo

Hugo　是一個用　Go　構建的靜態網站生成器。它被宣傳為"世界上最快的網站構建框架"。
與Jekyll不同，Hugo是用Go編寫的，這是一種靜態編譯的語言。這在很多方面影響了 Hugo 的功能特別是插件。

可以在幾秒鐘內安裝Hugo，並在不到一秒的時間內構建一個平均靜態網站。

#### Hugo 優點

- 開源和免費。
- 超快的速度，引擎和速度優化。

#### Hugo 缺點

- 主題使用 Go 模板，需要熟悉 Go 來創建主題
- Hugo 沒有附帶默認主題。
- 插件較少。

### Hexo

Hexo是基於 Node.js 的靜態網站生成器，Hexo 可以在幾秒鐘內生成數百個靜態文件。

#### 優點

- 開源和免費。
- 自帶默認主題，安裝後即可使用。
- 速度快
  - Node.js 帶給您超級快的檔案產生速度，上百個檔案只需幾秒就能建立完成。
- 一鍵部署
  - 強大的Markdown支持
- Hexo 支援所有 GitHub Flavored Markdown 的功能，您甚至能在 Hexo 使用大部份的 Octopress 外掛。
- 豐富的外掛
  - Hexo 有強大的外掛系統，您可安裝外掛讓 Hexo 支援 Jade, CoffeeScript。

#### 缺點

- Hexo 有一個相對較大的社區，但大多數是非英語人士（來自中國）
- 錯綜複雜的 npm 生態

### 人氣大比拚

![社群活耀度](/images/blog/comparison.png)

[來源出處](https://stackshare.io/stackups/hexo-vs-hugo_2-vs-jekyll)

### 結論

最後選擇了 Hexo 作為 Blog 生成器，原因有幾個

- 中文資源多
- 插件功能齊全完整
- node.js 較為熟悉

你，選擇哪個呢？
