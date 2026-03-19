---
title: "隨手 Design Pattern (3) - 簡單工廠模式 (Simple Factory Pattern)"
description: "簡單工廠是相當易用的一種設計模式，當程式複雜度高的時候，可以利用此模式切割複雜度高的判斷式，抽離業務邏輯與建構式，讓業務邏輯單純"
date: 2019-08-21
category: "程式開發"
tags: ["Design Pattern", "Simple Factory Pattern", "CSharp"]
postSlug: "design-pattern-3-simple-factory-pattern"
---

>簡單工廠是相當易用的一種設計模式，當程式複雜度高的時候時候，可以利用此模式切割複雜度高的判斷式，抽離業務邏輯與建構式，讓業務邏輯單純，隔離複雜的建構式，有效提升程式碼的可讀性，藉由 C# 語法特性更可以降低程式複雜度。

### 定義

簡單工廠模式(Simple Factory Pattern)：又稱為靜態工廠方法(Static Factory Method)模式，它屬於類創建型模式。

### 角色

簡單工廠模式包含如下角色：

- Product：抽象產品角色
  抽象產品角色是所有產品的父類別，在 C# 來說可以是 `抽象類別 (Abstract Class)` 或者是 `介面 (Interface)`，公開屬性與方法簽章，外部程式依賴此角色。

- ConcreteProduct：具體產品角色
  具體產生的產品實體，藉由工廠角色依據條件而建立。

- Factory：工廠角色
  工廠角色負責建立對應的物件。

### UML 類別圖

![UML 類別圖](/images/blog/SimpleFactory.jpg "UML 類別圖")

### 實作說明

抽象產品角色 - 本次範例用 IBrid 介面來示範，公開 `Name` 屬性與 `Fly` 方法。

```cs
    public interface IBird
    {
        string Name { get; set; }

        void Fly();
    }
```

具體產品角色 - Eagle & Swan 兩種鳥類的具體實作

```cs
    public class Eagle : IBird
    {
        public string Name { get; set; } = "老鷹";

        public void Fly()
        {
            // 實作可以飛高空
        }
    }
```

```cs
    public class Swan : IBird
    {
        public string Name { get; set; } = "天鵝";

        public void Fly()
        {
            // 實作只能飛低空
        }
    }
```

工廠角色：使用 switch 實作

```cs
    public static class BirdFactory
    {
        public static IBird GetBird(string birdName)
        {
            switch (birdName)
            {
                case "Swan":
                    return new Swan();

                case "Eagle":
                    return new Eagle();

                default:
                    throw new Exception("missing matching bird name");
            }
        }
    }
```

```cs
        private static void Main(string[] args)
        {
            var eagle = BirdFactory.GetBird("Eagle");
            var swan = BirdFactory.GetBird("Swan");

            Console.WriteLine($"Bird Name : {eagle.Name}");
            Console.WriteLine($"Bird Name : {swan.Name}");
        }
```

藉由 `Bird Factory` 將 `switch` 判斷式抽離，`Main` 程式複雜度下降，這也就是簡單工廠帶來的效益，專注商業邏輯，抽離複雜的判斷式。但是其實這仍不夠好，隨著實作 `IBird` 的鳥類越來越來多，`BirdFactory` 裡的 `switch` 會越來越複雜，也就越來越難維護。

![BirdFactory程式複雜度](/images/blog/BirdFactory.png "BirdFactory程式複雜度")

> 這裡使用的是 CodeMaid 的 Spade 功能，有時間在另外做說明！

這裡在提供一個使用 `Linq` 語法取代 `switch` 語法的範例，可以有效地降低複雜度。

```cs
    public static class BirdFactoryWithLinq
    {
        private static readonly Dictionary<string, IBird> _birds;

        static BirdFactoryWithLinq()
        {
            _birds = new Dictionary<string, IBird>();
            _birds.Add("Eagle", new Eagle());
            _birds.Add("Swan", new Swan());
        }

        private static IBird GetBird(string birdName)
        {
            var bird = _birds
                .Where(x => x.Key.Equals(birdName))
                .Select(x => x.Value)
                .FirstOrDefault();

            return bird ?? throw new Exception("No match bird!");
        }
    }
```

![BirdFactoryWithLinq程式複雜度](/images/blog/BirdFactoryWithLinq.png "BirdFactoryWithLinq程式複雜度")

GetBird 的複雜度由 4 降為 1，是不是很完美。

### 結論

- 優點
  - 工廠封裝了各類別的建構式邏輯，客戶端不需要知道如何建構類別實體，可以直接操作公開的方法，做到實質的隔離，達成了職責分離。
  - 透過參數設定檔，可以實現不修改成客戶端程式碼的，而增加可以使用類別。
- 缺點
  - 使用簡單工廠模式將會增加系統中類別的數量，純理論來說增加了系統的複雜度和理解難度。
  - 有可能造成工廠邏輯過於複雜，不利於系統的擴展和維護。
  - 因使用靜態方法，所以工廠類別無法繼承。

總結優缺點，在情境式適合下，簡單工廠很容易的做到職責分離，搭配 `C#` Linq 更可以有效降低工廠的程式複雜度，是很值得使用的！

### 參考範例

[Github 範例下載連結](https://github.com/raychiutw/simple-factory-pattern-sample)
