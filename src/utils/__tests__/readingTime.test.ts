import { describe, it, expect } from 'vitest';
import { calculateReadingTime, formatReadingTime } from '../readingTime';

describe('calculateReadingTime', () => {
  it('應該回傳 0 當輸入為空字串', () => {
    expect(calculateReadingTime('')).toBe(0);
    expect(calculateReadingTime('   ')).toBe(0);
  });

  it('應該回傳至少 1 分鐘（非空文字）', () => {
    expect(calculateReadingTime('hello')).toBe(1);
  });

  it('應該以每分鐘 250 字計算英文文字', () => {
    // 250 個英文單字應為 1 分鐘
    const words = Array(250).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(1);
  });

  it('應該以每分鐘 250 字計算中文字元', () => {
    // 250 個中文字應為 1 分鐘
    const chars = '字'.repeat(250);
    expect(calculateReadingTime(chars)).toBe(1);
  });

  it('應該向上取整閱讀時間', () => {
    // 251 個字應為 2 分鐘
    const words = Array(251).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(2);
  });

  it('應該正確處理中英文混合', () => {
    // 125 個中文字 + 125 個英文單字 = 250 字 = 1 分鐘
    const chinese = '字'.repeat(125);
    const english = Array(125).fill('word').join(' ');
    expect(calculateReadingTime(chinese + ' ' + english)).toBe(1);
  });

  it('應該正確處理較長文章', () => {
    // 1000 個字 = 4 分鐘
    const words = Array(1000).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(4);
  });
});

describe('formatReadingTime', () => {
  it('應該回傳格式化的閱讀時間字串', () => {
    const words = Array(250).fill('word').join(' ');
    expect(formatReadingTime(words)).toBe('1 分鐘閱讀');
  });

  it('應該正確顯示多分鐘', () => {
    const words = Array(750).fill('word').join(' ');
    expect(formatReadingTime(words)).toBe('3 分鐘閱讀');
  });
});
