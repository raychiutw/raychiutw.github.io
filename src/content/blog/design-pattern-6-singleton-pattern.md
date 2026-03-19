---
title: "隨手 Design Pattern (6) - 單例模式 (Singleton Pattern)"
description: "單例模式是軟件工程中最著名的模式之一。從本質上講，單例是一個只允許創建自身的單個實例的類，通常可以簡單地訪問該實例"
date: 2019-08-23
category: "程式開發"
tags: ["Design Pattern", "Singleton Pattern", "CSharp"]
postSlug: "design-pattern-6-singleton-pattern"
---

>單例模式是軟件工程中最著名的模式之一。從本質上講，單例是一個只允許創建自身的單個實例的類，通常可以簡單地訪問該實例。最常見的是，單例在創建實例時不允許指定任何參數 - 否則對實例的第二個請求但具有不同的參數可能會有問題！（如果對於具有相同參數的所有請求，應訪問相同的實例，則工廠模式更合適。）本文僅處理不需要參數的情況。通常，單例的要求是它們是懶惰地創建的 - 即在第一次需要之前不創建實例。

總結 Singleton 模式有兩個特點

- 單一實例 (Single Instance)
- 延遲建立實例 (Lazy Instantiation)

### C# 實作

在C＃中實現單例模式有各種不同的方法。從最常見的，不是執行緒安全的，以及完全延遲加載，安全，簡單且高性能的版本開始。

而有此共同特徵：

- 單個構造函數，它是私有且無參數的。這可以防止其他類實例化它（這將違反模式）。(C#來說類別必須 `sealed` ，且 建構式為 `private`)
- 一個靜態變量，用於保存對單個已創建實例的引用。(C# 來說需要一個 `public` 與 `statc` 的 )
- 公共靜態意味著獲取對單個創建實例的引用，必要時創建一個實例。(C# 來說類別需 `public` 與 `static`)

#### 非執行緒安全 Singleton

這是個不好的案例，此方式不是執行緒安全，無法確保在多執行緒情況下是唯一的實例。

```cs
    public sealed class NotThreadSafeSingleton
    {
        private static NotThreadSafeSingleton _instance = null;

        private NotThreadSafeSingleton()
        {
        }

        public static NotThreadSafeSingleton Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new NotThreadSafeSingleton();
                }

                return _instance;
            }
        }
    }
```

#### 簡單執行緒安全 Singleton

使用 Lock 來確保執行緒安全。

```cs
        private static readonly object padlock = new object();

        private static SimpleThreadSafetySingleton _instance = null;

        private SimpleThreadSafetySingleton()
        {
        }

        public static SimpleThreadSafetySingleton Instance
        {
            get
            {
                lock (padlock)
                {
                    if (_instance == null)
                    {
                        _instance = new SimpleThreadSafetySingleton();
                    }
                    return _instance;
                }
            }
        }
    }
```

#### 使用 Double-checked Locking 確保執行緒安全

使用 Double-checked Locking 確保執行緒安全。

```cs
    public sealed class DoubleCheckedLockingSingleton
    {
        private static readonly object padlock = new object();
        private static DoubleCheckedLockingSingleton _instance = null;

        //用來LOCK建立instance的程序。
        public static DoubleCheckedLockingSingleton Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (padlock)
                    {
                        if (_instance == null)
                        {
                            _instance = new DoubleCheckedLockingSingleton();
                        }
                    }
                }

                return _instance;
            }
        }
    }
```

#### 不使用 Lock, 確保執行緒安全 (非 Lazy)

此範例沒有使用 Lock, 而仍是執行緒安全的 Singleton，但不是 Lazy。

```cs
    public sealed class EagerSingleton
    {
        private EagerSingleton()
        {
        }

        public static EagerSingleton Instance { get; } = new EagerSingleton();
    }
}
```

#### 完整 Lazy 實例

此範例達成了延遲建立。

```cs
    public sealed class LazySingleton
    {
        private LazySingleton()
        {
        }

        public static LazySingleton Instance
        {
            get
            {
                return InnerClass.Instance;
            }
        }

        private class InnerClass
        {
            internal static readonly LazySingleton Instance = new LazySingleton();

            static InnerClass()
            {
            }
        }
    }
```

#### 使用 .NET 4 的 Lazy&lt;T&gt;

此方式使用後 .Net Framework 4 之後提供的 Lazy&lt;T&gt;，如此可以簡單的達成 Singleton 要求的 `唯一` 與 `延遲建立`。

```cs
    public sealed class DotNet4LazySingleton
    {
        private static readonly Lazy<DotNet4LazySingleton> lazy = new Lazy<DotNet4LazySingleton>(() => new DotNet4LazySingleton());

        private DotNet4LazySingleton()
        {
        }

        public static DotNet4LazySingleton Instance { get { return lazy.Value; } }
    }
```

### 結語

除了第一個範例不建議之外，其餘的是可以依實際情況斟酌使用。

[程式碼範例](https://github.com/raychiutw/singleton-pattern)
