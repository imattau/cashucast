/*
 * Licensed under GPL-3.0-or-later
 * React component for Profile.
 */
import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { Avatar } from './Avatar';
import { FollowBtn } from './FollowBtn';
import { ZapStats } from './ZapStats';
import { ProfileGrid, ClipThumb } from './ProfileGrid';
import { useSocialStore } from './socialStore';

export interface ProfileProps {
  creatorId: string;
  name: string;
  avatarUrl?: string;
  clips: ClipThumb[];
  /** Whether the viewed user is blocked */
  blocked?: boolean;
}

/**
 * Profile view for a creator with follow and zap stats.
 *
 * Material 3 card spec: https://m3.material.io/components/cards/overview
 * MUI Card docs: https://mui.com/material-ui/react-card/
 */
export const Profile: React.FC<ProfileProps> = ({
  creatorId,
  name,
  avatarUrl,
  clips,
  blocked,
}) => {
  const followers = useSocialStore(
    (s) => s.creators[creatorId]?.followers ?? 0,
  );
  return (
    <Card sx={{ p: 2 }}>
      <CardHeader
        avatar={<Avatar name={name} url={avatarUrl} />}
        title={name}
        subheader={
          <div className="flex flex-col">
            <ZapStats creatorId={creatorId} />
            <span className="text-sm text-gray-600">{followers} followers</span>
          </div>
        }
        action={<FollowBtn creatorId={creatorId} />}
      />
      <CardContent sx={{ pt: 0 }}>
        {blocked && (
          <div className="rounded bg-surface dark:bg-surface-dark p-2 text-center text-sm text-gray-700 mb-4">
            You have blocked this user.
          </div>
        )}
        <ProfileGrid clips={clips} />
      </CardContent>
    </Card>
  );
};
