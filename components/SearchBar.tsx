'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface SearchPost {
  slug: string;
  title: string;
  category: string;
  categoryName: string;
}

const POPULAR_SEARCHES = [
  'Beard Growth',
  'Minoxidil vs Finasteride',
  'Foam vs Liquid',
  'Side Effects',
  'Women Hairline',
  'Derma Roller',
];

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchPost[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const indexLoadedRef = useRef(false);

  const loadSearchIndex = useCallback(async () => {
    if (indexLoadedRef.current) return;
    indexLoadedRef.current = true;
    setIsLoading(true);
    try {
      const res = await fetch('/search-index.json');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load search index:', err);
      indexLoadedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length < 2) {
        setResults([]);
        setTotalMatches(0);
        return;
      }

      const searchWords = query.toLowerCase().trim().split(/\s+/);
      const filtered = posts.filter((post) => {
        const haystack = `${post.title} ${post.categoryName}`.toLowerCase();
        return searchWords.every((word) => haystack.includes(word));
      });

      setTotalMatches(filtered.length);
      setResults(filtered.slice(0, 10));
      setIsOpen(true);
    }, 120);

    return () => clearTimeout(timer);
  }, [query, posts]);

  const handleQuickTag = async (tag: string) => {
    await loadSearchIndex();
    setQuery(tag);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-40" ref={searchRef}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-slate-950/40 p-2 sm:p-2.5 flex flex-col sm:flex-row gap-2.5 border border-white/30"
      >
        <div className="flex-grow flex items-center bg-slate-50 rounded-xl px-4 py-3 sm:py-0 border border-slate-200/80 focus-within:border-primary-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-200 transition-all">
          <svg
            className="w-5 h-5 text-primary-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            aria-label="Search 1,252+ Minoxidil articles and guides"
            className="w-full bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400 text-base sm:text-lg ml-3 py-2.5 outline-none"
            placeholder="Search 1,252+ guides (e.g. Beard, Finasteride, Dosage)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length >= 2) setIsOpen(true);
            }}
            onFocus={() => {
              loadSearchIndex();
              if (query.length >= 2) setIsOpen(true);
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          onClick={() => {
            loadSearchIndex();
            if (query.length >= 2) setIsOpen(true);
          }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-7 py-3.5 sm:py-3 rounded-xl font-bold text-base hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 whitespace-nowrap"
        >
          Search Guides
        </button>
      </form>

      {/* Quick Trending Search Pills */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-200/90 mr-1">
          Trending:
        </span>
        {POPULAR_SEARCHES.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleQuickTag(tag)}
            className="text-xs font-medium bg-white/10 hover:bg-primary-500 hover:text-slate-950 text-white/90 border border-white/15 px-3 py-1.5 rounded-full transition-all duration-200 backdrop-blur-sm"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Live Dropdown Results */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-[68px] left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[65vh] overflow-y-auto text-left z-50">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              {isLoading
                ? 'Loading knowledge base...'
                : totalMatches > 0
                  ? `Found ${totalMatches} matching articles (showing top ${results.length})`
                  : `No articles found for "${query}"`}
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Close [Esc]
            </button>
          </div>

          {results.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {results.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/${post.category}/${post.slug}/`}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3.5 sm:px-5 hover:bg-primary-50/70 transition-colors group"
                  >
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-800 self-start sm:self-auto min-w-[105px] text-center">
                      {post.categoryName}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-slate-800 group-hover:text-primary-700 transition-colors line-clamp-1 flex-grow">
                      {post.title}
                    </span>
                    <span className="hidden sm:inline-flex text-xs font-bold text-primary-600 group-hover:translate-x-1 transition-transform">
                      Read &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
