/*
 * Licensed under GPL-3.0-or-later
 * React component for PwaPrompt.
 */
import React from 'react';
import { InstallBanner } from './InstallBanner';

/** Handles showing PWA install prompt after 3 visits and offline banner when offline. */
export const PwaPrompt: React.FC = () => {
  const [showInstall, setShowInstall] = React.useState(false);
  const [offline, setOffline] = React.useState(
    typeof navigator !== 'undefined' && !navigator.onLine,
  );
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // track visits
    const visits = parseInt(localStorage.getItem('visits') || '0', 10) + 1;
    localStorage.setItem('visits', visits.toString());
    if (visits >= 3) setShowInstall(true);

    const updateOffline = () => setOffline(!navigator.onLine);
    window.addEventListener('online', updateOffline);
    window.addEventListener('offline', updateOffline);
    return () => {
      window.removeEventListener('online', updateOffline);
      window.removeEventListener('offline', updateOffline);
    };
  }, []);

  React.useEffect(() => {
    setVisible(offline);
  }, [offline]);

  if (offline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-0 left-0 right-0 bg-red-600 dark:bg-red-700 p-2 text-center text-white transition-opacity duration-300 motion-reduce:transition-none ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        You are offline
      </div>
    );
  }

  if (showInstall) {
    return <InstallBanner onFinish={() => setShowInstall(false)} />;
  }

  return null;
};
