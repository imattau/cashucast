import { useState } from 'react';
import { UploadDropzone, TranscodeModal, CaptionTextarea, PublishBtn } from '../../shared/ui';
import ThumbnailPicker from '../components/ThumbnailPicker';
import TagInput from '../components/TagInput';

export default function Compose() {
  const [file, setFile] = useState<File | null>(null);
  const [magnet, setMagnet] = useState<string | null>(null);
  const [thumbHash, setThumbHash] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleFile = (f: File) => {
    setFile(f);
    setMagnet(null);
    setThumbHash(null);
  };

  const onPublish = async () => {
    // placeholder publish logic
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
          <PublishBtn
            magnet={magnet && thumbHash && tags.length <= 10 ? magnet : undefined}
            onPublish={onPublish}
          />
        </>
      )}
    </div>
  );
}

