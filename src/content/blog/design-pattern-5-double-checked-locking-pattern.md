---
title: "隨手 Design Pattern (5) - 雙重檢查鎖定模式 (Double-Checked Locking Pattern)"
description: "雙重檢查鎖定 (Double-Checked Locking Pattern) 是另外一個常用的設計模式，用來減少並發系統中競爭和同步的開銷，常用來避免快取在同一時間被重複建立"
date: 2019-08-23
category: "程式開發"
tags: ["Design Pattern", "Double-Checked Locking Pattern", "CSharp"]
postSlug: "design-pattern-5-double-checked-locking-pattern"
---

>雙重檢查鎖定 (Double-Checked Locking Pattern) 是另外一個常用的設計模式，用來減少並發系統中競爭和同步的開銷。雙重檢查鎖定模式首先驗證鎖定條件(第一次檢查)，只有通過鎖定條件驗證才真正的進行加鎖邏輯並再次驗證條件(第二次檢查)。常用來避免快取在同一時間被重複建立。

### 定義

我們先來看看來自 Wiki 的定義

>雙重檢查鎖定模式（也被稱為"雙重檢查加鎖優化"，"鎖暗示"（Lock hint）[1]) 是一種軟體設計模式用來減少並發系統中競爭和同步的開銷。雙重檢查鎖定模式首先驗證鎖定條件(第一次檢查)，只有通過鎖定條件驗證才真正的進行加鎖邏輯並再次驗證條件(第二次檢查)。
>該模式在某些語言在某些硬體平台的實現可能是不安全的。有的時候，這一模式被看做是反模式。
>它通常用於減少加鎖開銷，尤其是為多執行緒環境中的單例模式實現「惰性初始化」。惰性初始化的意思是直到第一次訪問時才初始化它的值。

### C# 實際範例

在一般的情境下，我最常使用在快取建立的情境，在快取要建立前，使用 Double-Checked Locking 防止快取的重複建立。

#### 使用快取範例

先來說明 ASP.NET Core 下如何使用快取，範例是使用 WebApi 專案範本。

Startup 註冊 MemoryCache

```cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // Register MemoryCache
        services.AddMemoryCache();

        services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
    }

    public void Configure(IApplicationBuilder app)
    {
        app.UseMvcWithDefaultRoute();
    }
}
```

再來 Contorller 以下設定

```cs
using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace DoubleCheckedLocking.WebApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        private IMemoryCache _cache;

        public ValuesController(IMemoryCache memoryCache)
        {
            this._cache = memoryCache;
        }

            // 取得快取值
            var cacheEntry = this._cache.Get<DateTime>("key");

            // 快取檢查
            if (this._cache.Get<DateTime>("key") == null)
            {
                // 無快取, 所以重新取值
                cacheEntry = DateTime.Now;

                // 設定快取過期時間
                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromSeconds(3));

                // 加入快取
                _cache.Set("key", cacheEntry, cacheEntryOptions);
            }

            return cacheEntry.ToString();
        }
    }
}
```

#### 會遇到的問題

當大量連線請求執行這段程式碼的時候，是有可能在極短暫時間下，快取不存在的鎖定判斷會被通過多次請求，而導致快取被重複建立，而當快取建立的成本很高的時候(比如說連接資料庫)，更可能造成後端的負載壓力，在筆者工作環境中，是個同時上線人數達 2000 人的大系統是，屢屢遇到快取鎖定失效導致資料庫負擔過重的案例，這時候 Double-Checked Locking 便派上用場，讓我們將快取的程式碼繼續導入 Double-Checked Locking。

```cs
        // GET api/values
        [HttpGet]
        public ActionResult<string> Get()
        {
            // 取得快取值
            var cacheEntry = this._cache.Get<DateTime>("key");

            // 第一次檢查
            if (cacheEntry == null)
            {
                // 鎖定
                lock (padlock)
                {
                    // 第二次檢查
                    if (this._cache.Get<DateTime>("key") == null)
                    {
                        // 無快取, 所以重新取值
                        cacheEntry = DateTime.Now;

                        // 設定快取過期時間
                        var cacheEntryOptions = new MemoryCacheEntryOptions()
                            .SetAbsoluteExpiration(TimeSpan.FromSeconds(3));

                        // 加入快取
                        _cache.Set("key", cacheEntry, cacheEntryOptions);
                    }
                }
            }

            return cacheEntry.ToString();
        }
    }
```

這裡要注意的是，第二次的檢查務必重新取得快取來判斷，若繼續沿用第一次檢查的變數，將會導致無效檢查。

### 結語

Double-Checked Locking 在快取情境下使用非常適合，另外一個適用情境是單例模式 (Singleton Pattern)，之後講到 Singleton 再說明囉。

[程式碼範例](https://github.com/raychiutw/double-checked-locking-pattern)
