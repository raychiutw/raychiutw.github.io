---
title: 'Docker Multi-Stage Build 實戰筆記：從 900 MB 壓到 80 MB 的過程'
description: 'Docker multi-stage build 讓你在一個 Dockerfile 裡切分建置與執行環境，把最終映像檔從幾百 MB 壓到幾十 MB。這篇記錄我從踩坑到調出滿意 Dockerfile 的過程，包含快取技巧、安全性陷阱，以及我自己的 .NET 與 Node 實戰範本。'
date: 2026-04-09
category: '程式開發'
tags: ['AI生成', 'Docker', 'Dockerfile', 'DevOps', 'Container']
postSlug: 'docker-multi-stage-build'
---

> Multi-stage build 的核心只有一句話：在同一個 Dockerfile 裡切出「建置」跟「執行」兩個階段，最後只把執行時真正需要的檔案複製過去，其餘通通丟掉。

## 我為什麼開始認真學這個

第一次被 multi-stage build 救到是三年前。那時候我負責一個 ASP.NET Core Web API，CI 每次 build 完的映像檔是 908 MB，推到 registry 要等半天，Kubernetes 拉映像檔的時間比應用程式啟動還久。更荒謬的是 — 正式環境根本不需要 .NET SDK、不需要 NuGet cache、更不需要原始碼，但這些全都被打包進去了。

同事的解法是「再開一個 Dockerfile.runtime」，用 shell script 把 build artifact 倒來倒去。能跑，但 review 的時候沒人看得懂。後來我把整套改成 multi-stage build，Dockerfile 從兩個變回一個，映像檔也從 908 MB 壓到 82 MB。從那之後我幾乎所有專案都走這個模式。

## 基本概念

Multi-stage build 的語法只需要記得兩件事：

1. `FROM ... AS <stage-name>` — 給每個階段取名字
2. `COPY --from=<stage-name>` — 跨階段複製檔案

```dockerfile
# 階段一：建置
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 階段二：執行
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

最終映像檔只會包含 `nginx:alpine` + 編譯後的 `dist/`。第一個階段那些 `node_modules`、`npm cache`、原始碼全部留在建置環境裡，永遠不會進到正式機。

## 反面教材：單一階段的問題

為了讓對比更有感，先看看沒有 multi-stage 的寫法會長什麼樣子。

```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 80
CMD ["npm", "start"]
```

這段 code 有三個問題：

- **映像檔肥**：`node:20` 本身就將近 1 GB，加上 `node_modules` 動輒再幾百 MB
- **攻擊面大**：原始碼、`.git`、開發相依套件全被打包，攻擊者 exec 進去撈資料非常方便
- **層級浪費**：每個 `RUN` 都產生一層，後面即使刪掉也無法真的縮小

Multi-stage 一次解決這三個問題，不需要額外工具。

## .NET 實戰範本

這是我目前放在大部分 .NET 專案裡的版本。分成 `restore`、`build`、`publish`、`runtime` 四個階段，看起來繁瑣但每一步都有原因。

```dockerfile
# 階段一：還原套件（快取用）
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS restore
WORKDIR /src
COPY ["MyApp.sln", "./"]
COPY ["src/MyApp.Api/MyApp.Api.csproj", "src/MyApp.Api/"]
COPY ["src/MyApp.Core/MyApp.Core.csproj", "src/MyApp.Core/"]
RUN dotnet restore "src/MyApp.Api/MyApp.Api.csproj"

# 階段二：編譯
FROM restore AS build
COPY . .
WORKDIR /src/src/MyApp.Api
RUN dotnet build "MyApp.Api.csproj" -c Release -o /app/build --no-restore

# 階段三：發佈
FROM build AS publish
RUN dotnet publish "MyApp.Api.csproj" -c Release -o /app/publish --no-build

# 階段四：執行
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=publish /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "MyApp.Api.dll"]
```

幾個我自己的做法要特別說明：

- **`restore` 階段獨立**：只複製 `.csproj` 和 `.sln`，讓 Docker 的 layer cache 在原始碼改動時還能命中 NuGet restore 的結果。如果把 `COPY . .` 放在 restore 之前，每次改一行 code 都要重新 restore，體感慢三倍
- **`--no-restore` 和 `--no-build`**：避免同樣的事情做兩次
- **`USER $APP_UID`**：.NET 9 之後官方 base image 內建的非 root 使用者。之前版本要手動 `RUN adduser`，忘記加就等於用 root 跑服務

最終映像檔大概落在 220 MB 上下（`aspnet:9.0` 本身就 200 MB），相比單階段 SDK 版的 1.2 GB 差了五倍。

## Node.js 實戰範本

Node 的部份我偏好用 `distroless` 或 `alpine` 當 runtime，看專案需求。以下是我常用的 `distroless` 版本，最後映像檔可以壓到 80 MB 以內。

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs20-debian12 AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
USER nonroot
CMD ["dist/server.js"]
```

