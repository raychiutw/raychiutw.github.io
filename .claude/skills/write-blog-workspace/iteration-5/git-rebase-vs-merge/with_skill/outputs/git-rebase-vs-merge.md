---
title: 'Git rebase 還是 merge？我在團隊裡怎麼選'
description: '在團隊協作裡 rebase 和 merge 到底該怎麼選？本文用實際的 commit graph 比較兩種整合分支的方式，說明各自的優缺點、踩過的坑，以及我個人在 feature branch 和主幹維護時的取捨原則。'
date: 2026-04-09
category: '版本控制'
tags: ['AI生成', 'Git', 'Rebase', 'Merge', 'Workflow']
postSlug: 'git-rebase-vs-merge'
---

> rebase 和 merge 都能把兩條分支合在一起，但產生的歷史長相完全不同。選錯了就是一條滿是 merge commit 的蛇形河流，或一段被改寫到隊友罵髒話的 commit 歷史。

我第一次被 rebase 咬的時候，是剛進某個小團隊的第二週。我自認學過 Git，看到 feature branch 落後 main 好幾個 commit，想說 rebase 一下讓線變漂亮——結果因為那條 branch 已經 push 上去給同事看過，我又順手 `git push --force` 覆蓋掉，同事下午拉下來整個爆掉。那天之後我才真的搞懂：rebase 跟 merge 的差別不只是「圖形長怎樣」，而是「你願不願意改寫歷史」。

這篇文章整理我這幾年在不同團隊的取捨，包含 commit graph 的實際比較、每種做法的適用場景，還有我自己的選法。

## 先看兩個指令在做什麼

假設現在有一條 `main` 和一條從 `main` 分出去的 `feature` branch，兩邊各自前進了幾個 commit：

```text
main:     A --- B --- C
                 \
feature:          D --- E
```

接著 `main` 又被其他人 push 了新的 commit F：

```text
main:     A --- B --- C --- F
                 \
feature:          D --- E
```

現在我在 `feature` 上，想把 `main` 的最新改動拿過來。兩種做法：

### merge 的做法

```sh
git checkout feature
git merge main
```

Git 會建立一個新的 **merge commit**（通常叫 M），把兩條線綁在一起：

```text
main:     A --- B --- C --- F
                 \           \
feature:          D --- E --- M
```

這個 M 有兩個 parent——一個是 `feature` 的 E，一個是 `main` 的 F。歷史被完整保留，誰在哪個時間點做了什麼一目瞭然。

### rebase 的做法

```sh
git checkout feature
git rebase main
```

Git 會把 `feature` 上的 D、E 兩個 commit「拔起來」，然後放到 `main` 最新的 F 後面：

```text
main:     A --- B --- C --- F
                             \
feature:                      D' --- E'
```

注意 D 和 E 變成了 D' 和 E'——它們是**新的 commit**，雖然內容一樣但 hash 不同。看起來像是 `feature` 從一開始就是從 F 分出去的，歷史變成一條直線。

## merge 的優缺點

**優點：**

- 完全不改寫歷史，push 過的 commit 不會動
- 衝突只需要解決一次（就在 merge commit 那一刻）
- 可以清楚看到某個 feature 分支何時合進來
- 適合新手，不容易把事情搞砸

**缺點：**

- commit graph 容易變成蜘蛛網，特別是多人協作的專案
- `git log` 看下去一堆 `Merge branch 'xxx' into yyy`，找改動來源要額外花力氣
- bisect 時走到 merge commit 會變得比較麻煩

我見過最誇張的 repo 是前東家的 legacy 專案，`git log --graph` 打開來整個畫面都是縱橫交錯的線，連 GitLens 都渲染不動。那種 repo 要追一個 bug 的源頭，幾乎只能靠記憶力。

## rebase 的優缺點

**優點：**

- 歷史是一條漂亮的直線，`git log` 讀起來就像一本書
- bisect、cherry-pick、revert 都更直觀
- 可以搭配 `git rebase -i` 在 push 前順手整理 commit（squash、reword、reorder）

**缺點：**

- 會改寫 commit hash，已經 push 到共享 branch 的 commit 不能亂 rebase
- 如果 feature branch 跟 main 衝突很多次，每次 rebase 可能要解好幾輪一樣的衝突
- 新手很容易 `--force` 覆蓋掉別人拉過的 branch，造成災難

rebase 的威力大，但副作用也大。它本質上就是「用新的 commit 換掉舊的 commit」，只要有任何一個同事已經在舊的 commit 上接著工作，你 force push 完他的工作就會掛在半空中——他 pull 下來會看到一堆詭異的「你的 local 跟 remote 分岔了」訊息，要嘛重做要嘛手動救。

