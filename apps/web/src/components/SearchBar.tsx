import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { createRPCClient } from '../../shared/rpc';
import { useSearch } from '../../shared/store/search';
import type { Post } from '../../shared/types';

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

  function collapse() {
    setOpen(false);
    setQ('');
    setResults([]);
    if (window.location.pathname === '/search') {
      window.history.pushState(null, '', '/');
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
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [q, setResults]);

  return (
    <div ref={containerRef} className="fixed top-2 right-2 z-50">
      {open ? (
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-[240px] rounded border border-gray-300 px-2 py-1"
          placeholder="Search"
        />
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

