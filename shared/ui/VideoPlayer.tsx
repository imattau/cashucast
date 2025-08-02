import React from 'react';

/**
 * VideoPlayer renders a video element sourced from a mocked magnet stream.
 * The mock stream is represented by a blob URL and the video is muted by default
 * to enable autoplay without user interaction.
 */
export const VideoPlayer: React.FC = () => {
  const [src] = React.useState(() => {
    const blob = new Blob(['mock magnet stream'], { type: 'video/mp4' });
    if (typeof URL !== 'undefined' && 'createObjectURL' in URL) {
      return (URL as any).createObjectURL(blob);
    }
    return 'blob:mock-video';
  });

  return <video className="w-full h-full" src={src} muted controls />;
};
