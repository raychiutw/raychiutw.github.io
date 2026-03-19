/**
 * Daily Report Generator for Ray's Notes
 *
 * 收集五項資料並產生 HTML email 報告與純文字摘要：
 * 1. Sentry 昨日錯誤
 * 2. GitHub Actions 失敗 runs
 * 3. 壞連結檢查
 * 4. Lighthouse 分數
 * 5. GA4 昨日流量
 */

import { writeFileSync } from "node:fs";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const SITE_URL = "https://raychiutw.github.io";
const REPO = "raychiutw/raychiutw.github.io";
const today = new Date();
const reportDate = today.toISOString().split("T")[0];
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const yesterdayStr = yesterday.toISOString().split("T")[0];

// Export REPORT_DATE for GitHub Actions
if (process.env.GITHUB_ENV) {
  const { appendFileSync } = await import("node:fs");
  appendFileSync(process.env.GITHUB_ENV, `REPORT_DATE=${reportDate}\n`);
}

// ─── XSS 防護 ────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── 1. Sentry 昨日錯誤 ───────────────────────────────────────────

async function fetchSentryErrors() {
  const org = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT;
  const token = process.env.SENTRY_AUTH_TOKEN;

  if (!org || !project || !token) {
    return { ok: false, error: "缺少 Sentry 環境變數" };
  }

  try {
    const res = await fetch(
      `https://sentry.io/api/0/projects/${org}/${project}/issues/?statsPeriod=24h&sort=freq&per_page=5`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const issues = await res.json();
    return {
      ok: true,
      data: issues.slice(0, 5).map((i) => ({
        title: i.title,
        count: i.count,
        link: i.permalink,
      })),
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── 2. GitHub Actions 失敗 runs ──────────────────────────────────

async function fetchFailedActions() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { ok: false, error: "缺少 GITHUB_TOKEN" };
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/actions/runs?status=failure&per_page=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const cutoff = yesterday.toISOString();
    const recent = data.workflow_runs.filter(
      (r) => r.created_at >= cutoff,
    );

    return {
      ok: true,
      data: recent.map((r) => ({
        name: r.name,
        branch: r.head_branch,
        link: r.html_url,
        createdAt: r.created_at,
      })),
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── 3. 壞連結檢查 ────────────────────────────────────────────────

async function checkBrokenLinks() {
  try {
    let sitemapXml;
    const sitemapRes = await fetch(`${SITE_URL}/sitemap-index.xml`);
    if (!sitemapRes.ok) {
      // Try single sitemap
      const altRes = await fetch(`${SITE_URL}/sitemap-0.xml`);
      if (!altRes.ok) throw new Error("無法取得 sitemap");
      sitemapXml = await altRes.text();
    } else {
      // Parse sitemap index to get child sitemaps
      const indexXml = await sitemapRes.text();
      const sitemapUrls = [
        ...indexXml.matchAll(/<loc>(.*?)<\/loc>/g),
      ].map((m) => m[1]);

      let allXml = "";
      for (const url of sitemapUrls) {
        const r = await fetch(url);
        if (r.ok) allXml += await r.text();
      }
      sitemapXml = allXml;
    }

    const urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
      (m) => m[1],
    );

    const broken = [];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000),
        });
        if (res.status !== 200) {
          broken.push({ url, status: res.status });
        }
      } catch (e) {
        broken.push({ url, status: e.name === "TimeoutError" ? "timeout" : "error" });
      }
    }

    return { ok: true, data: broken, total: urls.length };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── 4. Lighthouse 分數 ───────────────────────────────────────────

async function fetchLighthouseScores() {
  try {
    const apiKey = process.env.PAGESPEED_API_KEY;
    const categories = [
      "performance",
      "accessibility",
      "best-practices",
      "seo",
    ];
    const params = categories.map((c) => `category=${c}`).join("&");
    const keyParam = apiKey ? `&key=${apiKey}` : "";
    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${SITE_URL}&${params}${keyParam}`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const scores = {};
    for (const [key, value] of Object.entries(
      data.lighthouseResult.categories,
    )) {
      scores[key] = Math.round(value.score * 100);
    }

    return { ok: true, data: scores };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── 5. GA4 昨日流量 ──────────────────────────────────────────────

async function fetchGA4Traffic() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const serviceAccountKey = process.env.GA4_SERVICE_ACCOUNT_KEY;

  if (!propertyId || !serviceAccountKey) {
    return { ok: false, error: "缺少 GA4 環境變數" };
  }

  try {
    const credentials = JSON.parse(serviceAccountKey);
    const client = new BetaAnalyticsDataClient({ credentials });

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    });

    if (!response.rows || response.rows.length === 0) {
      return { ok: true, data: { activeUsers: 0, screenPageViews: 0, bounceRate: "0%", averageSessionDuration: "0s" } };
    }

    const row = response.rows[0];
    return {
      ok: true,
      data: {
        activeUsers: row.metricValues[0].value,
        screenPageViews: row.metricValues[1].value,
        bounceRate: `${(parseFloat(row.metricValues[2].value) * 100).toFixed(1)}%`,
        averageSessionDuration: `${parseFloat(row.metricValues[3].value).toFixed(0)}s`,
      },
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── HTML 報告產生 ─────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 90) return "#0cce6b";
  if (score >= 50) return "#ffa400";
  return "#ff4e42";
}

function generateHTML(sentry, actions, links, lighthouse, ga4) {
  const sectionStyle = `style="margin-bottom:24px;"`;
  const tableStyle = `style="border-collapse:collapse;width:100%;font-size:14px;"`;
  const thStyle = `style="border:1px solid #ddd;padding:8px 12px;background:#f5f5f5;text-align:left;"`;
  const tdStyle = `style="border:1px solid #ddd;padding:8px 12px;"`;
  const errorStyle = `style="color:#999;font-style:italic;"`;

  // Sentry section
  let sentryHtml;
  if (!sentry.ok) {
    sentryHtml = `<p ${errorStyle}>無法取得 Sentry 資料：${escapeHtml(sentry.error)}</p>`;
  } else if (sentry.data.length === 0) {
    sentryHtml = `<p style="color:#0cce6b;">過去 24 小時無錯誤</p>`;
  } else {
    sentryHtml = `<table ${tableStyle}>
      <tr><th ${thStyle}>錯誤標題</th><th ${thStyle}>次數</th><th ${thStyle}>連結</th></tr>
      ${sentry.data.map((i) => `<tr><td ${tdStyle}>${escapeHtml(i.title)}</td><td ${tdStyle}>${escapeHtml(i.count)}</td><td ${tdStyle}><a href="${escapeHtml(i.link)}">查看</a></td></tr>`).join("")}
    </table>`;
  }

  // Actions section
  let actionsHtml;
  if (!actions.ok) {
    actionsHtml = `<p ${errorStyle}>無法取得 GitHub Actions 資料：${escapeHtml(actions.error)}</p>`;
  } else if (actions.data.length === 0) {
    actionsHtml = `<p style="color:#0cce6b;">過去 24 小時無失敗的 Actions runs</p>`;
  } else {
    actionsHtml = `<table ${tableStyle}>
      <tr><th ${thStyle}>Workflow</th><th ${thStyle}>分支</th><th ${thStyle}>連結</th></tr>
      ${actions.data.map((r) => `<tr><td ${tdStyle}>${escapeHtml(r.name)}</td><td ${tdStyle}>${escapeHtml(r.branch)}</td><td ${tdStyle}><a href="${escapeHtml(r.link)}">查看</a></td></tr>`).join("")}
    </table>`;
  }

  // Links section
  let linksHtml;
  if (!links.ok) {
    linksHtml = `<p ${errorStyle}>無法執行壞連結檢查：${escapeHtml(links.error)}</p>`;
  } else if (links.data.length === 0) {
    linksHtml = `<p style="color:#0cce6b;">所有 ${links.total} 個連結正常</p>`;
  } else {
    linksHtml = `<p>共 ${links.total} 個連結，${links.data.length} 個異常：</p>
    <table ${tableStyle}>
      <tr><th ${thStyle}>URL</th><th ${thStyle}>狀態</th></tr>
      ${links.data.map((l) => `<tr><td ${tdStyle}>${escapeHtml(l.url)}</td><td ${tdStyle}>${escapeHtml(l.status)}</td></tr>`).join("")}
    </table>`;
  }

  // Lighthouse section
  let lighthouseHtml;
  if (!lighthouse.ok) {
    lighthouseHtml = `<p ${errorStyle}>無法取得 Lighthouse 資料：${escapeHtml(lighthouse.error)}</p>`;
  } else {
    const labels = {
      performance: "Performance",
      accessibility: "Accessibility",
      "best-practices": "Best Practices",
      seo: "SEO",
    };
    lighthouseHtml = `<table ${tableStyle}>
      <tr><th ${thStyle}>類別</th><th ${thStyle}>分數</th></tr>
      ${Object.entries(lighthouse.data)
        .map(
          ([key, score]) =>
            `<tr><td ${tdStyle}>${labels[key] || key}</td><td ${tdStyle}><span style="color:${scoreColor(score)};font-weight:bold;">${score}</span></td></tr>`,
        )
        .join("")}
    </table>`;
  }

  // GA4 section
  let ga4Html;
  if (!ga4.ok) {
    ga4Html = `<p ${errorStyle}>無法取得 GA4 資料：${escapeHtml(ga4.error)}</p>`;
  } else {
    const labels = {
      activeUsers: "活躍使用者",
      screenPageViews: "頁面瀏覽數",
      bounceRate: "跳出率",
      averageSessionDuration: "平均工作階段時間",
    };
    ga4Html = `<table ${tableStyle}>
      <tr><th ${thStyle}>指標</th><th ${thStyle}>數值</th></tr>
      ${Object.entries(ga4.data)
        .map(
          ([key, val]) =>
            `<tr><td ${tdStyle}>${labels[key] || key}</td><td ${tdStyle}>${val}</td></tr>`,
        )
        .join("")}
    </table>`;
  }

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="utf-8"><title>Ray's Notes 每日報告 - ${reportDate}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:700px;margin:0 auto;padding:20px;color:#333;">
  <h1 style="border-bottom:2px solid #333;padding-bottom:8px;">Ray's Notes 每日報告 - ${reportDate}</h1>

  <div ${sectionStyle}>
    <h2>1. Sentry 昨日錯誤</h2>
    ${sentryHtml}
  </div>

  <div ${sectionStyle}>
    <h2>2. GitHub Actions 失敗 Runs</h2>
    ${actionsHtml}
  </div>

  <div ${sectionStyle}>
    <h2>3. 壞連結檢查</h2>
    ${linksHtml}
  </div>

  <div ${sectionStyle}>
    <h2>4. Lighthouse 分數</h2>
    ${lighthouseHtml}
  </div>

  <div ${sectionStyle}>
    <h2>5. GA4 昨日流量（${yesterdayStr}）</h2>
    ${ga4Html}
  </div>

  <hr style="margin-top:32px;">
  <p style="font-size:12px;color:#999;">
    <a href="${process.env.SENTRY_ORG && process.env.SENTRY_PROJECT ? `https://sentry.io/organizations/${escapeHtml(process.env.SENTRY_ORG)}/issues/?project=${escapeHtml(process.env.SENTRY_PROJECT)}` : "#"}">Sentry Dashboard</a> |
    <a href="https://github.com/${REPO}/actions">GitHub Actions</a> |
    <a href="${process.env.GA4_PROPERTY_ID ? `https://analytics.google.com/analytics/web/#/p${escapeHtml(process.env.GA4_PROPERTY_ID)}/reports` : "#"}">GA4 Dashboard</a>
  </p>
</body>
</html>`;
}

// ─── 純文字摘要 ───────────────────────────────────────────────────

function generateSummary(sentry, actions, links, lighthouse, ga4) {
  const lines = [`# Ray's Notes 每日報告 - ${reportDate}`, ""];

  // Sentry
  lines.push("## 1. Sentry 昨日錯誤");
  if (!sentry.ok) {
    lines.push(`> 無法取得：${sentry.error}`);
  } else if (sentry.data.length === 0) {
    lines.push("過去 24 小時無錯誤");
  } else {
    sentry.data.forEach((i) => {
      lines.push(`- **${i.title}** (${i.count} 次) - [查看](${i.link})`);
    });
  }
  lines.push("");

  // Actions
  lines.push("## 2. GitHub Actions 失敗 Runs");
  if (!actions.ok) {
    lines.push(`> 無法取得：${actions.error}`);
  } else if (actions.data.length === 0) {
    lines.push("過去 24 小時無失敗的 Actions runs");
  } else {
    actions.data.forEach((r) => {
      lines.push(`- **${r.name}** (${r.branch}) - [查看](${r.link})`);
    });
  }
  lines.push("");

  // Links
  lines.push("## 3. 壞連結檢查");
  if (!links.ok) {
    lines.push(`> 無法執行：${links.error}`);
  } else if (links.data.length === 0) {
    lines.push(`所有 ${links.total} 個連結正常`);
  } else {
    lines.push(`共 ${links.total} 個連結，${links.data.length} 個異常：`);
    links.data.forEach((l) => {
      lines.push(`- ${l.url} (${l.status})`);
    });
  }
  lines.push("");

  // Lighthouse
  lines.push("## 4. Lighthouse 分數");
  if (!lighthouse.ok) {
    lines.push(`> 無法取得：${lighthouse.error}`);
  } else {
    const labels = {
      performance: "Performance",
      accessibility: "Accessibility",
      "best-practices": "Best Practices",
      seo: "SEO",
    };
    Object.entries(lighthouse.data).forEach(([key, score]) => {
      const icon = score >= 90 ? "🟢" : score >= 50 ? "🟡" : "🔴";
      lines.push(`- ${labels[key] || key}: ${icon} ${score}`);
    });
  }
  lines.push("");

  // GA4
  lines.push(`## 5. GA4 昨日流量（${yesterdayStr}）`);
  if (!ga4.ok) {
    lines.push(`> 無法取得：${ga4.error}`);
  } else {
    const labels = {
      activeUsers: "活躍使用者",
      screenPageViews: "頁面瀏覽數",
      bounceRate: "跳出率",
      averageSessionDuration: "平均工作階段時間",
    };
    Object.entries(ga4.data).forEach(([key, val]) => {
      lines.push(`- ${labels[key] || key}: ${val}`);
    });
  }
  lines.push("");

  lines.push("---");
  lines.push(
    `[Sentry](${process.env.SENTRY_ORG ? `https://sentry.io/organizations/${process.env.SENTRY_ORG}/issues/` : "#"}) | [GitHub Actions](https://github.com/${REPO}/actions) | [GA4](${process.env.GA4_PROPERTY_ID ? `https://analytics.google.com/analytics/web/#/p${process.env.GA4_PROPERTY_ID}/reports` : "#"})`,
  );

  return lines.join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log(`Generating daily report for ${reportDate}...`);

  const [sentry, actions, links, lighthouse, ga4] = await Promise.all([
    fetchSentryErrors(),
    fetchFailedActions(),
    checkBrokenLinks(),
    fetchLighthouseScores(),
    fetchGA4Traffic(),
  ]);

  console.log(
    `Sentry: ${sentry.ok ? `${sentry.data.length} issues` : sentry.error}`,
  );
  console.log(
    `Actions: ${actions.ok ? `${actions.data.length} failures` : actions.error}`,
  );
  console.log(
    `Links: ${links.ok ? `${links.data.length} broken / ${links.total} total` : links.error}`,
  );
  console.log(
    `Lighthouse: ${lighthouse.ok ? JSON.stringify(lighthouse.data) : lighthouse.error}`,
  );
  console.log(`GA4: ${ga4.ok ? JSON.stringify(ga4.data) : ga4.error}`);

  const html = generateHTML(sentry, actions, links, lighthouse, ga4);
  const summary = generateSummary(sentry, actions, links, lighthouse, ga4);

  writeFileSync("/tmp/daily-report.html", html, "utf-8");
  writeFileSync("/tmp/daily-report-summary.txt", summary, "utf-8");

  console.log("Report written to /tmp/daily-report.html");
  console.log("Summary written to /tmp/daily-report-summary.txt");
}

main().catch((e) => {
  console.error("Report generation failed:", e);
  process.exit(1);
});
