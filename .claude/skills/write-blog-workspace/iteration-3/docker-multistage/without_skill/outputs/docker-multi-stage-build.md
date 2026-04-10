---
title: Docker Multi-stage Build 實戰：從 1.2GB 瘦身到 80MB 的映像檔優化之路
description: 還在為 Docker 映像檔過肥而煩惱嗎？本文帶你從零理解 multi-stage build 的運作原理,透過 Node.js、Go 實例把映像檔砍到剩零頭,並整理生產環境該避開的常見地雷。
date: 2026-04-10
category: DevOps
tags:
  - AI生成
  - Docker
  - Multi-stage Build
  - DevOps
  - 容器化
  - CI/CD
postSlug: docker-multi-stage-build
---

## 前言:那個讓你 CI 跑半小時的 Dockerfile

不知道你有沒有過這種經驗:專案明明只是個小小的 Node.js API,build 出來的 Docker image 卻動輒 1GB 起跳。每次 push 到 registry 要等十分鐘,K8s 拉 image 又要等五分鐘,deploy 一次半小時就這樣沒了。

更慘的是打開映像檔一看,裡面居然包了 `gcc`、`python`、整包 `devDependencies`、甚至 `.git` 資料夾,要什麼有什麼,就是不像個「乾淨的生產環境」。

這時候 **multi-stage build** 就是你的救星。今天這篇會從原理講到實戰,帶你把映像檔瘦身到極致,順便避開幾個我踩過的坑。

## 為什麼單階段 build 這麼肥?

先看一個「反面教材」,一個很常見的 Node.js Dockerfile:

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

這個 Dockerfile 能跑,但問題在於:

1. **base image 本身就很肥**:`node:20` 是 Debian slim 基底,帶了完整的 toolchain,大約 400MB 起跳
2. **devDependencies 留在映像檔裡**:TypeScript、ESLint、各種 @types 都跟著上 production
3. **build 產物和原始碼並存**:`src/` 和 `dist/` 都在,但 runtime 只需要 `dist/`
4. **npm cache 塞滿 layer**:沒清掉的 `~/.npm` 可能佔幾百 MB

build 出來輕鬆破 1.2GB,但真正跑 runtime 需要的東西可能不到 100MB。這差距就是 multi-stage build 要幫你挖回來的空間。

## Multi-stage Build 的核心概念

Docker 17.05 之後支援在同一個 Dockerfile 裡寫多個 `FROM`,每個 `FROM` 開啟一個新的 build stage。關鍵的兩件事是:

- **每個 stage 是獨立的 build context**,前一個 stage 的檔案預設不會帶到下一個
- **你可以用 `COPY --from=<stage>` 從前面的 stage 精準挑出需要的檔案**

換句話說,你可以在第一個 stage 裝一堆 build 工具、編譯程式碼,然後只把**成品**搬到一個乾淨的 runtime stage。最終推到 registry 的只有最後一個 stage,中間那些肥胖的 builder 會被丟掉。

這個設計的妙處是:**build-time 依賴和 runtime 依賴徹底分離**。

## 實戰一:Node.js + TypeScript 專案

把前面那個肥胖的 Dockerfile 改寫成 multi-stage 版本:

