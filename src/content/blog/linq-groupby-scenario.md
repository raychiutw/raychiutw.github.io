---
title: '用 LINQ 處理分群情境'
description: 'Language Integrated Query (LINQ) 是一組以直接將查詢功能整合至 C# 語言為基礎之技術的名稱。本文主要是示範如何簡潔的處理資料分群問題，一組數量不固定的數字集合想平均分配至30組中'
date: 2018-05-23
category: '程式開發'
tags: ['CSharp', 'LINQ']
postSlug: 'linq-groupby-scenario'
---

> Language Integrated Query (LINQ) 是一組以直接將查詢功能整合至 C# 語言為基礎之技術的名稱。LINQ 最明顯的「語言整合」部分就是查詢運算式。 查詢運算式是以宣告式「查詢語法」撰寫。 透過使用查詢語法，您就可以利用最少的程式碼，針對資料來源執行篩選、排序及分組作業。([參考來源](https://docs.microsoft.com/zh-tw/dotnet/csharp/linq/))

<!--more-->

LINQ的強大不是本文的重點，本文主要是示範如何簡潔的處理資料分群問題。

#### 情境說明

一組數量不固定的數字集合，想平均分配至30組中。

#### 土法煉鋼法

最簡單的方式可以用一個 for 迴圈快速解決，但這實在太不優雅了。

#### LINQ 解法

LINQ 可以很優雅地解決這個問題。

```cs
var ids = new List<int>()
{
    21, 33, 45, 21, 784, 24, 55, 68, 87,
    21, 33, 45, 21, 784, 24, 55, 68, 87,
    21, 33, 45, 21, 784, 24, 55, 68, 87,
    21, 33, 45, 21, 784, 24, 55, 68, 87,
    21, 33, 45, 21, 784, 24, 55, 68, 87,
    21, 33, 45, 21, 784, 24, 55, 68, 87,
    21, 33, 45, 21, 784, 24, 55, 68, 87,
    21, 33, 45, 21, 784, 24, 55, 68, 87,
    21, 33, 45, 21, 784, 24, 55, 68, 87,
};
var result = ids.Select((value, index) => new { PairNum = index % 30, value })
                .GroupBy(pair => pair.PairNum)
                .Select(grp => grp.Select(g => g.value).ToList())
                .ToList();
result.Dump();
```

#### 分群結果

![結果](/images/blog/linq-group.png)

#### 範例程式

[Github範例](https://github.com/raychiutw/linq-goruopby)
