/**
 * 計算文章預估閱讀時間
 * 以每分鐘 250 字為基準，最少顯示 1 分鐘
 */
export function calculateReadingTime(text: string): number {
  const WORDS_PER_MINUTE = 250;
  // 移除多餘空白並計算字數（中文以字元計算，英文以空白分隔計算）
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;

  // 計算中文字元數
  const chineseChars = (trimmed.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;

  // 計算英文單字數（移除中文後以空白分隔）
  const withoutChinese = trimmed.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ');
  const englishWords = withoutChinese.split(/\s+/).filter((word) => word.length > 0).length;

  const totalWords = chineseChars + englishWords;
  const minutes = Math.ceil(totalWords / WORDS_PER_MINUTE);

  return Math.max(1, minutes);
}

/**
 * 格式化閱讀時間為顯示文字
 */
export function formatReadingTime(text: string): string {
  const minutes = calculateReadingTime(text);
  return `${minutes} 分鐘閱讀`;
}
