import React from 'react';
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
}

/**
 * Profile view for a creator with follow and zap stats.
 */
export const Profile: React.FC<ProfileProps> = ({
  creatorId,
  name,
  avatarUrl,
  clips,
}) => {
  const followers = useSocialStore(
    (s) => s.creators[creatorId]?.followers ?? 0,
  );
  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center gap-4">
        <Avatar name={name} url={avatarUrl} />
        <div className="flex flex-col">
          <h2 className="font-semibold">{name}</h2>
          <ZapStats creatorId={creatorId} />
          <span className="text-sm text-gray-600">{followers} followers</span>
        </div>
        <div className="ml-auto">
          <FollowBtn creatorId={creatorId} />
        </div>
      </header>
      <ProfileGrid clips={clips} />
    </div>
  );
};
