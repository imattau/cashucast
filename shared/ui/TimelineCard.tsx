import React from 'react';
import { ZapButton } from './ZapButton';
import { useSocialStore } from './socialStore';

export interface TimelineCardProps {
  /** Author or channel name */
  author: string;
  /** Unique id for the author to sync stats */
  creatorId?: string;
  /** Video or media content */
  children?: React.ReactNode;
  /** Called with sat amount when user zaps */
  onZap?: (amount: number) => void;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  author,
  creatorId = author,
  children,
  onZap,
}) => {
  const addZap = useSocialStore((s) => s.addZap);
  const handleZap = (amt: number) => {
    addZap(creatorId, amt);
    onZap?.(amt);
  };
  return (
    <article className="h-[90vh] w-full bg-white rounded-card shadow-sm flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gray-200">
        {children ?? 'Video'}
      </div>
      <footer className="p-4 flex items-center justify-between">
        <span className="font-semibold">{author}</span>
        {onZap && <ZapButton onZap={handleZap} />}
      </footer>
    </article>
  );
};
