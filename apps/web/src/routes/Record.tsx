/*
 * Licensed under GPL-3.0-or-later
 * React component for Record.
 */
import React from 'react';
import { VideoRecorder } from '../../shared/ui';

declare global {
  interface Window {
    recordedFile?: File;
  }
}

const Record: React.FC = () => {
  const handleComplete = React.useCallback((blob: Blob) => {
    if (typeof window !== 'undefined') {
      window.recordedFile = new File([blob], 'recording.webm', {
        type: 'video/webm',
      });
      window.history.pushState(null, '', '/compose');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, []);

  return (
    <div className="p-4">
      <VideoRecorder onComplete={handleComplete} />
    </div>
  );
};

export default Record;

