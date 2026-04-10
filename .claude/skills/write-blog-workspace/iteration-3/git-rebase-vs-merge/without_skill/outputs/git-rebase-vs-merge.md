---
title: 'Git Rebase vs Merge：該選哪一個？一篇搞懂整合分支的兩種哲學'
description: '深入比較 Git rebase 與 merge 的差異、適用時機與團隊協作眉角。從實際情境出發，帶你理解兩種整合策略背後的設計哲學，避免踩雷並建立乾淨的專案歷史。'
date: 2026-04-10
category: 'Git'
tags: ['AI生成', 'Git', '版本控制', '團隊協作', '最佳實踐']
postSlug: git-rebase-vs-merge
---

## 前言：那個永遠爭不完的話題

如果你混過開源社群或技術 Slack 頻道，大概聽過這類對話：

> A：「拜託不要 merge commit 了，歷史這麼亂怎麼看？」
> B：「你 rebase 把 public branch 的歷史改掉才可怕好不好！」

Git rebase vs merge 就像「Tab 還是空格」一樣，是那種會讓兩個成熟工程師開始皺眉頭的話題。但實際上，這兩個指令並不是對立的，它們是兩種不同的**整合哲學**，各有適用的場景。

這篇文章會帶你理解兩者的底層差異、實際使用情境、常見的雷區，以及團隊協作時該怎麼挑選。如果你已經用過 `git merge` 和 `git rebase`，但總覺得自己是憑感覺在選，那這篇就是寫給你看的。

## 一、兩者到底在幹嘛？

### Merge：把兩條歷史「接起來」

`git merge` 做的事情很直觀：把兩條分支的最新狀態合在一起，產生一個新的 **merge commit**，這個 commit 有兩個 parent，分別指向被合併的兩條分支。

```
      A---B---C  feature
     /         \
D---E---F---G---M  main
```

`M` 就是 merge commit，它保留了 `main` 和 `feature` 兩條歷史的完整脈絡。從 `M` 往回看，你能清楚知道「這個功能是從哪個點 branch 出去、又在哪個點合回來」。

### Rebase：把 commit「重新播放」到新的起點

`git rebase` 的思路完全不同。它會把你分支上的 commit 一個一個「拔起來」，再重新套用到目標分支的最新狀態上。

```
            A'--B'--C'  feature
           /
D---E---F---G  main
```

注意到了嗎？`A`、`B`、`C` 變成了 `A'`、`B'`、`C'`——它們是**新的 commit**，有新的 hash。原本的 `A`、`B`、`C` 其實還在，只是沒有 ref 指向它們，最終會被 GC 清掉。

這就是 rebase 的核心：**它不是合併，它是重寫歷史**。

## 二、實際情境比一比

光看圖很抽象，我們用一個實際情境來對照。假設你在 `feature/login` 分支上開發登入功能，做了三個 commit：

```bash
git log --oneline feature/login
c3d4e5f Add password validation
b2c3d4e Add login form UI
a1b2c3d Set up login route
```

同時，`main` 分支上有其他人合併了新的 commit。

### 用 merge 的做法

```bash
git checkout feature/login
git merge main
```

結果：

```
*   Merge branch 'main' into feature/login
|\
| * (main) Update header component
| * Fix typo in README
* | Add password validation
* | Add login form UI
* | Set up login route
|/
* (common ancestor) Previous commit
```

**優點：** 不會動到原本的 commit，團隊其他人 pull 下來不會爆炸。
**缺點：** 如果你中途 merge 多次，歷史會出現一堆「菱形」結構，`git log --graph` 看起來像捷運路線圖。

### 用 rebase 的做法

```bash
git checkout feature/login
git rebase main
```

結果：

```
* (HEAD -> feature/login) Add password validation
* Add login form UI
* Set up login route
* (main) Update header component
* Fix typo in README
* (common ancestor) Previous commit
```

**優點：** 歷史是一條漂亮的直線，review 的時候邏輯清楚。
**缺點：** 原本的 commit hash 全都變了。如果你已經 push 到遠端，而且其他人基於那個分支繼續工作，那就悲劇了。

## 三、什麼時候用哪一個？

這是大家最想知道的部分。我的個人經驗法則如下：

### 用 Rebase 的場景

**1. 整理自己的 local feature branch**

在 push 之前，用 `git rebase -i` 把 「fix typo」、「fix typo again」、「really fix typo」這種 commit 壓一壓，整理成有意義的單元。Reviewer 會感謝你。

**2. 同步 main 到還沒 PR 的 feature branch**

你自己的分支還沒給其他人用，那 rebase 到最新的 main 完全沒問題，歷史也乾淨。

**3. 修正 commit message 或拆分 commit**

`git rebase -i` 的 `reword`、`edit`、`split` 功能，是整理 commit 歷史的瑞士刀。

### 用 Merge 的場景

**1. 整合 feature branch 到 main**

