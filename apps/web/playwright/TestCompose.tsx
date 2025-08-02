import React from 'react';
import { UploadDropzone, CaptionTextarea, PublishBtn } from '../shared/ui';
import { createRPCClient } from '../shared/rpc';

export default function TestCompose() {
  const [magnet, setMagnet] = React.useState<string | null>(null);
  const [caption, setCaption] = React.useState('');

  const handleFile = (_: File) => {
    setMagnet('magnet:?xt=urn:btih:test');
  };

  const onPublish = async () => {
    if (!magnet) return;
    const worker = new Worker(new URL('../../../packages/worker-ssb/index.ts', import.meta.url), { type: 'module' });
    const call = createRPCClient(worker);
    await call('publishPost', {
      id: 't1',
      magnet,
      text: caption,
      author: { name: 'anon', pubkey: 'anon', avatarUrl: '' },
    } as any);
    worker.terminate();
  };

  return (
    <div>
      <UploadDropzone onFile={handleFile} />
      {magnet && (
        <>
          <CaptionTextarea value={caption} onChange={setCaption} />
          <PublishBtn magnet={magnet} onPublish={onPublish} />
        </>
      )}
    </div>
  );
}

