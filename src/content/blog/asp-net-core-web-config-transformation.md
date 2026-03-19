---
title: 'ASP.NET Core 啟用 Web.config Transformation'
description: '.Net Framework 4.0 提供了 Transformation 功能，讓 Web.Config 與 app.Config 可以依據組態設定建置不同的參數，這項好用的功能在 .Net Core 的專案中已無法作用，本文紀錄如何再次啟用這好用的功能'
date: 2018-05-02
category: '程式開發'
tags: ['ASP.NET Core', 'Transformation']
postSlug: 'asp-net-core-web-config-transformation'
---

> .Net Framework 4.0 提供了 Transformation 功能，讓 Web.Config 與 app.Config 可以依據組態設定建置不同的參數，這項好用的功能在 .Net Core 的專案中已無法作用，本文紀錄如何再次啟用這好用的功能。

<!--more-->

#### 情境說明

ASP.NET Core 2.0 是靠 application.json 來取代 web.config，但有時候我們仍需要在 web.config 作一些環境參數切換，甚至有些第三方套件仍是倚賴 XML 做設定 (ex: Nlog.xml)，以下步驟將說明如何讓 ASP.NET Core 2.0 重新啟用 Transformation

#### 環境說明

- Visual Studio 2017
- ASP.Net Core 2.0

#### 加入 web.config 設定

ASP.Net Core 範本專案沒有 web.config, 我們先手動新增並輸入以下設定。

```xml
  <system.webServer>
    <aspNetCore processPath="%LAUNCHER_PATH%" arguments="%LAUNCHER_ARGS%" stdoutLogEnabled="false" stdoutLogFile=".\logs\stdout">
      <environmentVariables>
        <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Development" />
      </environmentVariables>
    </aspNetCore>
  </system.webServer>
```

再新增 web.release.config

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
  <system.webServer>
    <aspNetCore>
      <environmentVariables>
        <environmentVariable name="ASPNETCORE_ENVIRONMENT" xdt:Transform="Remove" xdt:Locator="Match(name)" />
      </environmentVariables>
    </aspNetCore>
  </system.webServer>
</configuration>
```

在 web.config 中指定了環境變數為 Development，而 web.release.config 則在 release 組態建置時 將其移除，如此便達成了 Debug 組態時專案使用 application.development.json，Realese 組態使用 applictaion.json。

#### 編輯 csproj

接下來我們直接編輯 csproj，加入以下設定。

```xml
  <ItemGroup>
    <DotNetCliToolReference Include="Microsoft.DotNet.Xdt.Tools" Version="2.0.0" />
    ... 其他套件參考 ...
  </ItemGroup>
```

> 請直接編輯 csproj，請勿使用 Nuget Manager 安裝。

在 `</project>` 之前請輸入以下設定

```xml
  <Target Name="ApplyXdtConfigTransform" BeforeTargets="_TransformWebConfig">
    <PropertyGroup>
      <_SourceWebConfig>$(MSBuildThisFileDirectory)Web.config</_SourceWebConfig>
      <_XdtTransform>$(MSBuildThisFileDirectory)Web.$(Configuration).config</_XdtTransform>
      <_TargetWebConfig>$(PublishDir)Web.config</_TargetWebConfig>
    </PropertyGroup>
    <Exec
        Command="dotnet transform-xdt --xml &quot;$(_SourceWebConfig)&quot; --transform &quot;$(_XdtTransform)&quot; --output &quot;$(_TargetWebConfig)&quot;"
        Condition="Exists('$(_XdtTransform)')" />
  </Target>
```

主要的執行主體在 `<Exec />` 區段，執行的時機設定在 `BeforeTargets="_TransformWebConfig"`

完整參數說明如下

```sh
.NET Core XML Document Transformation
Usage: dotnet transform-xdt [options]
Options:
  -?|-h|--help    Show help information
  --xml|-x        The path to the XML file to transform
  --transform|-t  The path to the XDT transform file to apply
  --output|-o     The path where the output (transformed) file will be written
  --verbose|-v    Print verbose messages
```

#### 發行專案

接下來就來測試吧，發行 Debug 組態 與 Release 組態各建置一次， web.config 應如下方有正確的切換了。

Debug

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <!-- To customize the asp.net core module uncomment and edit the following section.
  For more info see https://go.microsoft.com/fwlink/?linkid=838655 -->
  <system.webServer>
    <handlers>
      <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModule" resourceType="Unspecified" />
    </handlers>
    <aspNetCore processPath="dotnet" arguments=".\Transformation.dll" stdoutLogEnabled="false" stdoutLogFile=".\logs\stdout">
      <environmentVariables>
        <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Development" />
      </environmentVariables>
    </aspNetCore>
  </system.webServer>
</configuration>
<!--ProjectGuid: f0574043-a304-4eec-9e63-e3ef5d3184cd-->
```

Release

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <!-- To customize the asp.net core module uncomment and edit the following section.
  For more info see https://go.microsoft.com/fwlink/?linkid=838655 -->
  <system.webServer>
    <handlers>
      <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModule" resourceType="Unspecified" />
    </handlers>
    <aspNetCore processPath="dotnet" arguments=".\Transformation.dll" stdoutLogEnabled="false" stdoutLogFile=".\logs\stdout">
      <environmentVariables></environmentVariables>
    </aspNetCore>
  </system.webServer>
</configuration>
<!--ProjectGuid: f0574043-a304-4eec-9e63-e3ef5d3184cd-->
```

#### 結論與補充

1. 若是 ASP.NET Core 1.x 請參考 [點我](https://github.com/nil4/dotnet-transform-xdt#project-json)
2. 範例只示範了 remove ，相關 XDT 語法請參考 [MDSN XDT Reference](https://msdn.microsoft.com/en-us/library/dd465326.aspx)
3. 不同的 XML 皆可以用類似的設定做 Transformation

#### 程式碼範例

[sample code](https://github.com/raychiutw/asp-net-core-transformation)

#### 參考資料

[https://github.com/nil4/dotnet-transform-xdt](https://github.com/nil4/dotnet-transform-xdt)