正式合併到 main（或 master、develop）時，用 merge 並保留 merge commit，這樣之後 `git log --first-parent main` 就能清楚看到「哪些 feature 進了 main」。

GitHub、GitLab 的 PR/MR 預設就是這個邏輯。

**2. 多人協作的共享分支**

只要這個分支有超過一個人在用，**永遠不要 rebase**。Rebase 會改寫歷史，其他人 pull 下來會陷入 merge hell。

**3. 想保留完整脈絡**

某些團隊（例如維護 LTS 版本的 open source 專案）會想知道每個 commit 當時是在哪個 branch、哪個 context 下寫的。Merge 保留了這個資訊。

## 四、黃金法則：不要 rebase 公開歷史

這句話你可能聽過一百次，但我還是要強調一次：

> **The Golden Rule of Rebasing：不要在 public branch 上 rebase。**

原因很簡單。假設你的同事基於 `origin/feature/login` 的 commit `a1b2c3d` 繼續開發，這時候你 rebase 了 `feature/login` 並 force push，`a1b2c3d` 變成了 `a1b2c3d'`，但它還在你同事的 local branch 上——**你同事接下來的 pull 會陷入地獄**。

輕則一堆 conflict，重則整個團隊的 commit 歷史變成薛丁格的貓：同一段程式碼在不同人的 repo 裡有不同的 hash。

如果真的需要 force push（例如 rebase 一個只有自己在用的 feature branch），**一定要用 `--force-with-lease` 而不是 `--force`**：

```bash
git push --force-with-lease origin feature/login
```

`--force-with-lease` 會檢查遠端分支的最新狀態是不是你上次 fetch 到的版本。如果中間有人 push 了新東西，這個指令會拒絕執行，避免覆蓋掉別人的工作。

## 五、團隊該怎麼選？三種常見策略

大多數團隊會在這三種策略中挑一個：

### 策略 A：Merge Only（保留 merge commit）

- **做法：** 所有 PR 都用 merge commit 合進 main，不 squash、不 rebase。
- **適合：** 大型團隊、open source 專案、需要完整歷史追蹤。
- **優點：** 歷史最完整，出事可以精準還原當時的 context。
- **缺點：** `git log` 很熱鬧，新人容易看花眼。

### 策略 B：Rebase + Merge（乾淨的直線歷史）

- **做法：** feature branch 先 rebase 到最新 main，再用 fast-forward 或 merge commit 合進去。
- **適合：** 中小型團隊、追求乾淨歷史。
- **優點：** `git log --oneline` 讀起來像一本章節分明的書。
- **缺點：** 需要紀律，team member 都得懂 rebase。

### 策略 C：Squash Merge（一個 PR 一個 commit）

- **做法：** 把 feature branch 的所有 commit 壓成一個，再合進 main。
- **適合：** PR 顆粒度明確、偏產品導向的團隊。
- **優點：** main 歷史極簡，一個 commit 對應一個功能。
- **缺點：** 失去了開發過程中的 commit 細節，之後想 bisect 到「那個中間步驟」就沒辦法了。

**我的建議：** 中小型團隊選 B，大型專案選 A，新創公司或產品快速迭代選 C。不要在 repo 裡混用這三種策略，會讓歷史變成混亂的縫合怪。

## 六、實戰：解 rebase 衝突

Rebase 遇到衝突是很多人放棄 rebase 的主因。它跟 merge 衝突最大的差別是：**rebase 會把每個 commit 重新套用一次，所以可能會在同一段程式碼遇到多次衝突**。

正確的處理流程：

```bash
# 1. rebase 停在衝突的 commit
git status  # 看哪些檔案衝突

# 2. 手動解衝突，然後
git add <resolved-file>

# 3. 繼續下一個 commit
git rebase --continue

# 4. 如果發現局勢不對，隨時可以放棄
git rebase --abort
```

**一個實用技巧：** 打開 `git config rerere.enabled true`，Git 會記住你解過的衝突，下次遇到同樣的衝突會自動套用解法。對於頻繁 rebase 的 long-lived branch 是救命符。

## 結語：選擇比爭論更重要

回到文章開頭的爭論：rebase 派和 merge 派誰對？

答案是：**都對，但在不同場景下。**

Rebase 是一把精緻的手術刀，適合整理自己的工作、保持歷史清爽；Merge 是忠實的紀錄員，保留所有發生過的事情。好的 Git 使用者不會只用一種，而是知道什麼時候該拿哪一把工具。

最後送大家一句話：**如果你的團隊還在為這件事吵架，先寫清楚 contributing guide，比繼續爭論有用一百倍。** 技術選擇沒有絕對對錯，重要的是整個團隊用同一套規則。

下次你在 terminal 前猶豫要打 `git merge` 還是 `git rebase` 的時候，問自己兩個問題就好：

1. 這個分支有其他人在用嗎？→ 有的話，**merge**。
2. 我想要乾淨的直線歷史還是完整的分支脈絡？→ 前者 **rebase**，後者 **merge**。

搞定收工，去寫 code 吧。
