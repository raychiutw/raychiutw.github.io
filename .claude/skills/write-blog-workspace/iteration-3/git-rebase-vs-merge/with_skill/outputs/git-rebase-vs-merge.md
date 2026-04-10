---
title: 'Git rebase vs merge 怎麼選？從 commit graph 看懂兩者差異'
description: 'Git 的 rebase 和 merge 常讓人選擇困難,兩者都能整合分支但產生的歷史完全不同。這篇整理兩者的差異、視覺化 commit graph、實戰場景,以及我自己在團隊協作時的選擇準則,幫你不再憑感覺下指令。'
date: 2026-04-10
category: '版本控制'
tags: ['AI生成', 'Git', 'Rebase', 'Merge', 'Version Control']
postSlug: 'git-rebase-vs-merge'
---

> 同樣是整合分支,`git merge` 保留了完整的歷史脈絡,`git rebase` 則把提交重寫成一條直線。兩者沒有絕對的對錯,只有適不適合當下的情境。

寫程式的人大概都遇過這個選擇題:feature branch 跟 main 不同步了,該 rebase 還是 merge?網路上的答案常常互相矛盾,有人說 rebase 是邪教,有人說 merge commit 是垃圾。其實兩者各有各的設計目的,搞懂 commit graph 怎麼變,就不會再糾結。

## 準備測試環境

先建立一個最小範例,方便對照兩種做法的結果:

```sh
git init git-demo && cd git-demo
echo "base" > file.txt && git add . && git commit -m "init"

# 建立 feature branch
git checkout -b feature
echo "feature A" >> file.txt && git commit -am "feat: add A"
echo "feature B" >> file.txt && git commit -am "feat: add B"

# 同時 main 也有新 commit
git checkout master
echo "main update" > other.txt && git add . && git commit -m "chore: main update"
```

此時的 commit graph 長這樣:

```text
* f3a2b1c (master) chore: main update
| * d4e5f6a (feature) feat: add B
| * a1b2c3d feat: add A
|/
* 0e1f2a3 init
```

兩條分支從 `init` 分岔,各自有新的 commit。

## 方案 A:使用 git merge

切到 feature,把 master 合併進來:

```sh
git checkout feature
git merge master
```

Git 會產生一個 merge commit,把兩條分支的歷史合在一起:

```text
*   c5d6e7f (feature) Merge branch 'master' into feature
|\
| * f3a2b1c (master) chore: main update
* | d4e5f6a feat: add B
* | a1b2c3d feat: add A
|/
* 0e1f2a3 init
```

重點觀察:

- 多了一個 merge commit(`c5d6e7f`),它有兩個 parent
- 原本的 commit hash **完全沒變**
- 歷史保留了分岔的形狀,你可以清楚看到哪些 commit 是在 feature 上寫的

Merge 的核心特性是**非破壞性**,它從不修改既有的 commit,只是多加一個節點把兩邊綁起來。

## 方案 B:使用 git rebase

回到乾淨狀態,改用 rebase:

```sh
git checkout feature
git rebase master
```

Rebase 會把 feature 上的 commit「搬家」到 master 的最新位置:

```text
* b8c9d0e (feature) feat: add B
* e5f6a7b feat: add A
* f3a2b1c (master) chore: main update
* 0e1f2a3 init
```

重點觀察:

- 歷史變成一條直線,沒有 merge commit
- feat: add A 和 feat: add B 的 **hash 被重寫了**(從 `a1b2c3d` 變成 `e5f6a7b`)
- 從 graph 上完全看不出來這些 commit 原本是在另一條分支上寫的

Rebase 的核心動作是把 commit 拆成 patch、回退到新的起點、再一個一個重新套用。這也是為什麼 hash 會變 — 因為 parent commit 不同了,同樣的內容會產生不同的 SHA。

## 兩者的關鍵差異

