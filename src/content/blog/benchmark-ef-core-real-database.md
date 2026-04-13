---
title: '用 BenchmarkDotNet 連真實資料庫驗證 EF Core 查詢效能'
description: 'InMemory EF Core benchmark 不走 SQL，數字漂亮卻沒參考價值。改連真實 UAT 資料庫：用 CryptoHelper 解密加密連線字串、繞過 DisableOptimizationsValidator 驗證、GlobalSetup 加健康檢查，最後用信賴區間判讀 +3.3% 差異是否顯著。'
date: 2026-04-13
category: '程式開發'
tags: ['AI生成', 'BenchmarkDotNet', 'EF Core', '.NET', 'Performance']
postSlug: 'benchmark-ef-core-real-database'
---

> BenchmarkDotNet 連 InMemory provider 跑出來的數字根本不可信。這篇記錄我怎麼改連真實 UAT 資料庫、踩了哪些坑、以及怎麼用統計顯著性判讀結果。

我在做一個 GraphQL 查詢優化，要在既有查詢裡加兩個 subquery 去撈「通知訂閱狀態」。擔心效能會被拖垮，決定跑 BenchmarkDotNet 來量化差異。第一次直覺反應是用 EF Core InMemory provider — 快、不需要基礎建設、CI 友好。但跑完之後回頭想，這個結果根本沒有意義。

## 為什麼 InMemory Benchmark 不可信

InMemory provider 的存在意義是跑 unit test，不是模擬真實資料庫行為。它有幾個關鍵差異：

- **LINQ 不會編譯成 SQL**：InMemory 直接在記憶體裡做 LINQ 查詢，跳過 SQL 生成、query planner、JOIN 策略
- **沒有索引選擇**：SQL Server 根據統計資訊決定用哪個索引，InMemory 完全不管這件事
- **沒有網路延遲**：真實 DB 有連線成本、查詢封包往返，InMemory 全在 process 內

LINQ 能在 InMemory 快速跑過，不代表在 SQL Server 上跑起來一樣。我加了兩個 subquery，其實想驗證的是 SQL Server 的執行計畫會怎麼處理 — 用 InMemory 根本量不到這件事。

結論很簡單：**InMemory benchmark 只能測試應用層邏輯，不能測資料庫效能。**

## 改連真實 UAT 資料庫

決定改連真實 UAT 環境。這裡有幾個實務問題要處理。

### 加密連線字串的解密

連線字串放在 `appsettings.UAT.json`，是加密過的，不能直接貼明碼到環境變數或 hardcode 進程式碼。

服務本身已有一個 `CryptoHelper` 做對稱加密解密，用相同的解密流程在 `[GlobalSetup]` 裡處理 — 這樣和正式部署走的是同一套路，不需要另外搭基礎建設。

```cs
[GlobalSetup]
public async Task Setup()
{
    var config = new ConfigurationBuilder()
        .AddJsonFile("appsettings.UAT.json")
        .Build();

    var encryptedConnStr = config.GetConnectionString("Default");
    var connStr = CryptoHelper.Decrypt(encryptedConnStr);

    var options = new DbContextOptionsBuilder<AppDbContext>()
        .UseSqlServer(connStr)
        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)
        .Options;

    _dbContext = new AppDbContext(options);

    // 健康檢查：確認測試資料存在
    var testMember = await _dbContext.Members
        .FirstOrDefaultAsync(m => m.Id == TestMemberId);

    if (testMember == null)
        throw new InvalidOperationException(
            $"測試會員 {TestMemberId} 不存在，請確認 UAT 資料庫的測試資料");
}
```

`UseQueryTrackingBehavior(NoTracking)` 是一道額外的安全網。我們的查詢本來就是 read-only，但多加這一行，萬一有人不小心在 benchmark 裡塞了 `SaveChanges()`，也不會真的寫進 UAT 資料庫。

### 選測試資料

要找「最能代表真實負載」的測試會員。我另外寫了個小工具 QueryTool 連 UAT 查詢，QueryTool 只允許 `SELECT` / `WITH` 開頭的語句（用 prefix 檢查擋掉 `DELETE`、`UPDATE`、`DROP`），讓我可以在 UAT 上安全跑任意查詢，不用開 SSMS。

查下來找到一個綁了 40 台車的會員 — 這是資料庫裡關聯數量最多的案例，最能代表最壞情況的負載。

