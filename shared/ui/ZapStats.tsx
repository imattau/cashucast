import React from 'react';
import { useSocialStore } from './socialStore';

export interface ZapStatsProps {
  creatorId: string;
}

/**
 * Displays total zapped sats for a creator.
 */
export const ZapStats: React.FC<ZapStatsProps> = ({ creatorId }) => {
  const zaps = useSocialStore((s) => s.creators[creatorId]?.zaps ?? 0);
  return <span className="text-sm text-gray-600">{zaps} sats</span>;
};
