/*
 * Licensed under GPL-3.0-or-later
 * React component for Timeline.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SwipeContainer } from './SwipeContainer';
import { TimelineCard } from './TimelineCard';
import { BalanceChip } from './BalanceChip';
import { BottomNav } from './BottomNav';
import { WalletModal } from './WalletModal';
import { SkeletonLoader } from './SkeletonLoader';
import { createRPCClient } from '../rpc';
import type { Post } from '../types';
import { useSocialStore } from './socialStore';
import { useFilters } from '../store/filters';

/**
 * Timeline that renders SSB posts inside `TimelineCard`s. Navigation between
 * cards is handled by `SwipeContainer`, which supports arrow keys and touch
 * gestures.
 */
export const Timeline: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const ssbClient = useRef<ReturnType<typeof createRPCClient> | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const isModerator = useSocialStore((s) => s.isModerator);
  const tags = useFilters((s) => s.tags);

  // create worker client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const worker = new Worker(
      new URL('../../packages/worker-ssb/index.ts', import.meta.url),
      { type: 'module' }
    );
    ssbClient.current = createRPCClient(worker);
    return () => worker.terminate();
  }, []);

  // load posts when filters change
  useEffect(() => {
    if (!ssbClient.current) return;
    ssbClient
      .current('queryFeed', { includeTags: tags })
      .then((p) => setPosts(p as Post[]))
      .catch(() => setPosts([]));
  }, [tags]);

  const handleReport = useCallback(
    (postId: string, reason: string) => {
      ssbClient.current?.('reportPost', postId, reason);
    },
    []
  );

  const handleBlock = useCallback((pubKey: string) => {
    ssbClient.current?.('blockUser', pubKey);
    setPosts((prev) =>
      prev ? prev.filter((p) => p.author.pubkey !== pubKey) : prev
    );
  }, []);

  return (
    <div className="relative flex h-screen flex-col">
      <header className="flex justify-end p-2">
        <button
          onClick={() => setWalletOpen(true)}
          aria-label="Open wallet"
          className="min-tap"
        >
          <BalanceChip />
        </button>
      </header>
      <WalletModal open={walletOpen} onOpenChange={setWalletOpen} />
      <div className="relative flex-1 flex justify-center">
        <div className="w-full max-w-screen-md">
          {posts === null ? (
            <SkeletonLoader className="w-full h-[90vh]" />
          ) : (
            <SwipeContainer>
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
                  onReport={handleReport}
                  onBlock={handleBlock}
                  reports={post.reports?.length ?? 0}
                  isModerator={isModerator}
                />
              ))}
            </SwipeContainer>
          )}
        </div>
        <div className="pointer-events-none fixed inset-y-0 left-0 hidden w-1/4 bg-subtleBg/40 backdrop-blur lg:block" />
        <div className="pointer-events-none fixed inset-y-0 right-0 hidden w-1/4 bg-subtleBg/40 backdrop-blur lg:block" />
      </div>
      <BottomNav />
    </div>
  );
};