### GlobalSetup 加健康檢查的原因

第一次跑的時候，`[GlobalSetup]` 裡的 `SaveChanges()` 拋了這個錯誤：

```text
Microsoft.EntityFrameworkCore.DbUpdateException: Required properties '{MgmCode}' are missing for the instance of entity type 'Member'.
```

BenchmarkDotNet 不會把 GlobalSetup 的例外好好 bubble 上來，只顯示「benchmark failed」。真正的 stack trace 藏在 log 檔案裡，要翻才找得到。

**學到的防守方式：** 在 `[GlobalSetup]` 開頭明確 assert 測試資料存在，找不到就直接 `throw`，而不是讓 EF Core 拋那種難讀的 `Required properties missing` 錯誤。這樣失敗時訊息清楚，也不用翻 log 才知道問題在哪。

## DisableOptimizationsValidator 的坑

設定好 DbContext 之後，第一次執行就爆了：

```text
Assembly 'InternalPackage, Version=1.0.0.0' which defines benchmarks
references non-optimized 'SomeCore, Version=2.0.0.0'.
```

BenchmarkDotNet 預設會驗證所有 referenced assembly 都是 Release（optimized）build。我的專案依賴的幾個內部套件是 Debug 版，直接過不了。

解法是建一個自訂的 `ManualConfig`：

```cs
public class BenchmarkConfig : ManualConfig
{
    public BenchmarkConfig()
    {
        AddJob(Job.Default);
        AddExporter(MarkdownExporter.Default);
        AddLogger(ConsoleLogger.Default);
        AddColumnProvider(DefaultColumnProviders.Instance);

        // 告訴 BenchmarkDotNet 跳過 Debug reference 的驗證
        WithOptions(ConfigOptions.DisableOptimizationsValidator);
    }
}

[Config(typeof(BenchmarkConfig))]
public class MemberQueryBenchmark
{
    // ...
}
```

`DisableOptimizationsValidator` 的語意是「我知道我在做什麼，跳過這個檢查」。在 CI 正式流程裡不應該這樣用，但本地驗證連真實 DB 這個場景完全合理。

## 怎麼判讀統計顯著性

跑出來的結果：

```text
| Method         |     Mean |    Error |  StdDev |
|--------------- |---------:|---------:|--------:|
| Original       | 241.3 ms | ±12.4 ms | 8.6 ms  |
| WithSubqueries | 249.4 ms | ±14.1 ms | 9.8 ms  |
```

Mean 差了 8.1 ms，相對差異 +3.3%。看起來新版慢了一點。但這樣能下結論嗎？

**不行。** 關鍵在 `Error` 欄位。BenchmarkDotNet 的 `Error` 是信賴區間半徑（通常是 99.9% CI）。

- Original 的範圍：241.3 ± 12.4 ms → 228.9 ms ~ 253.7 ms
- WithSubqueries 的範圍：249.4 ± 14.1 ms → 235.3 ms ~ 263.5 ms

這兩個區間重疊非常大。也就是說，我們**無法統計上確定** WithSubqueries 比 Original 慢 — 這個 8 ms 的差異，完全可能是量測噪音造成的。

**只看 Mean 下結論是常見誤判。** 如果兩組 error bar 有明顯重疊，不能宣稱 A 比 B 快或慢。必須要信賴區間不重疊（或至少重疊很少），差異才算統計上顯著。

我的判讀：+3.3% 的差異在可接受範圍內，統計上不顯著，兩個 subquery 可以上。

## 結語

InMemory benchmark 快速但沒有參考價值；連真實 DB 有成本但數字才有意義。整個流程下來有幾個可複用的 pattern：

- **CryptoHelper 在 GlobalSetup 解密**：和正式部署同一套邏輯，不需要額外基礎建設
- **NoTracking 做安全網**：即使查詢本來就是 read-only，明確設定防止意外寫入
- **GlobalSetup 加 assert**：讓失敗訊息清楚，而不是讓 EF Core 拋難讀的例外
- **DisableOptimizationsValidator**：本地驗證場景合理，CI 流程要謹慎使用
- **看 error bar，不只看 Mean**：信賴區間重疊才是判讀顯著性的正確方式

這套流程現在變成我做 EF Core 效能驗證的標準做法。QueryTool 也順便沉澱成日常查 UAT 資料的工具，省去開 SSMS 的麻煩。
