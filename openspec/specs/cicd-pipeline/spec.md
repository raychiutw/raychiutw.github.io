# cicd-pipeline Specification

## Purpose

TBD - created by archiving change rebuild-blog-with-astro. Update Purpose after archive.

## Requirements

### Requirement: GitHub Actions Workflow 觸發條件

CI/CD Pipeline MUST 使用 GitHub Actions workflow 實作。觸發條件 SHALL 包含：push to `master` 分支以及 Pull Request 事件。

#### Scenario: Push to master 觸發

WHEN 開發者將程式碼 push 至 `master` 分支
THEN GitHub Actions workflow SHALL 被觸發執行完整 CI/CD 流程（含部署）

#### Scenario: Pull Request 觸發

WHEN 開發者建立或更新 Pull Request
THEN GitHub Actions workflow SHALL 被觸發執行 CI 檢查流程

---

### Requirement: Pipeline 步驟

Pipeline MUST 依序執行以下步驟：`pnpm install` → `ESLint` → `Prettier check` → `tsc`（TypeScript 型別檢查）→ `astro build` → `Vitest`（單元測試）→ `Playwright`（E2E 測試）。

#### Scenario: 完整 Pipeline 執行

WHEN Pipeline 被觸發
THEN 所有步驟 SHALL 依照指定順序執行，每個步驟的輸出與結果 SHALL 可在 GitHub Actions 介面中檢視

---

### Requirement: 失敗阻擋合併

任一 Pipeline 步驟失敗 SHALL 阻擋 Pull Request 合併。GitHub branch protection rules MUST 設定為要求 CI 通過。

#### Scenario: ESLint 檢查失敗

WHEN ESLint 步驟偵測到程式碼風格或品質問題
THEN Pipeline SHALL 標記為失敗，且 Pull Request 的合併按鈕 SHALL 被停用

#### Scenario: 測試失敗

WHEN Vitest 或 Playwright 測試步驟中有任何測試案例失敗
THEN Pipeline SHALL 標記為失敗，且 Pull Request SHALL 無法合併

---

### Requirement: 部署設定

部署 MUST 使用 `actions/deploy-pages@v4`，Node.js 版本 SHALL 為 20 LTS。

#### Scenario: 部署環境

WHEN Pipeline 執行部署步驟
THEN SHALL 使用 `actions/deploy-pages@v4` action 與 Node.js 20 LTS 環境

---

### Requirement: 僅 master 分支觸發部署

部署步驟 MUST 僅在 `master` 分支觸發。其他分支（如 `feature/*`）SHALL 僅執行 CI 檢查，不執行部署。

#### Scenario: feature 分支推送

WHEN 開發者將程式碼 push 至 `feature/dark-mode` 分支
THEN Pipeline SHALL 執行 CI 檢查步驟（lint、test 等），但 SHALL NOT 執行部署步驟

#### Scenario: master 分支推送

WHEN 開發者將程式碼 push 至 `master` 分支且 CI 通過
THEN Pipeline SHALL 執行部署步驟，將網站發佈至 GitHub Pages

---

### Requirement: 部署前多重審核

部署前 MUST 通過五項審核關卡：CI 自動檢查通過、Reviewer Approve、QC Approve、PM Approve、Key User Approve。所有關卡皆通過後方可觸發部署。

#### Scenario: 缺少審核

WHEN Pull Request 已通過 CI 但尚未取得所有必要的 Approve
THEN 部署 SHALL 不被觸發，Pull Request SHALL 顯示待審核狀態

#### Scenario: 所有審核通過

WHEN Pull Request 通過 CI 且取得 Reviewer、QC、PM、Key User 四方 Approve
THEN 部署 SHALL 可被觸發執行

---

### Requirement: npm audit 安全檢查

Pipeline MUST 執行 `npm audit` 檢查。若偵測到 high 或 critical 等級的安全漏洞，SHALL 阻擋 Pull Request 合併。

#### Scenario: 存在 critical 漏洞

WHEN `npm audit` 偵測到 critical 等級的依賴套件漏洞
THEN Pipeline SHALL 標記為失敗，且 Pull Request SHALL 無法合併

#### Scenario: 僅有 low/moderate 漏洞

WHEN `npm audit` 僅偵測到 low 或 moderate 等級的漏洞
THEN Pipeline SHALL 不因此失敗，但 SHALL 在 log 中顯示警告

---

### Requirement: Dependabot 自動更新

GitHub Dependabot MUST 啟用，自動偵測依賴套件更新並建立 Pull Request。

#### Scenario: 依賴套件有新版本

WHEN 專案的某個依賴套件發佈新版本
THEN Dependabot SHALL 自動建立 Pull Request 提議更新該套件
