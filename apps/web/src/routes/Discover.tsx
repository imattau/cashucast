import React, { useEffect, useRef, useState } from 'react';
import { createRPCClient } from '../../../shared/rpc';
import type { Post } from '../../../shared/types';
import { useSearch } from '../../../shared/store/search';
import { TimelineCard } from '../components/TimelineCard';

interface TagCount { tag: string; count: number }

export default function Discover() {
  const [tags, setTags] = useState<TagCount[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const rpcRef = useRef<ReturnType<typeof createRPCClient>>();
  const { setOpen, setQ } = useSearch();

  useEffect(() => {
    const worker = new Worker(
      new URL('../../../../packages/worker-ssb/index.ts', import.meta.url),
      { type: 'module' }
    );
    const rpc = createRPCClient(worker);
    rpcRef.current = rpc;
    rpc('topTags', { since: Date.now() - 48 * 60 * 60 * 1000, limit: 20 }).then((t) =>
      setTags(t as TagCount[])
    );
    rpc('queryFeed', {}).then((p) => setPosts(p as Post[]));
    return () => worker.terminate();
  }, []);

  const onTag = (tag: string) => {
    setOpen(true);
    setQ('#' + tag);
    window.history.pushState(null, '', '/search');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tags.map((t) => (
          <button
            key={t.tag}
            onClick={() => onTag(t.tag)}
            className="shrink-0 rounded-full bg-gray-200 px-3 py-1"
          >
            #{t.tag}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {posts.map((post) => (
          <TimelineCard
            key={post.id}
            name={post.author.name}
            avatarUrl={post.author.avatarUrl}
            text={post.text}
            magnet={post.magnet}
            nsfw={post.nsfw}
            postId={post.id}
            authorPubKey={post.author.pubkey}
            reports={post.reports?.length ?? 0}
            boosters={post.boosters}
          />
        ))}
      </div>
    </div>
  );
}

