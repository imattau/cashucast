import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

/**
 * TranscodeModal simulates ffmpeg transcoding with a progress bar.
 * When transcoding completes it returns a magnet link and displays
 * a snackbar confirmation.
 */
export interface TranscodeModalProps {
  open: boolean;
  file?: File | Blob;
  onComplete: (magnet: string) => void;
}

export const TranscodeModal: React.FC<TranscodeModalProps> = ({ open, file, onComplete }) => {
  const [progress, setProgress] = React.useState(0);
  const [showSnackbar, setShowSnackbar] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          const magnet = `magnet:?xt=urn:btih:${Math.random().toString(36).slice(2)}`;
          onComplete(magnet);
          setShowSnackbar(true);
          return 100;
        }
        return p + 10;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [open, onComplete, file]);

  return (
    <>
      <Dialog.Root open={open}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded shadow">
            <Dialog.Title>Transcoding</Dialog.Title>
            <div className="w-64 bg-gray-200 h-2 mt-2">
              <div className="bg-blue-500 h-2" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-center">{progress}%</p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {showSnackbar && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded">
          Transcode complete
        </div>
      )}
    </>
  );
};

