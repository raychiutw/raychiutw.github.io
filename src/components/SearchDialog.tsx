import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchResult {
  url: string;
  meta: { title: string };
  excerpt: string;
}

export default function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pagefindRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Load pagefind on first open
  const loadPagefind = useCallback(async () => {
    if (pagefindRef.current) return;
    try {
      // Pagefind is generated at build time into /pagefind/pagefind.js.
      // Use a variable to prevent Vite from trying to resolve/bundle it.
      const pagefindPath = `${window.location.origin}/pagefind/pagefind.js`;
      const pf = await import(/* @vite-ignore */ pagefindPath);
      await pf.init();
      pagefindRef.current = pf;
    } catch {
      setIsDev(true);
    }
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Listen for custom event from the search button in Header
  useEffect(() => {
    const handler = () => setIsOpen(true);
    document.addEventListener('open-search', handler);
    return () => document.removeEventListener('open-search', handler);
  }, []);

  // Focus input when opening, load pagefind
  useEffect(() => {
    if (isOpen) {
      loadPagefind();
      // Small delay to ensure the dialog is rendered
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } else {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen, loadPagefind]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!pagefindRef.current) {
        setHasSearched(true);
        return;
      }
      setIsLoading(true);
      try {
        const search = await pagefindRef.current.search(query);
        const data = await Promise.all(search.results.slice(0, 10).map((r: any) => r.data()));
        setResults(
          data.map((d: any) => ({
            url: d.url,
            meta: { title: d.meta?.title || d.url },
            excerpt: d.excerpt,
          })),
        );
      } catch {
        setResults([]);
      }
      setHasSearched(true);
      setIsLoading(false);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl"
        style={{
          backgroundColor: 'var(--bg)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 1rem',
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--text-muted)', flexShrink: 0 }}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="搜尋文章..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-base outline-hidden"
            style={{
              color: 'var(--text)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
            aria-label="搜尋"
          />
          <kbd
            className="hidden text-xs sm:inline-block"
            style={{
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto px-2 py-2" style={{ minHeight: '80px' }}>
          {isDev && (
            <p className="px-3 py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              搜尋功能僅在建置後可用。請先執行 <code>pnpm build</code> 再使用{' '}
              <code>pnpm preview</code>。
            </p>
          )}

          {!isDev && isLoading && (
            <p className="px-3 py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              搜尋中...
            </p>
          )}

          {!isDev && !isLoading && hasSearched && results.length === 0 && (
            <p className="px-3 py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              找不到相關文章，請嘗試其他關鍵字
            </p>
          )}

          {!isDev && !isLoading && results.length > 0 && (
            <ul className="list-none p-0 m-0">
              {results.map((result, i) => (
                <li key={result.url + i}>
                  <a
                    href={result.url}
                    className="block rounded-lg px-3 py-2 no-underline transition-colors duration-150"
                    style={{ color: 'var(--text)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--border)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: 'var(--text)',
                      }}
                    >
                      {result.meta.title}
                    </div>
                    {result.excerpt && (
                      <div
                        className="mt-1 text-xs leading-relaxed"
                        style={{ color: 'var(--text-muted)' }}
                        dangerouslySetInnerHTML={{ __html: result.excerpt }}
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {!isDev && !isLoading && !hasSearched && (
            <p className="px-3 py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              輸入關鍵字搜尋文章
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
