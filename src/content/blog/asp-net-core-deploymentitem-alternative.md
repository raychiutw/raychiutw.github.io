---
title: 'ASP.NET Core 無法使用 DeploymentItem 的替代方案'
description: '在 MSTest 中，若要在執行測試時能調用實體檔案，通常會用 DeploymentItem Attribute 來指定要同時部署的檔案，但屬性在 ASP.NET Core 中不再支援，本篇說明其他替代方案'
date: 2018-05-10
category: '程式開發'
tags: ['ASP.NET Core', 'MSTest', 'UnitTest', 'CSharp']
postSlug: 'asp-net-core-deploymentitem-alternative'
---

> 在 MSTest 中，若要在執行測試時能調用實體檔案，通常會用 DeploymentItem Attribute 來指定要同時部署的檔案，但屬性在 ASP.NET Core 中不再支援，本篇說明其他替代方案。

<!--more-->

#### 好用的 DeploymentItem

在寫測試時，我們常會用以下作法調用外部檔案。

```cs
using System.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace DeploymentItem.Tests
{
    [TestClass]
    public class UnitTestWithDeploymentItem
    {
        [TestMethod]
        [DeploymentItem("TestData\\Sample.csv")]
        public void TestMethod1()
        {
            var file = new StreamReader("Sample.csv");
            // test code ...
        }
    }
}
```

[完整使用說明](https://docs.microsoft.com/en-us/windows-hardware/drivers/taef/deploymentitem-metadata)

但在 ASP.NET Core 專案中使用 DeploymentItem 不會報錯，但測試執行後會找不到檔案（因為實際上沒有作用）！

#### 解決方式

其實沒有什麼替代方式，就是不要用了，在程式碼直接指定明確的路徑就好了。

```cs
using System.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace DeploymentItem.Tests
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void TestMethod1()
        {
            var file = new StreamReader("TestData\\Sample.csv");
            // test code ...
        }
    }
}
```

結案～

#### 範例程式連結

[https://github.com/raychiutw/asp-net-core-deploymentitem](https://github.com/raychiutw/asp-net-core-deploymentitem)
