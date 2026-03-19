---
title: 'Jeykll 快速安裝教學'
description: 'Jeykll 是 Github 的聯合創始人的作品，以 Ruby 開發的靜態網頁產生器，是目前最受歡迎的，相關資源最多的 ssg，本篇就來簡單快速教學'
date: 2019-04-12
category: '程式開發'
tags: ['Jekyll', 'Static Site Generator']
postSlug: 'jekyll-quick-install-guide'
---

> Jeykll 是 Github 的聯合創始人的作品，以 Ruby 開發的靜態網頁產生器，是目前最受歡迎的，相關資源最多的 ssg，本篇就來簡單快速教學。

## 安裝

先安裝 Ruby

Windows 可以參考安裝 [RudyInstaller for Windows](https://rubyinstaller.org/)

更新 Rudy Gems

```sh
gem update --system
```

安裝 Jekyll

```sh
gem install bundler jekyll
```

## 第一個站台

```sh
jekyll new jekylldemo
```

```sh
cd jekylldemo
bundle exec jekyll serve
```

## 部署

Github Pages 是和 Jekyll 最合拍的 Hosting 空間，同個一爸爸的優勢下，只要將整個原始檔案簽入 Github，過一會就會自動生成檔案。

## 結論

### 優點

- 和 Github Pages 深度整合（其他 Hosting 空間也是很容易部署）。
- 相關插件資源眾多。
- \_config.yml 設定統一。

### 缺點

- 操作指令較少（搭配 rake 會好很多）。
- 產生靜態頁速度較慢。
