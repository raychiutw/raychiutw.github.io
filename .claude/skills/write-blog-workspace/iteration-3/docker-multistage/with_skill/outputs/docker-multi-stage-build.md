---
title: 'Docker Multi-stage Build 實戰：用階段拆分打造瘦身 Image'
description: 'Docker multi-stage build 是打造輕量 image 的主要手段，透過多個 FROM 階段把 build tool 和最終執行環境分開。這篇從單階段踩坑講到多階段寫法，搭配 .NET 與 Node.js 範例，帶你一次掌握 image 瘦身的實務技巧。'
date: 2026-04-10
category: '程式開發'
tags: ['AI生成', 'Docker', 'DevOps', 'Dockerfile']
postSlug: 'docker-multi-stage-build'
---

> Multi-stage build 是 Docker 17.05 以後加入的功能，用多個 `FROM` 把建置環境和執行環境切開，讓最終 image 只留下執行時真正需要的東西。

## 為什麼需要 Multi-stage

把整包 source code、SDK、build tool、node_modules 全塞進一個 image，會得到一個又肥又慢的產物。以 .NET 為例，`mcr.microsoft.com/dotnet/sdk:8.0` 大約 800MB，但 runtime image `aspnet:8.0` 只有 200MB 左右。差距 600MB 的東西就是 compiler、NuGet cache、分析器、debugger 這些跑起來用不到的內容。

image 肥的代價不只是硬碟空間：

- Pull image 變慢，部署時間拉長
- 攻擊面變大，SDK 帶的工具都可能是弱點
- Layer cache 命中率降低，CI/CD 跑起來更慢

## 單階段的常見寫法（反面教材）

先看一個沒有拆階段的 Dockerfile。這是很多人剛接觸 Docker 時會寫出來的樣子。

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0
WORKDIR /app

COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

ENTRYPOINT ["dotnet", "/app/publish/MyApp.dll"]
```

build 起來會動，但 image 大小大概會在 900MB 上下。問題在於：SDK、source code、build artifact 通通留在最終 image 裡面。執行階段根本不需要 compiler，卻要背著它跑。

## Multi-stage 的寫法

Multi-stage 的核心概念很簡單：一個 Dockerfile 裡面寫多個 `FROM`，前面的階段負責 build，最後一個階段只負責 run。用 `COPY --from=<stage>` 把前一階段的產物抓過來。

```dockerfile
# Stage 1: 用 SDK image 做 build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 先 COPY csproj 做 restore，讓 layer 可以被 cache
COPY ["MyApp.csproj", "./"]
RUN dotnet restore

# 再 COPY source code 做 publish
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

# Stage 2: 用 runtime image 跑
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "MyApp.dll"]
```

幾個重點：

- `AS build` 給階段取名字，後面 `COPY --from=build` 才能引用
- csproj 和 source code 分兩次 COPY，是為了讓 restore layer 可以被 cache。只要 csproj 沒動，restore 就不會重跑
- 最後 stage 用 `aspnet:8.0` runtime image，SDK 完全留在 build 階段

build 出來的 image 大概 220MB，跟原本 900MB 比，瘦了差不多 75%。

## Node.js 的 Multi-stage 範例

前端專案也是 multi-stage 的重度使用場景。以 Vite + Node server 為例：

```dockerfile
# Stage 1: 裝依賴
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

# Stage 3: production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

這個寫法把 `deps`、`builder`、`runner` 三階段分開。注意 runner 階段只 COPY 了 `dist`、`package.json`、`node_modules`，source code、tsconfig、test 檔案這些完全沒帶進來。

## 我自己的做法

實務上我會加幾個額外的規則：

**一、final stage 一律改用 non-root user**。大部分 official image 預設是 root，對安全性很不友善。我通常會在最後階段加上：

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# 建立 non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

ENTRYPOINT ["dotnet", "MyApp.dll"]
```

**二、Alpine 或 chiseled image 是首選**。如果應用程式能相容 musl libc，我會優先用 `-alpine` tag；.NET 8 以後則優先看 `chiseled` 版本，體積更小，套件更少，CVE 也少。

**三、build stage 跟 test stage 分開**。我會額外加一個 `AS test` 階段跑 unit test，讓 CI 在建 image 的同時順便驗證。如果 test 失敗，整個 build 就 fail，不會產出壞掉的 image。

```dockerfile
FROM build AS test
WORKDIR /src
RUN dotnet test --no-restore --logger "trx;LogFileName=test_results.trx"
```

這個 test stage 只在 CI 需要的時候跑（透過 `--target test`），production build 預設會跳過。

## 用 --target 指定 build 到哪一階段

Multi-stage 有個好用但容易被忽略的功能：`docker build --target`。可以指定只 build 到某個 stage 為止。

```sh
# 只 build 到 test 階段（跑測試）
docker build --target test -t myapp:test .

# Build 到最終階段（production）
docker build --target runtime -t myapp:latest .
```

這讓同一份 Dockerfile 可以同時支援 dev、test、production 三種用途，不用維護多個檔案。

## BuildKit 與 cache mount

Docker 20.10 以後預設啟用 BuildKit，它提供了 `--mount=type=cache` 這個功能，可以讓 NuGet、npm、pip 這種 package cache 跨 build 保留。

```dockerfile
# syntax=docker/dockerfile:1.4
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MyApp.csproj", "./"]

RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet restore
```

第一次 restore 會去下載套件，之後即使 csproj 改了，只要套件已經在 cache 裡，就不用重新抓。CI 跑個幾十次下來省下的時間很可觀。

## Image 大小對照

拿同一個 .NET Web API 專案實測：

```text
Single-stage (SDK only)           ~920 MB
Multi-stage (aspnet runtime)      ~220 MB
Multi-stage + alpine              ~115 MB
Multi-stage + chiseled            ~105 MB
```

從 920MB 壓到 105MB，大概是原本的 1/9。部署的時候 pull image 從 30 秒縮短到 3 秒，CI/CD pipeline 也跟著變快。

## 結語

Multi-stage build 幾乎是寫 Dockerfile 的基本功，不用它大概就只能接受肥大的 image。寫法其實沒多難，多個 `FROM` + `COPY --from` 就搞定。進階一點再加上 non-root user、cache mount、`--target`，image 會更精實，CI 也會更快。

下次寫 Dockerfile 前先想清楚：build 時用的東西，runtime 真的需要嗎？不需要的就用另一個 stage 丟掉。

## 參考資料

[Docker 官方文件：Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
[Microsoft Learn：Containerize a .NET app](https://learn.microsoft.com/dotnet/core/docker/build-container)
[Docker BuildKit cache mounts](https://docs.docker.com/build/cache/optimize/#use-cache-mounts)
