import React from 'react';
import { ZapButton } from './ZapButton';
import { useSocialStore } from './socialStore';
import { VideoPlayer } from './VideoPlayer';

export interface TimelineCardProps {
  /** Author or channel name */
  author: string;
  /** Unique id for the author to sync stats */
  creatorId?: string;
  /** Magnet link for the clip to play */
  magnet: string;
  /** Called with sat amount when user zaps */
  onZap?: (amount: number) => void;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  author,
  creatorId = author,
  magnet,
  onZap,
}) => {
  const addZap = useSocialStore((s) => s.addZap);
  const [sending, setSending] = React.useState(false);
  const handleZap = async (amt: number) => {
    addZap(creatorId, amt);
    if (onZap) {
      try {
        setSending(true);
        await onZap(amt);
      } finally {
        setSending(false);
      }
    }
  };
  return (
    <article className="h-[90vh] w-full bg-white rounded-card shadow-sm flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gray-200">
        <VideoPlayer magnet={magnet} />
      </div>
      <footer className="p-4 flex items-center justify-between">
        <span className="font-semibold">{author}</span>
        {onZap && <ZapButton onZap={handleZap} disabled={sending} />}
      </footer>
    </article>
  );
};
