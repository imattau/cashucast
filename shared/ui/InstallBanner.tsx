/*
 * Licensed under GPL-3.0-or-later
 * React component for InstallBanner.
 */
import React from 'react';

export interface InstallBannerProps {
  onFinish: () => void;
}

/** Step prompting the user to install the PWA. */
export const InstallBanner: React.FC<InstallBannerProps> = ({ onFinish }) => {
  const [deferred, setDeferred] = React.useState<any>(null);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferred) {
      onFinish();
      return;
    }
    deferred.prompt();
    try {
      await deferred.userChoice;
    } finally {
      setDeferred(null);
      onFinish();
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">Install App</h2>
      <p className="mb-4">Add this app to your home screen.</p>
      <button
        onClick={install}
        className="rounded bg-primary px-4 py-2 min-tap"
        autoFocus
      >
        {deferred ? 'Install' : 'Continue'}
      </button>
    </div>
  );
};
