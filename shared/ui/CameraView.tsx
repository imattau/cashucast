/*
 * Licensed under GPL-3.0-or-later
 * React component for CameraView.
 */
import React from 'react';
import { UploadDropzone } from './UploadDropzone';
import { SkeletonLoader } from './SkeletonLoader';

/**
 * CameraView tries to access the user's webcam and provide a capture button.
 * If the webcam cannot be accessed, it falls back to the UploadDropzone.
 */
export interface CameraViewProps {
  onCapture: (blob: Blob | File) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [error, setError] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setReady(true);
        }
      } catch (err) {
        setError(true);
      }
    })();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => blob && onCapture(blob), 'image/png');
    }
  };

  if (error) {
    return <UploadDropzone onFile={onCapture} />;
  }

  return (
    <div>
      <div className="relative w-full">
        {!ready && <SkeletonLoader className="w-full aspect-video" />}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full ${ready ? 'block' : 'hidden'}`}
        />
      </div>
      <button className="mt-2 min-tap" onClick={handleCapture}>
        Capture
      </button>
    </div>
  );
};

