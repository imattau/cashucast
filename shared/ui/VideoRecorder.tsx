/*
 * Licensed under GPL-3.0-or-later
 * React component for VideoRecorder.
 */
import React from 'react';

export interface VideoRecorderProps {
  /** Called when recording completes with the recorded blob */
  onComplete: (blob: Blob) => void;
}

/**
 * VideoRecorder accesses the user's webcam and microphone to record video.
 * Recording automatically stops after 300000ms (5 minutes) and the collected
 * blob is passed to the onComplete callback.
 */
const VideoRecorder: React.FC<VideoRecorderProps> = ({ onComplete }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    const chunks: BlobPart[] = [];
    let timeout: number;

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('media devices not supported');
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          onComplete(blob);
        };
        recorder.start();
        timeout = window.setTimeout(() => {
          if (recorder && recorder.state === 'recording') {
            recorder.stop();
          }
        }, 300000);
      } catch (err) {
        console.error(err);
      }
    };

    start();

    return () => {
      clearTimeout(timeout);
      if (recorder && recorder.state === 'recording') recorder.stop();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onComplete]);

  return <video ref={videoRef} autoPlay playsInline className="w-full" />;
};

export default VideoRecorder;

