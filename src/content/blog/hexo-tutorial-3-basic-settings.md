---
title: "Hexo（3）－基本設定"
description: "有了第一個自己的 Blog，也順利的產生第一篇文章，接下來我們來做一些設定，讓 Blog 更量身打造一些。請打開目錄下的 _config.yaml，我們一步步調整。Site 設定是 Blog 的基本資訊，請修改基本的資訊上去"
date: 2018-05-10
category: "程式開發"
tags: ["Hexo", "Static Site Generator"]
postSlug: "hexo-tutorial-3-basic-settings"
---

>有了第一個自己的 Blog，也順利的產身第一篇文章，接下來我們來做一些設定，讓 Blog 更量身打造一些。

<!--more-->

請打開目錄下的 `_config.yaml` ，我們一步步調整。

#### Site 設定

Site 是 Blog 的基本資訊，請修改基本的資訊上去。

```yaml
# Site
title: Hexo
subtitle:
description:
keywords:
author: John Doe
language:
timezone:
```

#### URL 設定

```yaml
# URL
## If your site is put in a subdirectory, set url as 'http://yoursite.com/child' and root as '/child/'
url: https://raychiutw.github.io
root: /
permalink: :year/:month/:day/:title/
permalink_defaults:
```

- url：Blog 的網址。
- root：若網站有子目錄記得修改。`'http://yoursite.com/child' and root as '/child/'`
- permalink：若有 SEO 考量，可改為更簡短的設定

#### Directory 設定

```yaml
# Directory
source_dir: source
public_dir: public
tag_dir: tags
archive_dir: archives
category_dir: categories
code_dir: downloads/code
i18n_dir: :lang
skip_render:
```

本區使用預設值即可

#### Extensions 設定

```yaml
# Extensions
## Plugins: https://hexo.io/plugins/
## Themes: https://hexo.io/themes/
theme: landscape
```

- theme：主題設定預設 landscape，後續會改使用 material。

#### Deployment 設定

```yaml
# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  type:
```

部署的方式會是部署到 Github Pages，這部分有後續有專文說明

#### 結論

Hexo 預設的定義並不複雜，但是要讓他更完善好用仍須費一番心思調整，接著就來一一說明。