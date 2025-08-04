/*
 * Licensed under GPL-3.0-or-later
 * React component for ActionColumn.
 */
import { Zap, MessageCircle, Repeat } from 'lucide-react';
import type { createRPCClient } from '../../shared/rpc';

/**
 * Vertical column of action buttons for interacting with a post.
 *
 * Expects a `post` object with:
 * - `id`: unique identifier of the post.
 * - `zaps?`: number of zap donations.
 * - `comments?`: number of comments.
 * - `boosters?`: array of user identifiers who boosted.
 *
 * Worker interactions are performed via the provided RPC client:
 * - `rpc('publish', { type: 'repost', link: post.id })` when boosting a post.
 * - `rpc('sendZap', post.authorPubKey, 1, post.id)` to zap the post's creator.
 *
 * Enables user actions to boost, zap, and open comments for the given post.
 */
interface ActionColumnProps {
  post: any;
  rpc: ReturnType<typeof createRPCClient> | null;
  onOpenComments: (post: any) => void;
}

export default function ActionColumn({ post, rpc, onOpenComments }: ActionColumnProps) {
  const { zaps, comments, boosters, authorPubKey, id } = post;
  return (
    <div className="absolute bottom-20 right-4 z-20 flex flex-col items-center gap-4 text-white">
      <button
        aria-label="Boost"
        onClick={() => rpc?.('publish', { type: 'repost', link: id })}
        className="flex flex-col items-center transition hover:scale-110"
      >
        <Repeat size={28} />
        <span className="text-xs">{boosters?.length || 0}</span>
      </button>

      <button
        aria-label="Zap"
        onClick={() => {
          if (authorPubKey) rpc?.('sendZap', authorPubKey, 1, id);
        }}
        className="flex flex-col items-center transition hover:scale-110"
      >
        <Zap size={28} />
        <span className="text-xs">{zaps || 0}</span>
      </button>

      <button
        aria-label="Comment"
        onClick={() => onOpenComments(post)}
        className="flex flex-col items-center transition hover:scale-110"
      >
        <MessageCircle size={28} />
        <span className="text-xs">{comments || 0}</span>
      </button>
    </div>
  );
}
