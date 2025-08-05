/*
 * Licensed under GPL-3.0-or-later
 * React component for Avatar.
 */
import React from 'react';
import MuiAvatar from '@mui/material/Avatar';

export interface AvatarProps {
  name: string;
  url?: string;
  size?: number;
  className?: string;
}

/**
 * Renders a circular avatar image or the first letter of the name.
 *
 * Material Design 3 avatar spec:
 * https://m3.material.io/components/avatar/overview
 * MUI Avatar docs:
 * https://mui.com/material-ui/react-avatar/
 */
export const Avatar: React.FC<AvatarProps> = ({
  name,
  url,
  size = 48,
  className,
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  const baseClass =
    'rounded-full overflow-hidden bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark';
  return (
    <MuiAvatar
      alt={name}
      src={url}
      className={`${baseClass} ${className ?? ''}`}
      sx={{ width: dimension, height: dimension }}
    >
      {url ? null : name.charAt(0).toUpperCase()}
    </MuiAvatar>
  );
};

