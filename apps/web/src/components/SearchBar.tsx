/*
 * Licensed under GPL-3.0-or-later
 * SearchBar renders a toggleable search input that communicates with a
 * Web Worker via RPC to execute queries, keeping heavy search logic off the
 * main thread.
 */
import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { createRPCClient } from '../../shared/rpc';
import { useSearch } from '../../shared/store/search';
import type { Post } from '../../shared/types';

/**
 * Renders the search bar and coordinates search-related state.
 *
 * Reads and mutates values from the `useSearch` store:
 * - `open`: controls whether the input is visible.
 * - `q`: the current search query.
 * - `setOpen`, `setQ`, `setResults`: update helpers for the store.
 *
 * @returns Fixed-position JSX that shows an input when open or a button when collapsed.
 */
export default function SearchBar() {
  const { open, q, setOpen, setQ, setResults } = useSearch();
  const containerRef = useRef<HTMLDivElement>(null);
  const rpcRef = useRef<ReturnType<typeof createRPCClient> | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('../../../../packages/worker-ssb/index.ts', import.meta.url),
      { type: 'module' }
    );
    rpcRef.current = createRPCClient(worker);
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') collapse();
    };
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        collapse();
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  /**
   * Closes the search interface, clears query and results, and if currently on
   * the search page redirects back to the home page.
   */
  function collapse() {
    setOpen(false);
    setQ('');
    setResults([]);
    if (window.location.pathname === '/search') {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  useEffect(() => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      const rpc = rpcRef.current;
      if (!rpc) return;
      let posts: Post[] = [];
      if (q.startsWith('#')) {
        posts = (await rpc('queryFeed', { includeTags: [q.slice(1)] })) as Post[];
      } else if (q.startsWith('@')) {
        const all = (await rpc('queryFeed', {})) as Post[];
        const sub = q.slice(1).toLowerCase();
        posts = all.filter((p) =>
          p.author?.name?.toLowerCase().includes(sub)
        );
      } else {
        posts = (await rpc('searchPosts', q, 20)) as Post[];
      }
      setResults(posts);
      if (window.location.pathname !== '/search') {
        window.history.pushState(null, '', '/search');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [q, setResults]);

  return (
    <div ref={containerRef} className="fixed top-2 right-2 z-50">
      {open ? (
        <>
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <input
            id="search"
            name="search"
            autoComplete="off"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-[240px] rounded border border-gray-300 px-2 py-1"
            placeholder="Search"
          />
        </>
      ) : (
        <button
          aria-label="Search"
          onClick={() => setOpen(true)}
          className="p-2"
        >
          <Search className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

