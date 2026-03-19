---
title: "Hexo教學（5）－Material 主題設定"
description: "自建 Blog 其中一種樂趣就是可以換很多種風格迥異的主題，不過仍需要一點程式基礎才能做好設定，接下來會以 Hexo 排名第二的主題 Material 來做說明。下載主題與更名設定檔"
date: 2018-05-20
category: "程式開發"
tags: ["Hexo", "Hexo Themes", "Static Site Generator"]
postSlug: "hexo-tutorial-5-material-theme-settings"
---

>自建 Blog 其中一種樂趣就是可以換很多種風格迥異的主題，不過仍需要一點程式基礎才能做好設定，接下來會以 Hexo 排名第二的主題 - Material 來做說明。

<!--more-->

#### 下載主題與更名設定檔

Hexo 只需要將主題文件放置於站點目錄的 themes 目錄下。從 Github [下載](https://github.com/viosey/hexo-theme-material/releases)最新版本。並更名為 `material`。

資料夾可任意更名，但 `_config.yml` 的設定需同資料夾名稱。

第一次啟用時需先將 material 內的 `_config.template.yml` 更名為 `_config.yml`。

#### 如何變更主題

先理解兩個名詞

>站點配置文件

站點目錄下的 `_config.yml`

>主題配置文件

material 資料夾下的 `_config.yml`

開啟站點配置文件，更改 `language` 與 `theme` 設定

語系支援清單

- العَرَبِيَّة (ar)
- Deutsch (de)
- English (en)
- Español (es)
- Français (fr)
- 日本語 (ja)
- Malay (ms)
- Portuguese (Brazil) (pt-BR)
- 简体中文 (zh-CN)
- 繁體中文 (zh-TW)

```yaml
language: zh-TW
```

```yaml
theme: material
```

#### 為什麼選擇 Material

- 真的很潮，Material Design 真的很潮，讓人印象深刻。
- 完整的文件說明，[說明連結](https://material.viosey.com/docs/)
- 整合眾多功能，整合了回覆留言、標籤、分類、時間軸、站內搜尋、 QR Code 等功能

#### Material 主題設定

接下來主題配置文件的設定

>設定樣式

- Paradox: 標準 Material Design
- Isolation: 極簡風格
- Nexus: 未完成，此專案已經久未更新，應該是沒有完成之日了。

```yaml
# Schemes
scheme: Paradox
#scheme: Isolation
#scheme: Nexus
```

> 選單設定

選單設定是比較有趣的地方，可以自由排列想要選單。

- icon: 使用 Material icon，完整 icon 清單請參考 [material design icons](https://www.materialpalette.com/icons)
- divider: 分隔線

```yaml
# Sidebar Customize
sidebar:
    dropdown:
        Email Me:
            link: mail@mail.com
            icon: email
        Github:
            link: "https://github.com/username"
            icon: layers
    homepage:
        use: true
        icon: home
        divider: false
    archives:
        use: true
        icon: inbox
        divider: false
    categories:
        use: true
        icon: chrome_reader_mode
        divider: false
    pages:
        標籤:
            link: "/tags"
            icon: bookmark
            divider: false
        時間軸:
            link: "/timeline"
            icon: timeline
            divider: false
        #About:
            #link: "/about"
            #icon: person
            #divider: false
    article_num:
        use: true
        divider: false
    footer:
        divider: true
        theme: true
        support: false
        feedback: false
        material: false
```

如此就一個看起來蠻完整的外觀囉。