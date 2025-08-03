/*
 * Licensed under GPL-3.0-or-later
 * React component for Compose.
 */
import { useState, useEffect } from 'react';
import {
  UploadDropzone,
  TranscodeModal,
  CaptionTextarea,
  PublishBtn,
} from '../../shared/ui';
import { createRPCClient } from '../../shared/rpc';
import ThumbnailPicker from '../components/ThumbnailPicker';
import TagInput from '../components/TagInput';

export default function Compose() {
  const [file, setFile] = useState<File | null>(null);
  const [magnet, setMagnet] = useState<string | null>(null);
  const [thumbHash, setThumbHash] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [nsfw, setNSFW] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setMagnet(null);
    setThumbHash(null);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.recordedFile) {
      handleFile(window.recordedFile);
      window.recordedFile = undefined;
    }
  }, []);

  const onPublish = async () => {
    if (!magnet) return;
    const worker = new Worker(
      new URL('../../../../packages/worker-ssb/index.ts', import.meta.url),
      { type: 'module' },
    );
    const call = createRPCClient(worker);
    await call('publishPost', {
      id: crypto.randomUUID(),
      magnet,
      text: caption,
      nsfw,
      tags,
      thumbnail: thumbHash ?? undefined,
      ts: Date.now(),
      author: { name: 'anon', pubkey: 'anon', avatarUrl: '' },
    });
    worker.terminate();
  };

  return (
    <div className="p-4 space-y-4">
      {!file && <UploadDropzone onFile={handleFile} />}
      {file && (
        <>
          <TranscodeModal open={!magnet} file={file} onComplete={setMagnet} />
          {magnet && <ThumbnailPicker file={file} onSelect={setThumbHash} />}
          <CaptionTextarea value={caption} onChange={setCaption} />
          <TagInput value={tags} setValue={setTags} />
          <label htmlFor="nsfw" className="flex items-center gap-2">
            <input
              id="nsfw"
              name="nsfw"
              type="checkbox"
              checked={nsfw}
              onChange={(e) => setNSFW(e.target.checked)}
            />
            <span>Mark as 18+ content</span>
          </label>
          <PublishBtn
            magnet={magnet && thumbHash && tags.length <= 10 ? magnet : undefined}
            onPublish={onPublish}
          />
        </>
      )}
    </div>
  );
}

