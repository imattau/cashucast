import React from 'react';
import {
  VideoPlayer,
  useSettingsStore,
  BlurOverlay,
  PostMenu,
  Avatar,
  BottomSheet,
  Profile,
  ZapButton,
} from '../../../shared/ui';
import { MessageCircle } from 'lucide-react';
import { CommentsDrawer } from './CommentsDrawer';
import BoostBadge, { setBoosters } from './BoostBadge';
import { motion } from 'framer-motion';
import { createRPCClient } from '../../../shared/rpc';

export interface TimelineCardProps {
  /** URL for the author's avatar */
  avatarUrl: string;
  /** Author or channel name */
  name: string;
  /** Caption text for the post */
  text?: string;
  /** Magnet link for the clip to play */
  magnet: string;
  /** Whether the post is marked as not safe for work */
  nsfw?: boolean;
  /** Post id for actions */
  postId?: string;
  /** Author pubkey for actions */
  authorPubKey?: string;
  /** Called when user reports */
  onReport?: (postId: string, reason: string) => void;
  /** Called when user blocks */
  onBlock?: (pubKey: string) => void;
  /** Number of reports on the post */
  reports?: number;
  /** Users who reposted this post */
  boosters?: string[];
  /** Whether the current viewer is a moderator */
  isModerator?: boolean;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  avatarUrl,
  name,
  text,
  magnet,
  nsfw,
  postId,
  authorPubKey,
  onReport,
  onBlock,
  reports = 0,
  boosters = [],
  isModerator,
}) => {
  const showNSFW = useSettingsStore((s) => s.showNSFW);
  const [revealed, setRevealed] = React.useState(false);
  const hidden = !!nsfw && !showNSFW && !revealed;
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const rpcRef = React.useRef<ReturnType<typeof createRPCClient> | null>(null);

  React.useEffect(() => {
    if (postId) setBoosters(postId, boosters);
  }, [postId, boosters]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const worker = new Worker(
      new URL('../../../../packages/worker-ssb/index.ts', import.meta.url),
      { type: 'module' }
    );
    rpcRef.current = createRPCClient(worker);
    return () => worker.terminate();
  }, []);

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
        <div className="absolute bottom-0 left-0 right-0 text-white">
          <div className={`flex items-center justify-between p-4 ${text ? 'mb-[-8px]' : ''}`}>
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
              {isModerator && reports > 0 && (
                <span className="rounded-full bg-gray-200/80 px-2 py-1 text-xs text-black">
                  ⚑ {reports}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              {postId && (
                <button
                  type="button"
                  aria-label="Open comments"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCommentsOpen(true);
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              )}
              {postId && (
                <button
                  type="button"
                  aria-label="Repost"
                  onClick={(e) => {
                    e.stopPropagation();
                    rpcRef.current?.('publish', { type: 'repost', link: postId });
                  }}
                >
                  ↻
                </button>
              )}
              {postId && <BoostBadge id={postId} />}
              {authorPubKey && postId && (
                <ZapButton receiverPk={authorPubKey} refId={postId} />
              )}
              {postId &&
                authorPubKey &&
                onReport &&
                onBlock && (
                  <PostMenu
                    postId={postId}
                    authorPubKey={authorPubKey}
                    onReport={onReport}
                    onBlock={onBlock}
                  />
                )}
            </div>
          </div>
          {text && <div className="bg-black/60 p-4 pt-8">{text}</div>}
        </div>
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

