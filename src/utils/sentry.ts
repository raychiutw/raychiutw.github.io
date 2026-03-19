import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'https://2a33985c93b5f0a599d57cd1cd778754@o4511070098161664.ingest.us.sentry.io/4511070100586496',
  environment: import.meta.env.PROD ? 'production' : 'development',
  // 只在 production 啟用
  enabled: import.meta.env.PROD,
  // 取樣率：100% 錯誤都送
  sampleRate: 1.0,
  // 忽略已知的非關鍵錯誤
  ignoreErrors: ['ResizeObserver loop', 'Non-Error promise rejection'],
});

export default Sentry;
