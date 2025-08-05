/*
 * Licensed under GPL-3.0-or-later
 * React component for FollowBtn.
 */
import React from 'react';
import Button from '@mui/material/Button';
import { useSocialStore } from './socialStore';

export interface FollowBtnProps {
  creatorId: string;
}

/**
 * Button to follow or unfollow a creator.
 *
 * Follows Material 3 button guidance and MUI implementation:
 * https://m3.material.io/components/buttons
 * https://mui.com/material-ui/react-button/
 */
export const FollowBtn: React.FC<FollowBtnProps> = ({ creatorId }) => {
  const isFollowing = useSocialStore((s) => s.creators[creatorId]?.isFollowing ?? false);
  const toggleFollow = useSocialStore((s) => s.toggleFollow);

  return (
    <Button
      variant={isFollowing ? 'outlined' : 'contained'}
      size="small"
      onClick={() => void toggleFollow(creatorId)}
      sx={{ textTransform: 'none' }}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};
