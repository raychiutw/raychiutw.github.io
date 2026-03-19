---
title: "AutoMapper.Extensions.Microsoft.DependencyInjection - AddAutoMapper 已過時"
description: "AutoMapper.Extensions.Microsoft.DependencyInjection 簡單的讓 AutoMapper 註冊到 ASP.NET Core 中，但更版之後出現以 AddAutoMapper() 已過期的訊息"
date: 2019-08-07
category: "程式開發"
tags: ["ASP.NET Core", "AutoMapper", "CSharp", "Nuget Package"]
postSlug: "automapper-extensions-microsoft-dependencyinjection-addautomapper-obsolete"
---

> AutoMapper.Extensions.Microsoft.DependencyInjection 簡單的讓 AutoMapper 註冊到 ASP.NET Core 中，但更版之後出現以 AddAutoMapper() 已過期的訊息，紀錄一下新版的用法。

### 舊版用法

```cs
services.AddAutoMapper();
```

`AddAutoMapper()` 會掃描所有 assembliy 然後做兩件事：

1. 將實作 `IProfile` 的類別加入 mapping configuration
2. 將 value resolvers, member value resolvers, type converters 加入 container

### 更新套件後出現

```cs
ServiceCollectionExtensions.AddAutoMapper(IServiceCollection)' is obsolete
```

### 原因

新版本異動了參數簽章

改為傳入 assemblies

```cs
services.AddAutoMapper(assembly1, assembly2 /*, ...*/);
```

或傳入 types

```cs
services.AddAutoMapper(type1, type2 /*, ...*/);
```

### 解決方法

1. 不怕麻煩的一個個傳入
2. 改用以下寫法，仍然可以自動全部掃描

#### 單一專案：傳入 Starup.cs

```cs
services.AddAutoMapper(typeof(Startup));
```

#### 多個專案參考：傳入 所有 Assemblies

```cs
services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

```

### 參考連結

[https://github.com/AutoMapper/AutoMapper.Extensions.Microsoft.DependencyInjection/issues/105](https://github.com/AutoMapper/AutoMapper.Extensions.Microsoft.DependencyInjection/issues/105)