```dockerfile
# ===== Stage 1: Builder =====
FROM node:20-alpine AS builder

WORKDIR /app

# 先複製 package.json,利用 layer cache
COPY package*.json ./
RUN npm ci

# 再複製 source code
COPY . .
RUN npm run build

# 清掉 devDependencies,只留 production 需要的
RUN npm prune --production

# ===== Stage 2: Runtime =====
FROM node:20-alpine AS runtime

WORKDIR /app

# 建立非 root 使用者(安全加分)
RUN addgroup -S app && adduser -S app -G app

# 只搬需要的東西過來
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/package.json ./

USER app

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

幾個重點:

1. **用 `node:20-alpine` 當 base**:Alpine 版本約 50MB,比 Debian slim 小很多
2. **stage 取名 `AS builder`**:後面好用 `--from=builder` 引用,比用數字清楚
3. **`npm prune --production`**:在 builder stage 就把 devDependencies 砍掉
4. **`--chown=app:app`**:COPY 的同時設定擁有者,避免多一層 `RUN chown`
5. **`USER app`**:用非 root 跑,符合 security best practice

實測一個中型 Express + TypeScript 專案,從 1.2GB 降到 **約 180MB**,瘦身 85%。

## 實戰二:Go 專案的極致瘦身

Go 的優勢是可以編譯成靜態執行檔,所以 runtime stage 可以用 `scratch`(空的 base image),成品壓到幾十 MB 甚至更小。

```dockerfile
# ===== Stage 1: Builder =====
FROM golang:1.23-alpine AS builder

WORKDIR /build

# 先下載依賴(利用 cache)
COPY go.mod go.sum ./
RUN go mod download

# 複製 source 並編譯
COPY . .

# 關鍵:CGO_ENABLED=0 才能用 scratch
# -ldflags="-s -w" 去掉 debug 資訊,可以再瘦個 20-30%
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o /out/app ./cmd/server

# ===== Stage 2: Runtime =====
FROM scratch

# 從 builder 搬 CA 憑證(HTTPS 呼叫要用)
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /out/app /app

EXPOSE 8080
ENTRYPOINT ["/app"]
```

這樣一個基本的 Go HTTP server 可以壓到 **15MB 以下**,而且因為 `scratch` 裡什麼都沒有,連 shell 都沒有,攻擊面小到不行。

如果你希望保留 `sh` 方便 debug,可以改用 `alpine` 或 `gcr.io/distroless/static-debian12`:

```dockerfile
FROM gcr.io/distroless/static-debian12
COPY --from=builder /out/app /app
ENTRYPOINT ["/app"]
```

Google 的 distroless 系列 image 是折衷方案,比 scratch 多一些 runtime 必需的檔案(CA 憑證、tzdata、基本的 libc),但仍然不含 package manager 和 shell。

## 進階技巧:善用 target 做多用途 Dockerfile

同一份 Dockerfile 可以同時服務開發和生產環境。加一個 `dev` stage:

```dockerfile
# ===== Stage 1: deps =====
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ===== Stage 2: builder =====
FROM deps AS builder
COPY . .
RUN npm run build

# ===== Stage 3: dev (開發環境用) =====
FROM deps AS dev
COPY . .
CMD ["npm", "run", "dev"]

# ===== Stage 4: runtime (生產環境用) =====
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
CMD ["node", "dist/server.js"]
```

build 時用 `--target` 指定要停在哪個 stage:

```bash
# 開發環境(有 hot reload、完整 devDependencies)
docker build --target dev -t myapp:dev .

# 生產環境(瘦身版)
docker build --target runtime -t myapp:prod .
```

一份 Dockerfile 搞定兩種情境,不用維護 `Dockerfile.dev` 和 `Dockerfile.prod`,DRY 的很開心。

## 進階技巧:利用 BuildKit 的 cache mount

如果你在 CI 上每次 build 都要重新下載一堆套件,會慢到爆。BuildKit(Docker 18.09+)提供 `--mount=type=cache` 讓你把 cache 目錄掛出來,跨 build 共用:

```dockerfile
# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./

# npm cache 掛到 /root/.npm,跨 build 保留
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build
```

第一行的 `# syntax=docker/dockerfile:1.7` 一定要加,這樣 BuildKit 才會啟用新語法。在 CI 環境(例如 GitHub Actions)搭配 `docker/build-push-action@v5` 和 `cache-to: type=gha` 使用,build 時間可以砍半以上。

Go 專案也能用:

```dockerfile
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -o /out/app ./cmd/server
```

## 踩過的坑與注意事項

實戰這幾年下來,列幾個我和同事常犯的錯:

### 1. `COPY . .` 沒配 `.dockerignore`

