import React from 'react';

const shimmerStyle = `
  @keyframes skeleton-shimmer {
    100% { transform: translateX(100%); }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('skeleton-loader-style')) {
  const style = document.createElement('style');
  style.id = 'skeleton-loader-style';
  style.textContent = shimmerStyle;
  document.head.appendChild(style);
}

export interface SkeletonLoaderProps {
  className?: string;
}

/**
 * SkeletonLoader renders a shimmer animation placeholder used while content
 * is loading to prevent layout shifts.
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className }) => {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className ?? ''}`}>
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
        style={{ animation: 'skeleton-shimmer 1.5s infinite' }}
      />
    </div>
  );
};
