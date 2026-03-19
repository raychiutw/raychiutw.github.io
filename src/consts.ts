export const SITE_TITLE = "Ray's Notes";
export const SITE_DESCRIPTION = '隨手寫寫，留下紀錄';
export const SITE_URL = 'https://raychiutw.github.io';

export interface NavItem {
  title: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { title: '首頁', href: '/' },
  { title: '歸檔', href: '/archives' },
  { title: '分類', href: '/categories' },
  { title: '標籤', href: '/tags' },
  { title: '關於', href: '/about' },
];
