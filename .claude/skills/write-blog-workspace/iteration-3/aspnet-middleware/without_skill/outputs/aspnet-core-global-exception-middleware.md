---
title: '在 ASP.NET Core 中使用 Middleware 處理全域例外'
description: '在 ASP.NET Core 專案中，例外處理如果散落在各 Controller 會難以維護，本篇帶你用自訂 Middleware 打造一套全域例外處理機制，搭配 ProblemDetails 回傳統一錯誤格式'
date: 2026-04-10
category: '程式開發'
tags: ['AI生成', 'ASP.NET Core', 'Middleware', 'Exception Handling', 'CSharp']
postSlug: 'aspnet-core-global-exception-middleware'
---

> 在 ASP.NET Core 專案中，例外處理如果散落在各 Controller 會難以維護。本篇帶你用自訂 Middleware 打造一套全域例外處理機制，搭配 ProblemDetails 回傳統一錯誤格式，讓 API 回應更一致、程式碼更乾淨。

## 為什麼要做全域例外處理？

寫過幾個 ASP.NET Core API 的人應該都有感，如果在每個 Action 裡都包一層 `try-catch`，不僅是重複勞動，還容易寫到手軟漏掉幾個。更糟的是，每個人回傳的錯誤格式可能還不一樣，前端同事接起來會罵人。

常見的痛點有幾個：

- **程式碼重複**：每個 Action 幾乎都寫一樣的 `try-catch`
- **錯誤格式不一致**：有的人回傳字串，有的人回 JSON，有的人連 status code 都亂開
- **敏感資訊外洩**：懶得處理就直接把 `ex.ToString()` 吐回去，stack trace 什麼的全都看得到
- **log 難追蹤**：沒有統一的記錄點，debug 時要在各處撈 log

解決方案就是用 Middleware 建立一個統一的「例外守門員」，讓所有未被處理的例外都會經過它，做完 log 和格式化後再回傳給前端。

## Middleware 在 Pipeline 中的角色

先簡單回顧一下 ASP.NET Core 的請求管線（Request Pipeline）。每個 HTTP 請求進來時，會依序經過註冊的 Middleware，每個 Middleware 都可以選擇：

1. 直接處理並回應
2. 呼叫 `next()` 把請求交給下一個 Middleware
3. 在下游處理完後，對 Response 做些加工

例外處理 Middleware 的關鍵就在於它要包住 `next()`，用 `try-catch` 捕捉後續 Middleware 或 Controller 丟出來的例外。所以它必須註冊在管線的最前面（或接近最前面），才能攔截到所有下游的錯誤。

```
Request → ExceptionHandlingMiddleware → Routing → Auth → Controller
                    ↑                                         |
                    └──── catch exception ────────────────────┘
```

## 方法一：自訂 Middleware 類別

這是最有彈性的做法，適合需要客製化錯誤處理邏輯的情境。

### 建立 Middleware 類別

先在 `Middleware` 資料夾下建立 `ExceptionHandlingMiddleware.cs`。

```cs
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "未處理的例外：{Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var (statusCode, title) = ex switch
        {
            ValidationException   => (StatusCodes.Status400BadRequest, "輸入資料驗證失敗"),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "尚未授權"),
            KeyNotFoundException  => (StatusCodes.Status404NotFound, "找不到資源"),
            _                     => (StatusCodes.Status500InternalServerError, "伺服器發生錯誤")
        };

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = _env.IsDevelopment() ? ex.Message : "請聯繫系統管理員",
            Instance = context.Request.Path
        };

        // 開發環境才回傳 stack trace，避免正式環境外洩
        if (_env.IsDevelopment())
        {
            problem.Extensions["stackTrace"] = ex.StackTrace;
            problem.Extensions["traceId"] = context.TraceIdentifier;
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(problem);
    }
}
```

幾個重點說明：

