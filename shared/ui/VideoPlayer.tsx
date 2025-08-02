import React from 'react';
import { createRPCClient } from '../rpc';
import { SkeletonLoader } from './SkeletonLoader';

export interface VideoPlayerProps {
  /** Magnet link for the video stream */
  magnet: string;
}

/**
 * VideoPlayer loads a video stream via the torrent worker using the provided
 * magnet link. While the worker resolves the stream URL a skeleton loader is
 * displayed to avoid layout shifts. The resulting video autoplays muted so it
 * can start without user interaction.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({ magnet }) => {
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

  if (!src) {
    return <SkeletonLoader className="w-full h-full" />;
  }

  return (
    <video
      className="h-full w-full object-cover"
      src={src}
      playsInline
      muted
      loop
      autoPlay
    />
  );
};
