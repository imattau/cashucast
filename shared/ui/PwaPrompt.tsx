import React from 'react';
import { InstallBanner } from './InstallBanner';

/** Handles showing PWA install prompt after 3 visits and offline banner when offline. */
export const PwaPrompt: React.FC = () => {
  const [showInstall, setShowInstall] = React.useState(false);
  const [offline, setOffline] = React.useState(
    typeof navigator !== 'undefined' && !navigator.onLine,
  );

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

  if (offline) {
    return (
      <div className="bg-red-500 p-2 text-center text-white">
        You are offline
      </div>
    );
  }

  if (showInstall) {
    return <InstallBanner onFinish={() => setShowInstall(false)} />;
  }

  return null;
};