- **建構式注入**：`RequestDelegate next` 是固定要有的，其餘像 `ILogger`、`IHostEnvironment` 都是自由注入。
- **`switch` 表達式**：把不同例外類型對應到不同的 HTTP 狀態碼，程式碼簡潔易讀。
- **`ProblemDetails`**：這是 RFC 7807 定義的標準錯誤回應格式，ASP.NET Core 內建支援，推薦使用。
- **環境判斷**：正式環境不要吐 stack trace，這算是基本的資安守則。

### 註冊到管線

在 `Program.cs` 裡把它掛上管線，記得要擺在所有其他 Middleware 的前面。

```cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

var app = builder.Build();

// 例外處理要放最前面
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

為了讓註冊更好看，通常會再包一層擴充方法。

```cs
public static class MiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
        => app.UseMiddleware<ExceptionHandlingMiddleware>();
}

// 使用
app.UseGlobalExceptionHandling();
```

## 方法二：使用內建的 `UseExceptionHandler`

ASP.NET Core 其實有內建 `UseExceptionHandler`，輕量情境下可以直接用。

```cs
app.UseExceptionHandler(appBuilder =>
{
    appBuilder.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var ex = feature?.Error;

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = 500,
            Title = "伺服器發生錯誤",
            Detail = ex?.Message
        };

        await context.Response.WriteAsJsonAsync(problem);
    });
});
```

簡單好寫，但彈性比較低。如果你的邏輯不複雜，這個就夠了。

## 方法三：`IExceptionHandler`（.NET 8+ 推薦）

從 .NET 8 開始，官方推出了更優雅的 `IExceptionHandler` 介面，把例外處理獨立成服務，測試與維護都更輕鬆。

### 實作 `IExceptionHandler`

```cs
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "未處理的例外：{Message}", exception.Message);

        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "伺服器發生錯誤",
            Detail = exception.Message,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = problem.Status.Value;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);

        // 回傳 true 表示已處理，不再往下一個 handler 傳遞
        return true;
    }
}
```

### 註冊與使用

```cs
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler();
```

這種寫法有幾個明顯的優點：

- **責任鏈模式**：可以註冊多個 handler，依序嘗試處理（回傳 `false` 就交給下一個）
- **容易單元測試**：handler 是普通的 DI 服務，mock 起來很直覺
- **關注點分離**：例外處理邏輯從 Middleware 抽離，Middleware 只負責呼叫

如果專案是 .NET 8 以上，優先考慮這個作法。

## 實戰建議

最後分享幾個實務上的小心得：

1. **自訂例外類別**：針對業務邏輯錯誤（如 `BusinessRuleException`、`NotFoundException`），建立專屬的例外類別，方便在 Middleware 裡對應到 HTTP 狀態碼。
2. **串接結構化 log**：搭配 Serilog 或 Application Insights，在記錄例外時帶上 `traceId`、`userId`、`requestPath` 等欄位，後續查錯會感謝自己。
3. **區分「已知」與「未知」例外**：業務錯誤可以正常記為 Warning，未知例外才記為 Error，避免 alert 風暴。
4. **不要吞掉 `OperationCanceledException`**：client 中斷連線會丟這個，記錄成警告就好，不要當成 500 錯誤。
5. **測試涵蓋**：寫個 integration test，故意丟例外看看回應格式是不是預期的，這種守門員測試很值得。

## 小結

全域例外處理 Middleware 看起來只是個小東西，但它直接影響到 API 的穩定度與可維護性。三種做法我會這樣選：

| 方案                  | 適用情境                      |
| --------------------- | ----------------------------- |
| 自訂 Middleware 類別  | 需要高度客製化、.NET 6/7 專案 |
| `UseExceptionHandler` | 簡單情境、不想額外建檔        |
| `IExceptionHandler`   | .NET 8+，推薦首選             |

把例外處理統一化，Controller 就能專心做自己的事，程式碼乾淨又好維護，何樂而不為。

## 參考連結

- [ASP.NET Core Middleware 官方文件](https://learn.microsoft.com/aspnet/core/fundamentals/middleware/)
- [處理 ASP.NET Core 中的錯誤](https://learn.microsoft.com/aspnet/core/fundamentals/error-handling)
- [RFC 7807 - Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
