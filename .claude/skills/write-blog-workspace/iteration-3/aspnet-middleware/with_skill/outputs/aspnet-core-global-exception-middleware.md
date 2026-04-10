---
title: 'ASP.NET Core 用 Middleware 處理全域例外'
description: '在 ASP.NET Core 裡用 try/catch 滿天飛是反模式。這篇介紹如何透過自訂 Middleware 統一攔截未處理例外，回傳標準化 ProblemDetails 錯誤格式，並示範加上 TraceId、環境切換細節、RFC 7807 對接等實務做法。'
date: 2026-04-10
category: '程式開發'
tags: ['AI生成', 'ASP.NET Core', 'Middleware', 'Exception Handling', 'C#']
postSlug: 'aspnet-core-global-exception-middleware'
---

> 每個 Controller 都包一層 try/catch 是反模式 — ASP.NET Core 提供 Middleware pipeline，把例外處理集中在一個地方，Controller 只管業務邏輯。

## 為什麼需要全域例外處理

先看一個常見的壞味道：

```cs
[HttpGet("{id}")]
public async Task<IActionResult> GetUser(int id)
{
    try
    {
        var user = await _service.GetByIdAsync(id);
        return Ok(user);
    }
    catch (NotFoundException ex)
    {
        return NotFound(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Get user failed");
        return StatusCode(500, new { error = "Internal server error" });
    }
}
```

這段 code 有幾個問題：每個 action 都要重複寫一次、錯誤格式不統一、開發者很容易漏掉某一個 catch 就露出 stack trace 給前端。專案跑久了，光是「統一錯誤訊息格式」這件事就會變成技術債。

ASP.NET Core 的解法是把例外處理丟到 pipeline 最外層的 Middleware，所有未處理的例外都會被攔下來，Controller 可以放心丟 exception 不用擔心洩漏細節。

## Middleware 的執行順序

Middleware 是個洋蔥模型，request 從外往內走，response 從內往外回。處理例外的 middleware 必須放在最外層，才能攔到後面所有 middleware 和 controller 丟出來的例外。

```text
Request  →  [Exception Handler] → [Routing] → [Auth] → [Endpoint]
Response ←  [Exception Handler] ← [Routing] ← [Auth] ← [Endpoint]
```

如果把例外處理放在 Routing 之後，那麼 Routing 階段發生的錯誤就攔不到了。這是新手常踩的坑。

## 撰寫自訂 Exception Middleware

自訂 Middleware 有兩種寫法：實作 `IMiddleware` 介面，或用 convention-based 的類別。實務上我自己比較偏好 convention-based，因為可以直接在 constructor 注入 singleton 的依賴，少寫一層設定。

```cs
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
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
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);

        var (status, title) = ex switch
        {
            NotFoundException    => (StatusCodes.Status404NotFound, "Resource not found"),
            ValidationException  => (StatusCodes.Status400BadRequest, "Validation failed"),
            UnauthorizedException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            _                    => (StatusCodes.Status500InternalServerError, "Internal server error")
        };

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Type = $"https://httpstatuses.io/{status}",
            Instance = context.Request.Path,
            Detail = _env.IsDevelopment() ? ex.ToString() : "請聯繫系統管理員"
        };

        problem.Extensions["traceId"] = context.TraceIdentifier;

        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(problem);
    }
}
```

幾個設計重點：

- **Switch expression 做例外分派** — 把不同的 exception type 對應到不同的 HTTP status code，比多層 if/else 清爽
- **ProblemDetails** — 這是 RFC 7807 定義的標準錯誤格式，ASP.NET Core 內建支援，前端可以統一解析
- **環境切換細節** — Development 環境才回傳 `ex.ToString()`，production 只給使用者友善訊息，避免洩漏內部資訊
- **TraceId** — 把 `context.TraceIdentifier` 放到 response 裡面，使用者回報問題時可以對應到後端 log

## 註冊 Middleware

寫好 Middleware 類別後要在 `Program.cs` 註冊，這裡順序非常關鍵：

```cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddProblemDetails();

var app = builder.Build();

// 務必放在最前面，才能攔到後面所有 middleware 的例外
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

註冊順序錯了就白寫了。我看過同事把 `UseMiddleware<GlobalExceptionMiddleware>()` 放在 `UseAuthorization()` 後面，結果授權階段丟出的例外完全沒被攔到，直接跳 ASP.NET Core 預設的錯誤頁面。

## 自訂例外類別

上面 switch 用到的 `NotFoundException` 這些是自訂的例外類別，建議按照業務語意分類，不要混用 `InvalidOperationException` 這種過於模糊的例外：

```cs
public class NotFoundException : Exception
{
    public NotFoundException(string resource, object key)
        : base($"{resource} with key {key} was not found") { }
}

public class ValidationException : Exception
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationException(IReadOnlyDictionary<string, string[]> errors)
        : base("One or more validation errors occurred")
    {
        Errors = errors;
    }
}
```

`ValidationException` 特別帶一個 `Errors` 屬性，可以在 Middleware 裡面把驗證細節塞進 `ProblemDetails.Extensions` 回給前端：

```cs
if (ex is ValidationException validationEx)
{
    problem.Extensions["errors"] = validationEx.Errors;
}
```

## 簡化 Controller

有了 Middleware 之後，原本那段難看的 Controller 可以瘦身成這樣：

```cs
[HttpGet("{id}")]
public async Task<IActionResult> GetUser(int id)
{
    var user = await _service.GetByIdAsync(id)
        ?? throw new NotFoundException("User", id);
    return Ok(user);
}
```

Controller 恢復乾淨，只負責描述「這個 endpoint 做什麼」，不用處理錯誤格式、log、status code mapping 這些橫切關注點。

## 內建的 IExceptionHandler（.NET 8+）

從 .NET 8 開始，ASP.NET Core 新增了 `IExceptionHandler` 介面和 `UseExceptionHandler()` extension，某種程度上是自訂 Middleware 的官方版本。實務上我會這樣選：

- **舊專案或需要完全掌控 pipeline** — 繼續用自訂 Middleware，程式碼看得一清二楚
- **新專案或 .NET 8+ 綠地開發** — 改用 `IExceptionHandler`，設定更少、與 DI 整合更好

`IExceptionHandler` 的寫法差別在於它是註冊成 service，然後靠 `UseExceptionHandler` 統一接管：

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
        _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);

        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Internal server error",
            Detail = exception.Message
        };

        httpContext.Response.StatusCode = problem.Status.Value;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
```

註冊方式：

```cs
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ...

app.UseExceptionHandler();
```

兩種寫法都可以動，沒有絕對的對錯 — 關鍵是團隊統一，不要一個專案混兩種寫法。

## 實務上還要注意的細節

幾個在 production 會咬人的點：

- **ProblemDetails 的 Detail 欄位要過濾** — 直接塞 `ex.ToString()` 會把整個 stack trace 連同內部變數名丟給前端，只在 Development 環境開就好
- **Log 等級要分清楚** — 4xx 的客戶端錯誤用 `LogWarning`，5xx 的系統錯誤才用 `LogError`，否則告警系統會被驗證錯誤洗版
- **`OperationCanceledException` 要特別處理** — request 被使用者 cancel 也會走到這裡，但那不是錯誤，通常回 499 或直接 swallow 就好
- **Middleware 裡面不要再 throw exception** — 如果 `WriteAsJsonAsync` 本身噴錯，會變成雙重例外，最後丟出 `InvalidOperationException: The response has already started`

## 結語

全域例外處理不是 ASP.NET Core 的附加功能，而是每個正式專案都該有的基礎建設。Middleware 做得好，Controller 就能保持乾淨，錯誤格式統一後前後端對接也會順很多。

選 Middleware 還是 `IExceptionHandler` 其實沒那麼重要，重要的是團隊約定一套、到處套用。我自己的做法是新專案一律走 `IExceptionHandler` + `ProblemDetails`，舊專案維持原本的 Middleware 版本，避免為了換寫法而引入新的 bug。

[ASP.NET Core Middleware 官方文件](https://learn.microsoft.com/aspnet/core/fundamentals/middleware)
[RFC 7807 Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
