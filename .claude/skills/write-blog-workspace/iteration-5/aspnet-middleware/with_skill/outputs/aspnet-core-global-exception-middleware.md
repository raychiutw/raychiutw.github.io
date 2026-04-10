---
title: '用 Middleware 處理 ASP.NET Core 全域例外的三種做法'
description: '每個 Controller 都寫 try-catch 寫到煩？本篇整理 ASP.NET Core 三種全域例外處理做法：自刻 Middleware、UseExceptionHandler Lambda 與 .NET 8 的 IExceptionHandler，附上 ProblemDetails 範例與取捨建議。'
date: 2026-04-09
category: '程式開發'
tags: ['AI生成', 'ASP.NET Core', 'Middleware', 'Exception Handling', 'CSharp']
postSlug: 'aspnet-core-global-exception-middleware'
---

> ASP.NET Core 的例外處理有好幾種寫法，我自己踩了幾輪後的結論是 — .NET 8 之後優先用 `IExceptionHandler`，舊專案補救用 `UseExceptionHandler` lambda，自刻 Middleware 則留給有特殊需求的情境。

前陣子接手一個 ASP.NET Core 的舊專案，打開 Controller 看到第一件事就是每個 Action 都包著一層 try-catch，格式還不統一 — 有的回 400、有的回 500、有的直接把 `ex.Message` 當作 JSON 吐回去。光是處理例外的程式碼就佔了一半的篇幅，而且同樣的 `catch` 寫了十幾次。

這是典型可以用全域例外處理解掉的問題。這篇文章我會從最笨的做法開始，一路講到 .NET 8 之後建議的做法，並說明什麼情境下我會選哪一種。

## 反面教材：到處都是 try-catch

先來看看我最想刪掉的寫法：

```cs
[HttpGet("{id}")]
public IActionResult GetUser(int id)
{
    try
    {
        var user = _userService.Get(id);
        if (user == null)
        {
            return NotFound(new { message = "找不到使用者" });
        }
        return Ok(user);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "取得使用者失敗");
        return StatusCode(500, new { message = "伺服器錯誤", detail = ex.Message });
    }
}
```

每個 Action 都這樣寫會有幾個問題。第一，程式碼重複率超高。第二，回應格式由每個開發者自由發揮，前端要適配十幾種錯誤格式。第三，`ex.Message` 直接丟給 client — 連 stack trace 和 SQL 錯誤訊息都會漏出去，這是安全漏洞。

Controller 應該專注在「正常流程」，例外處理是 infrastructure 層的事，不該混在一起。

## 做法一：自刻 Exception Handling Middleware

最經典的做法是自己寫一支 Middleware，放在 pipeline 最外層接住所有未處理的例外。

```cs
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "未處理的例外：{Path}", context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var (status, title) = ex switch
        {
            ArgumentException => (StatusCodes.Status400BadRequest, "參數錯誤"),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "找不到資源"),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "未授權"),
            _ => (StatusCodes.Status500InternalServerError, "伺服器錯誤")
        };

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = ex.Message, // production 環境記得拿掉
            Instance = context.Request.Path
        };

        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";
        return context.Response.WriteAsJsonAsync(problem);
    }
}
```

註冊到 pipeline 最前面：

```cs
var app = builder.Build();

// 一定要放在其他 middleware 之前，否則後面的例外接不到
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthorization();
app.MapControllers();
app.Run();
```

這個做法的優點是「完全可控」— 你想怎麼處理回應、要不要記什麼 log、要不要呼叫外部錯誤通知系統，全部自己決定。缺點是這支 Middleware 會一路跟著專案老化，當團隊裡有人開始塞奇怪的分支邏輯進去，它就會變成一坨人人害怕的 code。

用 `switch` 表達式做 exception 對映是我個人的偏好 — 比連續的 `if-else` 乾淨很多，也不會忘記 default case。

## 做法二：UseExceptionHandler 加 Lambda

如果你不想自刻 Middleware，ASP.NET Core 其實內建了一支 `UseExceptionHandler`，接一個 lambda 就能用：

```cs
var app = builder.Build();

app.UseExceptionHandler(appError =>
{
    appError.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        if (feature == null) return;

        var ex = feature.Error;
        var logger = context.RequestServices
            .GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "未處理的例外：{Path}", context.Request.Path);

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = 500,
            Title = "伺服器錯誤",
            Instance = context.Request.Path
        });
    });
});
```

這種寫法的好處是不用額外建檔案，所有設定都集中在 `Program.cs`。缺點是如果邏輯一多，`Program.cs` 會膨脹得很快。我自己的判斷是 — 如果例外處理超過 30 行，就該抽成獨立檔案了。

另一個隱藏的坑：`IExceptionHandlerFeature` 有可能是 `null`（雖然機率很低），千萬記得加 null check，否則 Middleware 自己也會丟例外，就真的笑不出來了。

