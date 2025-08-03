import { Zap, MessageCircle, Repeat } from 'lucide-react';

declare const workerSsb: { publish: (data: any) => void };
declare function zap(post: any): void;
declare function openComments(post: any): void;

export default function ActionColumn({ post }: { post: any }) {
  const { zaps, comments, boosters } = post;
  return (
    <div className="absolute bottom-28 right-3 z-20 flex flex-col items-center gap-4 text-white">
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
