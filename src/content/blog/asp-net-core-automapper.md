---
title: '在 ASP.NET Core 中使用 AutoMapper'
description: 'AutoMapper 是一個類別對應轉換的套件，在 ASP.NET Core 專案中的用法有有點差異，本篇說明適合 ASP.NET Core 的簡潔用法。安裝套件，加入 Startup.cs，建立 Profile，使用 IMapper'
date: 2018-05-17
category: '程式開發'
tags: ['ASP.NET Core', 'AutoMapper', 'CSharp', 'Nuget Package']
postSlug: 'asp-net-core-automapper'
---

> AutoMapper 是一個類別對應轉換的套件，在ASP.NET Core專案中的用法有有點差異，本篇說明適合ASP.NET Core 的簡潔用法。

<!--more-->

#### 安裝套件

```sh
Install-Package AutoMapper.Extensions.Microsoft.DependencyInjection
```

此套件是使用 ASP.Net Core 自帶的 DI Framework，讓 AutoMapper 使用上更簡潔優雅，此套件依賴了 AutoMapper，會自動安裝。

#### 加入 Startup.cs

```cs
public void ConfigureServices(IServiceCollection services)
{
	// 加入 AutoMapper
	services.AddAutoMapper();
	services.AddMvc();
}
```

ASP.Net Core 專案中要使用什麼東西皆是相同套路，在 ConfigureServices 中 AddAutoMapper 這個 Middleware。

#### 建立 Profile

```cs
public class UserProfie : Profile
{
	public UserProfie()
	{
		// 建立 Profile 對照定義
		CreateMap<UserResultModel, UserViewModel>();
	}
}
```

Profile 的重點在繼承 `Profile` 這個類別

#### 使用 IMapper

```cs
public class HomeController : Controller
{
	private IMapper _mapper;
	private IUserService _userService;

	public HomeController(IMapper mapper, IUserService userService)
	{
		this._mapper = mapper;
		this._userService = userService;
	}

	public IActionResult Index()
	{
		// 取得 user
		var user = this._userService.Get();

		// 將 user 置換成 ViewModel
		var userViewModel = _mapper.Map<IEnumerable<UserViewModel>>(user);

		ViewData["User"] = userViewModel;
		return View();
	}
}
```

只要透過建構式注入 IMapper，就可以透過 Map 這個方法 Mapper Profile 有定義到類別。

#### 結論

這樣的作法有什麼好處呢？

- 夠簡潔。使用 AddAutoMapper 方法，啟動 AutoMapper middleware，簡單明瞭。
- 低耦合。藉由繼承 Profile ，AutoMapper 自動取得所有定義 Profile，並將 IMapper 注入到需要的區塊中，降低程式碼對 AutoMapper 的耦合度。

簡單的一句話，Asp.Net Core 真叫人愛不釋手。

[參考範例](https://raychiutw.github.io/2018/%E5%9C%A8-ASP-NET-Core-%E4%B8%AD%E4%BD%BF%E7%94%A8-AutoMapper/)

#### 參考連結

- [Using Automapper In ASP.net Core](https://dotnetcoretutorials.com/2017/09/23/using-automapper-asp-net-core/)
- [AutoMapper Docs](http://docs.automapper.org/en/stable/index.html)