## 做法三：IExceptionHandler 介面（.NET 8+ 推薦）

.NET 8 開始引入了 `IExceptionHandler` 介面，這是目前官方推薦的寫法。它的核心概念是把「不同類型的例外處理」拆成多個小的 handler，每個 handler 專注在一種例外類型。

```cs
public class NotFoundExceptionHandler : IExceptionHandler
{
    private readonly ILogger<NotFoundExceptionHandler> _logger;

    public NotFoundExceptionHandler(ILogger<NotFoundExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not KeyNotFoundException)
        {
            return false; // 交給下一個 handler 處理
        }

        _logger.LogWarning(exception, "資源找不到：{Path}", httpContext.Request.Path);

        httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = 404,
            Title = "找不到資源",
            Detail = exception.Message,
            Instance = httpContext.Request.Path
        }, cancellationToken);

        return true; // 告訴 pipeline 這個例外我處理完了
    }
}
```

再寫一個 fallback handler 接住所有沒被處理到的例外：

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
        _logger.LogError(exception, "未預期的例外：{Path}", httpContext.Request.Path);

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = 500,
            Title = "伺服器錯誤",
            Instance = httpContext.Request.Path
        }, cancellationToken);

        return true;
    }
}
```

最後在 `Program.cs` 註冊：

```cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddExceptionHandler<NotFoundExceptionHandler>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler();
app.MapControllers();
app.Run();
```

幾個要注意的點：

- handler 的執行順序跟註冊順序一致，最通用的 fallback 要放最後
- `TryHandleAsync` 回傳 `false` 代表「我不處理，交給下一個」
- 所有 handler 都回 `false` 時，會 fallback 到預設行為，等於沒寫
- `IExceptionHandler` 的生命週期是 Singleton，不要在裡面塞 Scoped 的依賴

這個設計最大的好處是 — 每個 handler 都是單一職責，要加新的例外類型時直接新增一個檔案，不會動到舊程式碼。開閉原則在這裡被實踐得很漂亮。

## 三種做法怎麼選？

| 做法                       | 適用情境                                 | 我的取捨                 |
| -------------------------- | ---------------------------------------- | ------------------------ |
| 自刻 Middleware            | 需要完全自訂流程、整合特殊的錯誤通知系統 | 舊專案補救或特殊需求才用 |
| UseExceptionHandler Lambda | 專案小、只需要統一錯誤格式               | 快速原型或 PoC           |
| IExceptionHandler          | .NET 8+ 的新專案、例外類型會持續增加     | 新專案首選               |

簡單講，如果是新開的 .NET 8 專案，我不會再自己寫 Middleware 了，`IExceptionHandler` 搭配 `ProblemDetails` 幾乎能涵蓋九成需求。如果是舊專案卡在 .NET 6 或更早，則用 `UseExceptionHandler` lambda 就好，不用為了「現代化」硬升級。

## 幾個容易被忽略的細節

寫全域例外處理的時候，我踩過的幾個坑：

**不要把 `ex.Message` 原封不動丟給 client。** 尤其是 `DbUpdateException`、`SqlException` 這類的，裡面可能包含資料表名稱、SQL 片段、甚至連線字串的線索。production 只回一個通用訊息就好，詳細資訊寫進 log。

**Middleware 一定要註冊在 pipeline 最前面。** 我見過有人把 `UseExceptionHandler` 放在 `UseAuthorization` 後面，結果 auth 相關的例外根本接不到。順序錯了等於沒寫。

**Log 記得帶 TraceId。** 當 client 回報「網站壞了」，你需要一個方法在 log 裡快速定位。`HttpContext.TraceIdentifier` 可以加進 `ProblemDetails.Extensions`，client 拿到 trace id 回報給你，你就能立刻找到對應的 log。

## 結語

例外處理這件事看起來很無聊，但它是我評估一個 ASP.NET Core 專案健康度的第一個指標 — 如果 Controller 裡還看得到一堆 try-catch，基本上這個專案在其他層面也不會好到哪去。

把例外處理抽到 Middleware 層，不只是 clean code 的儀式感，而是讓 Controller 回歸它本來的樣子：一個只負責「接收請求、呼叫服務、回傳結果」的薄層。至於錯了要怎麼辦，那是基礎設施的事。

## 參考連結

- [Handle errors in ASP.NET Core](https://learn.microsoft.com/aspnet/core/fundamentals/error-handling)
- [Handle errors in ASP.NET Core APIs](https://learn.microsoft.com/aspnet/core/fundamentals/error-handling-api)
- [IExceptionHandler Interface](https://learn.microsoft.com/dotnet/api/microsoft.aspnetcore.diagnostics.iexceptionhandler)
