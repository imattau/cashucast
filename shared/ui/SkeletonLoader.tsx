/*
 * Licensed under GPL-3.0-or-later
 * React component for SkeletonLoader.
 */
import React from 'react';

export interface SkeletonLoaderProps {
  className?: string;
}

/**
 * SkeletonLoader renders a shimmer animation placeholder used while content
 * is loading to prevent layout shifts.
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className }) => {
  return (
    <div className={`relative overflow-hidden bg-subtleBg ${className ?? ''}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-skeleton-shimmer" />
    </div>
  );
};
