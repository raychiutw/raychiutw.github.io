---
title: '三個 repo 同時動工：用 AI Agent 平行開發微服務的甜蜜與代價'
description: '一個功能跨三個微服務，用 OpenSpec 先釐清合約再派三個背景 agent 平行實作，30 分鐘壓縮原本 1-2 天的工作。但也踩到 RabbitMQ event 欄位名不一致的坑，讓跨服務 null 災難 debug 了半天。這篇記錄平行開發的做法、設計變更的代價，以及跨服務合約的教訓。'
date: 2026-04-13
category: '程式開發'
tags: ['AI生成', 'AI Agent', '微服務', 'OpenSpec', 'RabbitMQ']
postSlug: 'ai-agent-parallel-microservices-development'
---

> 一個功能要跨三個微服務同步展開。我沒有分三天順序做，而是派了三個背景 agent 同時動工，30 分鐘壓縮原本 1-2 天的工作。效率很爽，但中途因為設計變更重寫了 3 次，還踩到一個跨服務 event 欄位名不一致的坑 — 這是關於「平行化的甜蜜與代價」的實錄。

## 為什麼一個功能要跨三個 repo

先講背景。我要做的是一個 per-vehicle 通知訂閱功能，讓使用者可以針對單一車輛開關通知。這個看似單純的需求，實際上要動三個微服務：

- **會員服務**：管車輛資料、通知設定（表 schema + GraphQL 查詢 + REST API）
- **訊息閘道服務**：外部合作夥伴系統打進來的進出場 API，收到事件後發佈 domain event
- **推播 Job 服務**：消費 event、組 LINE Flex Message、呼叫 LINE Messaging API 派送

三個服務分屬三個獨立的 repo，各自有自己的 solution、CI pipeline、部署流程。如果單人順序做，大概的節奏會是：今天改會員服務、明天改閘道服務、後天改 Job 服務。中間每一步都要等上一步的 contract 確定、tests 跑完、code review 完。算下來 1-2 天跑不掉。

所以我決定試試看：**能不能三個 repo 同時動工？**

## 平行派 agent 的做法

### 先用 OpenSpec 把合約寫清楚

關鍵不是「派更多 agent」，是「讓每個 agent 能獨立作戰」。平行化的最大敵人是協調成本 — 如果三個 agent 要不斷互相等對方，那就跟順序做沒兩樣了。

所以我先走了一輪 OpenSpec 流程，把設計和合約寫清楚：

