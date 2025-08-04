/*
 * Licensed under GPL-3.0-or-later
 * React component for BlurOverlay.
 */
import React from 'react';

export interface BlurOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * BlurOverlay renders a blurred overlay covering its parent. Useful for
 * hiding sensitive content until user interaction.
 */
export const BlurOverlay: React.FC<BlurOverlayProps> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    {...props}
    className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm ${className}`}
  >
    {children}
  </div>
);