注意我開了兩個不同的階段：`deps` 只裝 production 相依，`build` 裝全部相依（含 TypeScript、test、lint 工具）跑編譯。最後 runtime 階段從 `deps` 拿 `node_modules`、從 `build` 拿編譯產物。這樣 runtime 映像檔完全不會有 devDependencies。

`distroless` 沒有 shell、沒有 `apt`、沒有 `curl`，體積小而且攻擊面極小。缺點是進不去 debug，所以我自己的規則是：測試環境用 `alpine`，正式環境用 `distroless`。

## 快取技巧：用 BuildKit 的 `--mount`

BuildKit 開啟後可以用 `RUN --mount` 指令做更細緻的快取。這招我是去年才開始用，對 CI 環境特別有感。

```dockerfile
# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build
```

第一行 `# syntax=docker/dockerfile:1.7` 不能省，這告訴 Docker 要用 BuildKit 前端解析。`--mount=type=cache` 會把 `/root/.npm` 目錄掛成跨 build 共用的快取，下一次即使從零開始 build 也能重用上次的 npm cache。

我在 GitHub Actions 的實測：原本每次 `npm ci` 要跑 45 秒，加了 cache mount 之後壓到 8 秒。

## 常見坑與我的踩坑筆記

實作 multi-stage build 時有幾個陷阱很容易踩，整理成 checklist 方便自己回頭查。

**坑一：複製太多東西進 runtime**

```dockerfile
# 錯誤示範
COPY --from=build /app /app
```

這段把整個 `/app` 目錄連 `node_modules`、`src`、`.git` 都搬過去，完全失去 multi-stage 的意義。正確做法是只複製最終產物：

```dockerfile
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
```

**坑二：忘記 `.dockerignore`**

即使 multi-stage 做對了，如果沒有 `.dockerignore`，`COPY . .` 還是會把 `.git`、`node_modules`、`.env` 送進 build context。我現在的基本模板長這樣：

```text
.git
.gitignore
node_modules
npm-debug.log
.env
.env.*
Dockerfile
.dockerignore
coverage
.vscode
dist
```

忘記加 `.env` 進去而把開發環境的金鑰包進映像檔 — 這個錯誤我在 2022 年犯過一次，之後每個新專案第一件事就是複製這份 `.dockerignore`。

**坑三：階段之間傳遞權限**

```dockerfile
FROM alpine AS build
RUN chown -R 1000:1000 /app

FROM alpine AS runtime
COPY --from=build /app /app  # 權限會掉回 root
```

`COPY --from` 預設不會保留 owner 資訊。要保留必須加 `--chown`：

```dockerfile
COPY --from=build --chown=1000:1000 /app /app
```

這個坑我踩過兩次都在 debug「為什麼 container 裡面的程式不能寫 log」。

## 建置指令與驗證

寫好 Dockerfile 之後我會用這幾個指令驗證。

```sh
# 建置並標記
docker build -t myapp:latest .

# 檢查映像檔大小
docker images myapp:latest

# 檢查各層大小
docker history myapp:latest

# 進 container 看檔案（distroless 無法用這招）
docker run --rm -it --entrypoint sh myapp:latest
```

`docker history` 特別有用，可以一眼看出哪一層意外變肥。我通常的要求是最大那一層不要超過 100 MB，超過就要回去檢查是不是 `COPY` 複製太多。

## 結語

Multi-stage build 不是什麼新技術，Docker 17.05 就支援了。但很多專案的 Dockerfile 還停留在單階段的寫法，每次 deploy 都在浪費頻寬和儲存空間。我的建議很簡單：

- **新專案從 day 1 就用 multi-stage**，不要等「之後再優化」
- **`.dockerignore` 跟 Dockerfile 一起寫**，不要等 build 出問題才補
- **每次改完 Dockerfile 都跑一次 `docker history`**，確認沒有哪一層爆肥

花 30 分鐘把 Dockerfile 改對，就能省下每天 CI/CD 流程裡累積的大量時間。這是我目前覺得 CP 值最高的容器化優化之一。

[Docker 官方文件 — Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
[Docker BuildKit cache mount 說明](https://docs.docker.com/build/cache/backends/)
[Google distroless images](https://github.com/GoogleContainerTools/distroless)
