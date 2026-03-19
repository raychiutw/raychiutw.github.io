---
title: "ASP.Net Core DI 容器中 Service 生命週期"
description: "使用 DI 的時候，註冊服務的生命週期是個很重要的議題，用的好，節省記憶體。提升程式效率，用不好，則可能造成重大的異常錯誤"
date: 2019-08-22
category: "程式開發"
tags: ["ASP.NET Core", "DI", "IoC", "CSharp"]
postSlug: "asp-net-core-di-service-lifetime"
---

>使用 DI 的時候，註冊服務的生命週期是個很重要的議題，用的好，節省記憶體。提升程式效率，用不好，則可能造成重大的異常錯誤，本篇來簡單說明一下 ASP.NET Core 注入服務的三種生命週期。

### Service 生命週期

ASP.NET Core提供了一個內置的服務容器 `IServiceProvider` 負責管理服務的生命週期，從被依賴注入容器創建開始（就是將服務注入到你要使用的類的構造函數中），然後框架負責創建依賴關係的實例，並在不再需要時對其進行處理（就是說等我們調用完服務時，容器會自己去對注入的服務進行釋放）。

### 三種生命週期

查看微軟程式碼，ServiceLifetime 有三種列舉值。

```cs
// Microsoft.Extensions.DependencyInjection.ServiceLifetime
public  enum ServiceLifetime
{
    Singleton,
    Scoped,
    Transient
}
```

- Singleton 單一實例模式：
  單一實例對像對每個對象和每個請求都是相同的，不同客戶端不同請求都是相同的。

- Transient 暫時性模式：
  暫時性對象，無論是不是同一個請求（同一個請求裡的不同服務）同一個客戶端，每次都是創建新的實例。

- Scoped 作用域模式：
  作用域對像在一個客戶端請求中是相同的，但在多個客戶端請求中是不同的。

了解了生命周期的不同，要記得註冊服務時，要選擇適合的生命週期唷！