| 比較項目            | git merge               | git rebase                 |
| ------------------- | ----------------------- | -------------------------- |
| 產生 commit         | 新的 merge commit       | 不產生 merge commit        |
| Commit hash         | 不變                    | 被重寫                     |
| 歷史形狀            | 保留分岔,真實的開發軌跡 | 變成線性,乾淨好讀          |
| 衝突處理            | 一次解決所有衝突        | 每個 commit 可能都要解一次 |
| 對已 push 的 branch | 安全                    | **危險**(需 force push)    |
| 可回溯性            | 原始 commit 都還在      | 原本的 commit 已被取代     |

兩個欄位裡最需要注意的是最後兩項。Rebase 重寫歷史這件事在單人開發時沒差,但一旦 branch 已經 push 出去、別人 pull 過了,force push 會讓同事的本地分支錯亂。這是所謂 **Golden Rule of Rebase**:不要對公開分支做 rebase。

## 衝突處理的差別

衝突處理的體感差異很大,這點實際跑過才有感覺。假設 feature branch 有 5 個 commit,每個都動到同一個檔案:

**Merge 的流程:**

```text
1. 開始 merge → 列出所有衝突
2. 解完一次衝突
3. git commit 完成 merge
結束。一次搞定。
```

**Rebase 的流程:**

```text
1. 套用 commit 1 → 有衝突 → 解 → git rebase --continue
2. 套用 commit 2 → 有衝突 → 解 → git rebase --continue
3. 套用 commit 3 → 有衝突 → 解 → git rebase --continue
... 以此類推,每個 commit 都要解一次
```

看起來 rebase 比較累,但它有個優點:每一次解衝突的 context 比較小,你只需要判斷「這個 commit 要怎麼適配新的 base」,而不是一次面對五個 commit 的累積衝突。小步解決反而比較不容易改壞東西。

如果中途想放棄 rebase,還是救得回來:

```sh
git rebase --abort
```

這行指令會把你打回 rebase 開始前的狀態。

## 實務上我會怎麼選

這是純技術主題,所以直接講我自己的判斷邏輯。我的做法分成兩個層級:

**第一層:branch 是不是只有我在用?**

- 只有我在的 feature branch(還沒 push、或只有我自己 pull 過):**優先 rebase**,保持 commit 歷史乾淨
- 已經 push 且可能有別人在用的 branch:**一律 merge**,除非團隊有共識 force push

**第二層:要整合回 main 時怎麼做?**

實務上我會選擇這個組合 — 平常用 rebase 同步 feature,最後 merge 回 main。具體流程:

```sh
# 平常同步 main 的變動(feature 還沒 push)
git checkout feature
git fetch origin
git rebase origin/master

# 最後合併回 main 時,用 no-ff merge
git checkout master
git merge --no-ff feature
```

為什麼要 `--no-ff`?因為它會**強制產生 merge commit**,讓 main 的歷史上看得出「這裡是一個完整的 feature 被合進來」。少了這個 merge commit,fast-forward 之後的歷史看起來就跟一串零散的 commit 沒兩樣,要做功能層級的 revert 會很麻煩。

還有一個例外:**interactive rebase**(`git rebase -i`)我很常用,即使是只有幾個 commit 的小 branch。用途是把 "fix typo"、"fix typo again"、"wip" 這類垃圾 commit 壓成一個有意義的 commit,送 PR 前整理一次,Reviewer 會少罵你幾句。

```sh
git rebase -i HEAD~5
```

在互動介面裡把要合併的 commit 標成 `squash` 或 `fixup`,Git 會幫你合併並讓你編輯新的 commit message。

## 結語

Rebase 和 merge 不是二選一的宗教問題,是兩個不同的工具。記住三件事就夠了:

1. **私有 branch 用 rebase**,保持歷史乾淨
2. **公開 branch 用 merge**,避免改到別人的 commit
3. **整合回 main 用 `--no-ff` merge**,保留 feature 的邊界

剩下的細節,在你真的踩到一次把同事 branch 搞爛之後,就會記得很牢了。

[Git 官方文件 - Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)
[The Golden Rule of Rebase](https://www.atlassian.com/git/tutorials/merging-vs-rebasing)
