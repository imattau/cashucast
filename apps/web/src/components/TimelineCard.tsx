/*
 * Licensed under GPL-3.0-or-later
 * React component for TimelineCard.
 */
import React from 'react';
import {
  VideoPlayer,
  useSettingsStore,
  BlurOverlay,
  Avatar,
  BottomSheet,
  Profile,
  FabRecord,
} from '../../shared/ui';
import { CommentsDrawer } from './CommentsDrawer';
import ActionColumn from './ActionColumn';
import { motion } from 'framer-motion';
import { createRPCClient } from '../../shared/rpc';

export interface TimelineCardProps {
  /** Post data for rendering and interactions */
  post: {
    id: string;
    authorAvatar: string;
    authorName: string;
    description?: string;
    magnet: string;
    nsfw?: boolean;
    authorPubKey?: string;
    zaps?: number;
    comments?: number;
    boosters?: string[];
  };
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ post }) => {
  const {
    authorAvatar: avatarUrl,
    authorName: name,
    description: text,
    magnet,
    nsfw,
    id: postId,
    authorPubKey,
  } = post;
  const showNSFW = useSettingsStore((s) => s.showNSFW);
  const [revealed, setRevealed] = React.useState(false);
  const hidden = !!nsfw && !showNSFW && !revealed;
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const rpcRef = React.useRef<ReturnType<typeof createRPCClient> | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const worker = new Worker(
      new URL('../../../../packages/worker-ssb/index.ts', import.meta.url),
      { type: 'module' }
    );
    rpcRef.current = createRPCClient(worker);

    const globals = globalThis as any;
    globals.workerSsb = {
      publish: (data: any) => rpcRef.current?.('publish', data),
    };
    globals.zap = (p: any) => {
      if (authorPubKey) {
        rpcRef.current?.('sendZap', authorPubKey, 1, p.id);
      }
    };
    globals.openComments = (p: any) => {
      if (p.id === postId) setCommentsOpen(true);
    };

    return () => {
      worker.terminate();
      delete globals.workerSsb;
      delete globals.zap;
      delete globals.openComments;
    };
  }, [postId, authorPubKey]);

  const reveal = () => setRevealed(true);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      reveal();
    }
  };

  return (
    <>
      <motion.article
        className="relative h-[90vh] w-full rounded-card shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <VideoPlayer magnet={magnet} postId={postId} />
        {postId && <ActionColumn post={post} />}
        {hidden && (
          <BlurOverlay
            aria-label="NSFW content hidden"
            role="button"
            tabIndex={0}
            onClick={reveal}
            onKeyDown={handleKeyDown}
          >
            NSFW – Tap to view
          </BlurOverlay>
        )}
        <div className="absolute inset-0 flex flex-col justify-between text-white pointer-events-none">
          <div className="p-4 pointer-events-auto">
            <button
              type="button"
              className="flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                if (authorPubKey) setProfileOpen(true);
              }}
            >
              <Avatar name={name} url={avatarUrl} size={32} />
              <span className="font-semibold">{name}</span>
            </button>
          </div>
          {text && (
            <div className="bg-gradient-to-t from-black/70 p-4 pointer-events-auto">{text}</div>
          )}
        </div>
        <FabRecord className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto" />
      </motion.article>
      {postId && (
        <CommentsDrawer
          postId={postId}
          open={commentsOpen}
          onOpenChange={setCommentsOpen}
        />
      )}
      {authorPubKey && (
        <BottomSheet open={profileOpen} onOpenChange={setProfileOpen}>
          <Profile
            creatorId={authorPubKey}
            name={name}
            avatarUrl={avatarUrl}
            clips={[]}
          />
        </BottomSheet>
      )}
    </>
  );
};

export default TimelineCard;

