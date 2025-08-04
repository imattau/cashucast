/*
 * Licensed under GPL-3.0-or-later
 * React component for ActionColumn.
 */
import { Zap, MessageCircle, Repeat } from 'lucide-react';

declare const workerSsb: { publish: (data: any) => void };
declare function zap(post: any): void;
declare function openComments(post: any): void;

/**
 * Vertical column of action buttons for interacting with a post.
 *
 * Expects a `post` object with:
 * - `id`: unique identifier of the post.
 * - `zaps?`: number of zap donations.
 * - `comments?`: number of comments.
 * - `boosters?`: array of user identifiers who boosted.
 *
 * Worker interactions:
 * - `workerSsb.publish` when boosting a post.
 * - `zap` to send a zap to the post's creator.
 * - `openComments` to display the post's comments.
 *
 * Enables user actions to boost, zap, and open comments for the given post.
 */
export default function ActionColumn({ post }: { post: any }) {
  const { zaps, comments, boosters } = post;
  return (
    <div className="absolute bottom-20 right-4 z-20 flex flex-col items-center gap-4 text-white">
      <button
        aria-label="Boost"
        onClick={() => workerSsb.publish({ type: 'repost', link: post.id })}
        className="flex flex-col items-center transition hover:scale-110"
      >
        <Repeat size={28} />
        <span className="text-xs">{boosters?.length || 0}</span>
      </button>

      <button
        aria-label="Zap"
        onClick={() => zap(post)}
        className="flex flex-col items-center transition hover:scale-110"
      >
        <Zap size={28} />
        <span className="text-xs">{zaps || 0}</span>
      </button>

      <button
        aria-label="Comment"
        onClick={() => openComments(post)}
        className="flex flex-col items-center transition hover:scale-110"
      >
        <MessageCircle size={28} />
        <span className="text-xs">{comments || 0}</span>
      </button>
    </div>
  );
}