- **proposal.md**：這個功能要做什麼、為什麼要做
- **design.md**：表 schema、event 格式、API 輸入輸出
- **specs/**：每個 capability 的 SHALL/MUST 規範
- **tasks.md**：每個 repo 各自一份，拆成獨立 task

最重要的是 **每個 repo 一份獨立的 tasks.md**。會員服務的 agent 只看會員服務的 tasks，閘道服務的 agent 只看閘道服務的 tasks。彼此的交會點（event 欄位、API contract）已經在 design.md 寫死，沒有需要即時協調的空間。

這一步就是後面平行化能跑起來的前提。

### 三個背景 agent 同時啟動

OpenSpec 文件準備好之後，我同時派了三個 Teammate Agent：

```text
apply-member-service     ── 會員服務全部（Entity / Repository / GraphQL / REST / Tests）
apply-messagehub-webapi  ── 閘道服務（Controller / Command / Handler / Tests）
apply-messagehub-job     ── Job 服務（策略擴充 / Consumer / Job / Tests）
```

每個 agent 用 `run_in_background: true` 啟動，各自讀自己 repo 的 tasks.md，各自跑各自的 build/test。三個 agent 完全不知道彼此的存在，就算其中一個卡住也不會影響另外兩個。

一個踩過的小坑：**背景 agent 第一次啟動時，Write / Bash tool 會被權限擋住，agent 會卡在「請授權」的狀態**。解法是在派 agent 時加 `mode: "bypassPermissions"`。沒設定的話背景 agent 跑不動，會一直卡著等你回去按同意。

30 分鐘後三個 agent 各自回報：

```text
會員服務：  731 tests pass
閘道服務：   33 tests pass
Job 服務：  183 tests pass
```

換算下來：原本要 1-2 天的工作，壓縮在 30 分鐘。效率爽度拉滿。

## 設計變更的代價：重寫了 3 次

效率是真的，但代價也是真的。第一次跑完之後，我補測試補到一半，對 schema 有了新想法：

**第一次變更**：某張表從會員資料庫移到訊息資料庫，另一張表改名，加了一個「通知類型」維度。三個 agent 全部重構一次。

**第二次變更**：看了重構結果，覺得「通知類型」其實不該在這張表管，職責應該純粹是 per-vehicle channel 訂閱。再把通知類型欄位移掉。三個 agent 又全部重構一次。

一次看似單純的「改個表名」，實際上要動這些東西：

- Domain Entity 改名（3 個 repo）
- Persistence Configuration 改名 + Unique Index 重設（3 個 repo）
- DbContext 的 DbSet（3 個 repo）
- Handler / Query 所有引用（3 個 repo）
- Tests 所有賦值（3 個 repo）
- Backfill SQL
- OpenSpec spec/design/proposal/tasks（3 個 repo）

一次變更 = **30+ 個檔案修改**。如果沒有 agent 在合理時間內重構，我早就放棄不改了，直接勉強接受第一版的設計。平行 agent 最大的隱藏好處是：**它讓 refactor 的邊際成本變低，你才敢在中途改設計**。

但這也帶出一個教訓：**表 schema 決策在一開始就要問「未來還會擴充什麼」**。我重寫 3 次的根本原因是第一版設計沒想清楚這張表的職責邊界。如果在 Explore 階段就把「這張表會不會再加其他維度」這種問題問到清楚，可以省下至少一輪重構。

## 最慘的坑：跨服務 event 欄位名不一致

這個坑我要講詳細一點，因為它是整個流程裡最值得記錄的教訓。

三個 agent 都跑完、測試都綠了、本地功能也試過了。過了幾天之後，我突然發現一個問題：**外部合作夥伴傳進來的訊息內容，最後推播出去的 LINE Flex 訊息裡完全不見了**。

### 症狀

傳送端（閘道服務）看起來完全沒事：

```cs
// 閘道服務的 Handler
var domainEvent = new MemberPushVehicleEvent
{
    MemberId = request.MemberId,
    Message = request.Message,  // ← 合作夥伴傳來的訊息內容
};

await _bus.PubSub.PublishAsync(domainEvent);
```

Log 顯示事件有發出去，RabbitMQ 管理介面也看得到訊息。但接收端（Job 服務）處理出來的結果，訊息內容永遠是 null。Job 服務的 Consumer 跑起來沒有例外，就是 `MessageData` 這個欄位讀出來是 null，然後 fallback 去載 DB 的預設範本 — 所以推播還是有送出去，只是內容完全不是合作夥伴要的。

一開始完全找不到方向。RabbitMQ 管理介面看 message body 是正常的 JSON，該有的欄位都在；Consumer 也有正確被觸發。就是 `MessageData` 永遠是 null。

### 根因

Debug 了半天才發現，兩個專案各自定義了 event class，**欄位名不一樣**：

```cs
// 閘道服務的定義
public class MemberPushVehicleEvent
{
    public long MemberId { get; set; }
    public string Message { get; set; }        // ← 叫 Message
}

// Job 服務的定義（位於另一個 repo）
public class MemberPushVehicleEvent
{
    public long MemberId { get; set; }
    public string MessageData { get; set; }    // ← 叫 MessageData
}
```

EasyNetQ 底層用 JSON 序列化，欄位名不符就會反序列化成 null。**Job 服務收到的 JSON 裡明明有 `Message` 欄位，但 C# class 的 property 叫 `MessageData`，序列化器對不上，就變成 default value null**。沒有例外、沒有警告、就是悄悄地 null。

更慘的是第一版 Job 的邏輯寫成「如果 MessageData 是 null 就去載 DB 範本」— 這個 fallback 直接把 bug 吞掉，讓整個流程看起來正常運作，只是送出去的內容不對。

### 教訓

這個坑的根因不是寫錯欄位名，而是**兩個微服務各自定義同一個 event class，沒有共享、沒有合約驗證**。防堵的方向有三個：

1. **把 event class 放共用專案**。發佈端和消費端 reference 同一份 class，就不會有欄位名不一致的問題。這是最徹底的解法。
2. **用 JsonPropertyName 對齊欄位名**。如果兩邊真的不能共用（例如部署 cadence 不同），至少用 attribute 顯式對齊。
3. **加 integration test 驗 round-trip**。寫一個測試：發佈端建一個完整的 event，消費端反序列化，比對所有欄位。這個測試跨兩個 repo，比較難寫，但會直接抓到這種問題。

我這次的修法是對齊欄位名（把 Job 服務改成 `Message`）、拿掉那個會吞 bug 的 fallback 邏輯。但更根本的解法是第一條：event class 應該放 shared 專案。

這個坑的成本不是修起來難 — 修起來其實只要 10 分鐘。成本在於它 debug 了半天才找出來。如果一開始就有個 integration test 驗 round-trip，這個 bug 根本不會上到生產環境。

## 下次會這樣做

整理一下這次學到的事：

**跨服務合約要先於 code 釐清**。OpenSpec 的 design.md 要明確寫下 event 欄位、預設值、table schema 同步策略。這些東西一旦進入 code，跨 repo 修改成本很高。

**Event class 放 shared 專案**。如果沒有 shared 專案，就加 integration test 驗 round-trip。單元測試在單一 repo 內 100% 通過，不代表跨 repo 合約是對的。

**每個 repo 獨立的 tasks.md 是平行化的關鍵**。agent 之間的協調成本跟 task 之間的依賴度成正比，如果 agent 需要即時溝通，平行化就沒意義了。把依賴關係全部收斂到 design.md，讓每個 agent 能獨立作戰。

**設計變更在 Explore 階段處理**。一旦三個 repo 的 code 都寫出來，每次改表名都是 30+ 檔案的修改。Explore 階段多問幾個「未來還會擴充什麼」的問題，比事後重構便宜 10 倍。

**平行 agent 讓 refactor 邊際成本變低**。這是我這次最意外的收穫。以前我會下意識避免中途改設計，因為 refactor 成本太高。用 agent 之後，我可以在中途果斷重構 — 反正 30 分鐘就重寫完了。這改變了我對「設計彈性」的判斷。

一句話收尾：**跨服務展開同一個功能，成本不在 code，成本在「跨服務合約」的釐清與同步**。早一點問對問題、早一點把合約寫下來，會讓後面的平行化跑得順很多。