如果你沒寫 `.dockerignore`,`COPY . .` 會把 `.git`、`node_modules`、`.env`、`*.log` 全部複製進 builder,不只肥,還有 **資安風險**(`.env` 帶進 image 是經典事故)。一定要有:

```
# .dockerignore
node_modules
.git
.env*
*.log
dist
coverage
.vscode
.idea
Dockerfile
.dockerignore
```

### 2. layer 順序沒優化,cache 全失效

Docker build cache 是逐層比對的,一層變動後面全部要重跑。正確順序應該是:**變動頻率低的放前面,變動頻率高的放後面**。

錯誤寫法:

```dockerfile
COPY . .
RUN npm ci  # 改一行 code 就要重跑 npm ci,超慢
```

正確寫法:

```dockerfile
COPY package*.json ./
RUN npm ci           # 只有 package.json 變才重跑
COPY . .             # code 變動只影響這層後面
```

### 3. 忘記 `npm ci --production` 或 `npm prune --production`

如果你在 runtime stage 直接 `COPY --from=builder /app/node_modules`,devDependencies 會整包被搬過去。記得在 builder 先 `npm prune --production`,或者另開一個 `deps` stage 專門裝 production 依賴。

### 4. Alpine 的 musl libc 陷阱

Alpine 用的是 **musl libc**,不是 glibc。有些 native module(例如 `bcrypt`、`sharp`、`canvas`)在 Alpine 上跑會出現詭異的 segfault 或 link error。解法:

- 改用 `node:20-slim`(Debian 精簡版,約 80MB)
- 或在 Alpine 裡裝 `libc6-compat`:`RUN apk add --no-cache libc6-compat`

### 5. `latest` tag 是大忌

`FROM node:latest` 看似方便,其實每次 build 行為都不同,完全沒有可重現性。production 一律鎖版本,最好連 digest 都鎖:

```dockerfile
FROM node:20.11.1-alpine3.19@sha256:abc123...
```

## 怎麼量化瘦身效果?

build 完記得驗證一下成果:

```bash
# 看映像檔大小
docker images myapp

# 看每一層的大小分布
docker history myapp:prod

# 用 dive 互動式分析(強烈推薦)
dive myapp:prod
```

[dive](https://github.com/wagoodman/dive) 是一個 CLI 工具,可以 layer by layer 看每一層改了什麼檔案、佔多少空間。第一次用會讓你驚呼「原來這個 layer 這麼肥」,是優化 Dockerfile 的神器。

## 小結

Multi-stage build 不是什麼新東西,但真正用好的人其實不多。歸納幾個 key takeaway:

| 原則                                           | 目的                       |
| ---------------------------------------------- | -------------------------- |
| 把 build 工具和 runtime 分開                   | runtime 映像檔瘦身         |
| 用最小的 base image(alpine/scratch/distroless) | 減少攻擊面、加快 pull 速度 |
| 善用 `--target` 一份 Dockerfile 多用           | 減少維護成本               |
| BuildKit cache mount 加速 CI                   | 開發者體驗 up              |
| 寫好 `.dockerignore`                           | 避免安全事故和肥胖         |
| 非 root user + 鎖版本                          | 生產環境基本素養           |

最後的最後:**不要為了優化而優化**。如果你的專案還在 PoC 階段,先求跑得起來再求瘦。但一旦進到 production,這些瘦身功夫會在 CI/CD 時間、雲端 egress 費用、安全稽核上全都還你本錢。

下次看到 1GB 以上的映像檔,別再睜一隻眼閉一隻眼了,開 Dockerfile 動手改吧。

---

**延伸閱讀**

- [Docker 官方 Multi-stage builds 文件](https://docs.docker.com/build/building/multi-stage/)
- [Distroless Container Images](https://github.com/GoogleContainerTools/distroless)
- [BuildKit 的 cache mount 語法](https://docs.docker.com/build/cache/backends/)
