/*
 * Licensed under GPL-3.0-or-later
 * React component for VideoPlayer.
 */
import React from 'react';
import { createRPCClient } from '../rpc';
import { SkeletonLoader } from './SkeletonLoader';
import { useHistory } from '../store/history';

export interface VideoPlayerProps {
  /** Magnet link for the video stream */
  magnet: string;
  /** Post identifier for history tracking */
  postId?: string;
}

/**
 * VideoPlayer loads a video stream via the torrent worker using the provided
 * magnet link. While the worker resolves the stream URL a skeleton loader is
 * displayed to avoid layout shifts. The resulting video autoplays muted so it
 * can start without user interaction.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({ magnet, postId }) => {
  const [src, setSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const worker = new Worker(
      new URL('../../packages/worker-torrent/index.ts', import.meta.url),
      { type: 'module' }
    );
    const call = createRPCClient(worker);
    let cancelled = false;
    call('stream', magnet)
      .then((url) => {
        if (!cancelled) setSrc(url as string);
      })
      .catch(() => {
        if (!cancelled) setSrc('');
      })
      .finally(() => worker.terminate());
    return () => {
      cancelled = true;
      worker.terminate();
    };
  }, [magnet]);

  if (src === null) {
    return <SkeletonLoader className="w-full h-full" />;
  }

  if (src === '') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-subtleBg text-sm">
        Failed to load video
      </div>
    );
  }

  return (
    <video
      className="h-full w-full object-cover"
      src={src}
      playsInline
      muted
      loop
      autoPlay
      onPlay={() => {
        if (postId) useHistory.getState().add(postId);
      }}
    />
  );
};
