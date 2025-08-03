/*
 * Licensed under GPL-3.0-or-later
 * React component for ProfileGrid.
 */
import React from 'react';

export interface ClipThumb {
  id: string;
  thumbnail: string;
  title?: string;
}

export interface ProfileGridProps {
  clips: ClipThumb[];
}

/**
 * Responsive grid of clip thumbnails.
 * - Single column below 600px.
 * - Two columns from 600px up to 1024px.
 * - Three columns at widths of 1024px and above.
 */
export const ProfileGrid: React.FC<ProfileGridProps> = ({ clips }) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
    {clips.map((clip) => (
      <img
        key={clip.id}
        src={clip.thumbnail}
        alt={clip.title ?? 'clip thumbnail'}
        className="w-full aspect-video object-cover rounded"
      />
    ))}
  </div>
);
