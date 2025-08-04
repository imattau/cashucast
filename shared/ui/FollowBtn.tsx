/*
 * Licensed under GPL-3.0-or-later
 * React component for FollowBtn.
 */
import React from 'react';
import { useSocialStore } from './socialStore';

export interface FollowBtnProps {
  creatorId: string;
}

/**
 * Button to follow or unfollow a creator.
 */
export const FollowBtn: React.FC<FollowBtnProps> = ({ creatorId }) => {
  const isFollowing = useSocialStore((s) => s.creators[creatorId]?.isFollowing ?? false);
  const toggleFollow = useSocialStore((s) => s.toggleFollow);

  return (
    <button
      className="px-3 py-1 rounded bg-primary text-sm min-tap"
      onClick={() => toggleFollow(creatorId)}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};
