## Context

Ray 使用 Claude Code 作為 PM，指揮 AI Agent 團隊（工程師、Code Reviewer、QC）完成了個人部落格從 Hexo 到 Astro 的全面重建。整個過程包括需求討論、技術選型、OpenSpec 流程建立、團隊分工、平行開發、樣式升級等，在一個早上內完成了 27 篇文章遷移、69 頁建置。

## Goals / Non-Goals

**Goals:**
- 撰寫一篇 1500-2500 字的技術文章
- 記錄完整的 AI Agent 團隊協作流程
- 分享實際數據和成果
- 第一個標籤為「AI生成」

**Non-Goals:**
- 不是 Claude Code 的使用教學
- 不是 Astro 的入門指南

## Decisions

### 文章結構

1. **開場**：為什麼要重建部落格？一句話帶出 AI Agent 團隊的概念
2. **團隊組成**：PM(Claude)、工程師、Code Reviewer、QC 的角色定義
3. **開發流程**：OpenSpec 四階段（Explore → Propose → Apply → Archive）
4. **實戰過程**：
   - 需求討論與技術選型（Astro vs Next.js vs 11ty）
   - 視覺設計選擇（6→10 個方案、瀏覽器視覺化展示）
   - 12 個 Phase 的平行開發
   - 遇到的問題與解決（sitemap 相容性、圖片路徑等）
5. **成果數據**：27 篇文章、69 頁、14 張圖片、9 unit + 5 E2E 測試
6. **反思**：AI Agent 協作的優缺點、適用場景、未來展望

### Frontmatter

```yaml
title: "我當 User，Claude 當 PM — AI Agent 團隊重建部落格實戰"
description: "用 Claude Code 的 AI Agent 團隊（PM、工程師、Code Reviewer、QC）完成部落格從 Hexo 到 Astro 的全面重建，記錄 OpenSpec 流程與平行開發的實戰經驗。"
date: 2026-03-19
category: "程式開發"
tags: ["AI生成", "Claude Code", "AI Agent", "Astro", "OpenSpec"]
postSlug: "ai-agent-team-rebuild-blog"
```
