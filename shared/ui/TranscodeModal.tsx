/*
 * Licensed under GPL-3.0-or-later
 * React component for TranscodeModal.
 */
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { createRPCClient } from '../rpc';
import { Toast } from './Toast';

/**
 * TranscodeModal uses ffmpeg.wasm to transcode a selected file into a
 * WebM clip (limited to 300 seconds) and seeds the result via the torrent
 * worker. Progress is reported by ffmpeg and once seeding completes the
 * resulting magnet URI is returned and a snackbar is shown to the user.
 */
export interface TranscodeModalProps {
  open: boolean;
  file?: File | Blob;
  /** Called with the magnet URI of the transcoded WebM clip. */
  onComplete: (magnet: string) => void;
}

export const TranscodeModal: React.FC<TranscodeModalProps> = ({
  open,
  file,
  onComplete,
}) => {
  const [progress, setProgress] = React.useState(0);
  const [toast, setToast] = React.useState(false);

  React.useEffect(() => {
    if (!open || !file) return;
    let cancelled = false;
    setProgress(0);

    const ffmpeg = new FFmpeg();
    ffmpeg.on('progress', ({ progress: ratio }) => {
      if (!cancelled) setProgress(Math.min(100, Math.round(ratio * 100)));
    });

    const worker = new Worker(
      new URL('../../packages/worker-torrent/index.ts', import.meta.url),
      { type: 'module' }
    );
    const call = createRPCClient(worker);

    const run = async () => {
      try {
        await ffmpeg.load();
        await ffmpeg.writeFile('input', new Uint8Array(await file.arrayBuffer()));
        await ffmpeg.exec([
          '-i',
          'input',
          '-t',
          '300',
          '-c:v',
          'libvpx',
          '-c:a',
          'libopus',
          '-f',
          'webm',
          'out.webm',
        ]);
        const data = (await ffmpeg.readFile('out.webm')) as Uint8Array;
        // ffmpeg's FileData may use ArrayBufferLike; clone into a fresh
        // Uint8Array to ensure compatibility with Blob/File constructors.
        const webmFile = new File([new Uint8Array(data)], 'out.webm', {
          type: 'video/webm',
        });
        const magnet = (await call('seedFile', webmFile as any)) as string;
        if (!cancelled) {
          setProgress(100);
          onComplete(magnet);
          setToast(true);
        }
      } catch (err) {
        if (!cancelled) setProgress(100);
      } finally {
        worker.terminate();
      }
    };

    run();

    return () => {
      cancelled = true;
      worker.terminate();
    };
  }, [open, file, onComplete]);

  return (
    <>
      <Dialog.Root open={open}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-on-surface/50 dark:bg-on-surface-dark/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-100 dark:bg-surface-800 text-on-surface dark:text-on-surface-dark p-4 rounded shadow">
            <Dialog.Title>Transcoding</Dialog.Title>
            <div className="w-64 bg-subtleBg h-2 mt-2">
              <div className="bg-primary h-2" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-center">{progress}%</p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {toast && (
        <Toast
          message="Transcode complete"
          onHide={() => setToast(false)}
        />
      )}
    </>
  );
};