## 比較表

| 面向                   | merge                    | rebase                 |
| ---------------------- | ------------------------ | ---------------------- |
| 是否改寫歷史           | 不會                     | 會（產生新 commit）    |
| commit graph 形狀      | 有分岔、合流             | 一條直線               |
| 衝突解決次數           | 一次（merge 那一刻）     | 每個 commit 可能都要解 |
| 對共享 branch 的安全性 | 安全                     | 危險（需 force push）  |
| 保留分支意圖           | 保留（看得到 branch 點） | 不保留（線性化）       |
| 適合情境               | 共享 branch、long-lived  | 個人 feature branch    |
| 新手友善度             | 高                       | 低                     |
| 搭配 bisect            | 可能會走進 merge commit  | 直接、乾淨             |

## 我自己的取捨原則

講完教科書式的比較，談談實務上我怎麼選。

**個人 feature branch 落後 main，還沒 push 或只有我自己在看：rebase。** 這是最典型、最安全的 rebase 場景。把 main 最新的改動 rebase 進來，歷史保持直線，等要發 PR 的時候 reviewer 看的是一段連續的 commit，不會被 merge commit 干擾。

**feature branch 已經 push 上去給同事 code review：看情境。** 如果只有我自己在 commit，review 的人不會主動 pull 這條 branch 來改 code，我還是會 rebase，然後 `git push --force-with-lease`——`--force-with-lease` 會在 remote 有新 commit 時拒絕 push，比裸的 `--force` 安全很多。但如果同事會直接 push 到這條 branch（例如 pair programming），那就老老實實 merge。

**main / master / develop 這種共享 branch：一律 merge。** 這種 branch 永遠不 rebase，因為所有人都在上面。改寫歷史的代價太大，不值得。

**PR 合進 main 的時候：看團隊規則。** 我比較喜歡 **squash merge**——把整個 feature branch 壓成一個 commit 進 main，這樣 main 的歷史就是一個 feature 一個 commit，非常乾淨。但也見過團隊用 **rebase merge**，保留 feature 的每個 commit 但線性化；或 **普通 merge commit**，保留完整歷史。三種都可以，重點是團隊要統一，不要一個人一種風格。

**`git pull` 要不要改成 `git pull --rebase`？** 我自己是設 `pull.rebase = true`，避免每次 pull 都產生一個莫名其妙的 merge commit。但這個設定要全團隊有共識，不然會有人看到自己的 commit 被 rebase 掉而崩潰。

## 踩過的坑

列幾個我或隊友實際踩過的坑，希望可以省你一些時間。

**坑一：在共享 branch 上 rebase 後 force push。** 就是文章開頭那個故事。救的方法是讓受害者用 `git reflog` 找回自己本來的 commit，但那天整團隊停擺了快一小時。從此我設了一條規則：任何 branch 只要不是我一個人用，就不 rebase。

**坑二：rebase 到一半衝突太多，放棄。** rebase 可以 `git rebase --abort` 直接取消，回到 rebase 前的狀態。不要硬解——如果衝突真的很密集，改用 merge 反而乾淨，merge 只要解一次。

**坑三：rebase 後發現 commit 不見了。** 大部分情況是 `git rebase -i` 時不小心把某行改成 `drop`，或是解衝突時把某個 commit 的內容誤刪。補救方法一樣是 `git reflog`，找到 rebase 前的 HEAD，checkout 過去救檔。reflog 會保留 90 天，是 Git 的時光機。

**坑四：`--force` 跟 `--force-with-lease` 搞混。** 前者是核彈，會無條件覆蓋 remote；後者會檢查 remote 的 commit 是不是你 local 知道的那個，如果別人有新 push 就會拒絕。從今天開始請把 `--force` 從肌肉記憶裡刪掉，只用 `--force-with-lease`。

## 結語

rebase 和 merge 沒有誰對誰錯，只有「適不適合現在這個情境」。我的心法其實很簡單：**個人 branch 用 rebase 讓歷史好看，共享 branch 用 merge 讓歷史安全**。再搭配 squash merge 把 PR 壓成單一 commit 進 main，基本上可以兼顧乾淨歷史和團隊協作的安全性。

如果你現在的團隊工作流還在「pull 完有一堆 merge commit、main 的 log 看不懂在幹嘛」的階段，建議先把 `pull.rebase` 打開、把 PR 合併策略改成 squash，這兩步驟幾乎零成本但效果立竿見影。

[Git 官方文件 - Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)
[Atlassian - Merging vs Rebasing](https://www.atlassian.com/git/tutorials/merging-vs-rebasing)
