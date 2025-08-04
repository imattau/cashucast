/*
 * Licensed under GPL-3.0-or-later
 * React component for Avatar.
 */
import React from 'react';

export interface AvatarProps {
  name: string;
  url?: string;
  size?: number;
  className?: string;
}

/**
 * Renders a circular avatar image or the first letter of the name.
 */
export const Avatar: React.FC<AvatarProps> = ({
  name,
  url,
  size = 48,
  className,
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  const baseClass =
    'flex items-center justify-center rounded-full bg-subtleBg overflow-hidden text-gray-600';
  return (
    <div
      className={`${baseClass} ${className ?? ''}`}
      style={{ width: dimension, height: dimension }}
    >
      {url ? (
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-semibold">{name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
};

