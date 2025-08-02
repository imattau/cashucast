import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SwipeContainer } from './SwipeContainer';
import { TimelineCard } from './TimelineCard';
import { BalanceChip } from './BalanceChip';
import { BottomNav } from './BottomNav';
import { createRPCClient } from '../rpc';

interface Post {
  id: string;
  author: { name: string; pubkey: string };
  text: string;
}

/**
 * Timeline that renders SSB posts inside `TimelineCard`s. Navigation between
 * cards is handled by `SwipeContainer`, which supports arrow keys and touch
 * gestures. Zaps trigger the Cashu RPC.
 */
export const Timeline: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const cashuClient = useRef<ReturnType<typeof createRPCClient> | null>(null);

  // load posts from the SSB worker
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const worker = new Worker(
      new URL('../../packages/worker-ssb/index.ts', import.meta.url),
      { type: 'module' }
    );
    const call = createRPCClient(worker);
    call('queryFeed', {})
      .then((p) => setPosts(p as Post[]))
      .catch(() => setPosts([]));
    return () => worker.terminate();
  }, []);

  // prepare Cashu RPC client for zaps
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const worker = new Worker(
      new URL('../../packages/worker-cashu/index.ts', import.meta.url),
      { type: 'module' }
    );
    cashuClient.current = createRPCClient(worker);
    return () => worker.terminate();
  }, []);

  const makeZapHandler = useCallback(
    (post: Post) => (amount: number) => {
      cashuClient.current?.('sendZap', post.author.pubkey, amount, post.id);
    },
    []
  );

  return (
    <div className="relative flex h-screen flex-col">
      <header className="flex justify-end p-2">
        <BalanceChip />
      </header>
      <div className="relative flex-1 flex justify-center">
        <div className="w-full max-w-screen-md">
          <SwipeContainer>
            {posts.map((post) => (
              <TimelineCard
                key={post.id}
                author={post.author.name}
                creatorId={post.author.pubkey}
                onZap={makeZapHandler(post)}
              >
                <div className="flex h-full items-center justify-center p-4">
                  {post.text}
                </div>
              </TimelineCard>
            ))}
          </SwipeContainer>
        </div>
        <div className="pointer-events-none fixed inset-y-0 left-0 hidden w-1/4 bg-gray-100/40 backdrop-blur lg:block" />
        <div className="pointer-events-none fixed inset-y-0 right-0 hidden w-1/4 bg-gray-100/40 backdrop-blur lg:block" />
      </div>
      <BottomNav />
    </div>
  );
};

