---
title: 'MongoDB Sharding with Docker'
description: 'sharding 為 MongoDB 所擁有的一種資料分散處理架構，簡單的說就是將資料分片 (shard) 儲存到不同的機器中，最常應用在大數據的案例上。在海量資料的儲存情境上，垂直擴充架構是無法滿足的，必須透過水平擴充來實現'
date: 2019-03-20
category: '程式開發'
tags: ['MongoDB', 'NoSQL']
postSlug: 'mongodb-sharding-with-docker'
---

> sharding 為 MongoDB 所擁有的一種資料分散處理架構，簡單的說就是將資料分片 (shard) 儲存到不同的機器中，最常應用在大數據的案例上。在海量資料的儲存情境上，垂直擴充架構是無法滿足的，必須透過水平擴充來實現。

## 基本觀念

### 基本角色

MongoDB 的 sharding 有三種角色

- shard：負責存放資料，3.6 版後須為 replica set 架構
- config servers：負責記錄資料存在那些 shard 中，3.6 版後須為 replica set 架構
- mongos：擔任 router 功能，接收 clitent application 的請求，向 config servers 查詢資料所在的 shard（會快取），然後去 shard 拿取資料

![MongoDB Sharding 架構圖](/images/blog/sharded-cluster-production-architecture.bakedsvg.svg)

### replica set

MongoDB 服務器集群，用於實現 Relication 和 Automatic failover。

![replica set 架構圖](/images/blog/replica-set-read-write-operations-primary.bakedsvg.svg)

Relication 策略有兩種：

- one primary and two secondary
  一個 primary node + 二個 secondary node，優點是二份備份，適合需要資料高度安全的情境。

  ![one primary and two secondary 架構圖](/images/blog/replica-set-primary-with-two-secondaries.bakedsvg.svg)

- one primary, one secondary and one arbiter
  一個 primary node + 一個 secondary node + 一個 arbiter，arbiter 不存放資料，只負責 heartbeat，優點是節省資料保存空間，適合硬碟空間有限的情境。

  ![one primary, one secondary and one arbiter 架構圖](/images/blog/replica-set-primary-with-secondary-and-arbiter.bakedsvg.svg)

## 動手實作

### container 規劃說明

在 docker 環境下，快速建立起 mongodb sharding 架構規劃，在空間有限下我們用 3 台 mongos、3 台 config servers、2 個 shard（採用　one primary, one secondary and one arbiter，所以有 2 台 primary、2 台 secondary、2 台 arbiter 共 6 台）

container 清單：

- shard：
  shard1-data1
  shard1-data2
  shard1-arbiter
  shard2-data1
  shard2-data2
  shard2-arbiter
- config servers：
  config1
  config2
  config3
- mongos：
  mongos1
  mongos2
  mongos3

### 產生 keyfile

> keyfile 適合在開發或測試環境中使用，正式環境建議使用 [x.509 certificates](https://docs.mongodb.com/manual/core/security-x.509/)

使用 keyfile 身份驗證，replica set 中的每個 mongod 都使用 keyfile 的內容作為共享密碼來驗證部署中的其他成員。只有具有正確 keyfile 的 mongod 才能加入 replica set。

> 在 UNIX 系統上，密鑰文件不得具有 group 或 world 權限。 在 Windows 系統上，不檢查密鑰文件權限。

```sh
openssl rand -base64 756 > <path-to-keyfile>
chmod 400 <path-to-keyfile>
```

產生好的 keyfile 名稱為 `mongo-keyfile` 路徑為 `c:\data\mongo\`

### 建立 volume

```sh
docker volume create mongo-shard1-data1
docker volume create mongo-shard1-data2
docker volume create mongo-shard1-arb
docker volume create mongo-shard2-data1
docker volume create mongo-shard2-data2
docker volume create mongo-shard2-arb
```

### 建立 shard

```sh
# 建立 shard1-data1
docker run -v c:/data/mongo/mongo-keyfile:/data/mongo-keyfile --name shard1-data1 --net host --restart always -d -v c:/data/mongo/shard1-data1:/data/db mongo mongod --shardsvr --replSet shard1 --port 27018 --auth --keyFile /data/mongo-keyfile --bind_ip localhost

# 建立 shard1-data2
docker run -v c:/data/mongo/mongo-keyfile:/data/mongo-keyfile --name shard1-data2 --net host --restart always -d -v c:/data/mongo/shard1-data2:/data/db mongo mongod --shardsvr --replSet shard1 --port 27019 --auth --keyFile /data/mongo-keyfile --bind_ip localhost

# 建立 shard1-arbiter
docker run -v c:/data/mongo/mongo-keyfile:/data/mongo-keyfile --name shard1-arbiter --net host --restart always -d -v c:/data/mongo/shard1-arbiter:/data/arbiter mongo /bin/bash -c " mkdir -p /data/arbiter | mongod --replSet shard1 --dbpath /data/arbiter --port 27020 --auth --keyFile /data/mongo-keyfile --bind_ip localhost"

docker run -p 27018:27018 --name mongo-shard1-data1 --restart always -d -v mongo-shard1-data1:/data/db mongo mongod --shardsvr --replSet shard1 --port 27018 --bind_ip localhost

docker run -p 27019:27019 --name mongo-shard1-data2 --restart always -d -v mongo-shard1-data2:/data/db mongo mongod --shardsvr --replSet shard1 --port 27019 -- --bind_ip localhost

docker run -p 27020:27020 --name mongo-shard1-arb --restart always -d -v mongo-shard1-arb:/data/arb mongo /bin/bash -c " chmod 777 /data/arb | mongod --replSet shard1 --dbpath /data/arb --port 27020 --bind_ip localhost"

```

mongos --configdb config-set/srvmongoDB3:47018,srvmongoDB2:47019,srvmongoDB1:47020 --bind_ip localhost,srvmongoDB3 --port 37018 --keyFile /data/mongo-keyfile

#### 設定 shard1

```sh
docker exec -it mongo-shard1-data1 mongo localhost:27018

use admin
db.createUser(
    {
    user: "admin",
    pwd: "admin",
    roles: [
        { role: "root", db: "admin" }
    ]
    }
);

config = {
    "_id": "shard1",
    "members": [
        {
            _id:0,host:"localhost:27018"
        },
        {
            _id:1,host:"localhost:27019"
        },
        {
            _id:2,
            host:"localhost:27020",
            arbiterOnly:true
        }]
    }
rs.initiate(config)
rs.status()


rs.initiate()

rs.status();
db.auth("admin","admin");
rs.add("localhost:27019")
rs.addArb("localhost:27020")
rs.status();
```

### 建立 config servers

### 建立 mongos
