/*
 * Licensed under GPL-3.0-or-later
 * React component for ThumbnailPicker.
 */
import { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import Dropzone from 'react-dropzone';
import { getSSB } from '../../../../packages/worker-ssb/src/instance';
import { touch } from '../../../../packages/worker-ssb/src/blobCache';

interface ThumbnailPickerProps {
  file: Blob;
  onSelect: (hash: string) => void;
}

export default function ThumbnailPicker({ file, onSelect }: ThumbnailPickerProps) {
  const [thumbs, setThumbs] = useState<{ src: string; blob: Blob }[]>([]);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      await ffmpeg.writeFile('input.mp4', new Uint8Array(await file.arrayBuffer()));
      const times = ['00:00:01', '00:00:02', '00:00:03'];
      const imgs: { src: string; blob: Blob }[] = [];
      for (let i = 0; i < times.length; i++) {
        await ffmpeg.exec(['-ss', times[i], '-i', 'input.mp4', '-frames:v', '1', `out${i}.jpg`]);
        const data = await ffmpeg.readFile(`out${i}.jpg`);
        const blob = new Blob([data], { type: 'image/jpeg' });
        imgs.push({ src: URL.createObjectURL(blob), blob });
      }
      setThumbs(imgs);
    };
    run();
  }, [file]);

  const saveBlob = async (blob: Blob) => {
    const ssb = getSSB();
    const writer = ssb.blobs.add();
    const data = new Uint8Array(await blob.arrayBuffer());
    writer.write(data);
    writer.end((_: any, hash: string) => {
      touch(hash, data.byteLength);
      onSelect(hash);
    });
  };

  const handleSelect = (blob: Blob) => {
    saveBlob(blob);
  };

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = useCallback(async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    const image = document.createElement('img');
    image.src = cropSrc;
    await new Promise((res) => (image.onload = res));
    const canvas = document.createElement('canvas');
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
    canvas.toBlob((blob) => blob && handleSelect(blob), 'image/jpeg');
  }, [cropSrc, croppedAreaPixels]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {thumbs.map((t, i) => (
          <img
            key={i}
            src={t.src}
            className="w-24 h-24 object-cover cursor-pointer"
            onClick={() => handleSelect(t.blob)}
          />
        ))}
        <Dropzone
          onDrop={(files) => {
            const f = files[0];
            if (f) setCropSrc(URL.createObjectURL(f));
          }}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              {...getRootProps()}
              className="w-24 h-24 flex items-center justify-center border-2 border-dashed cursor-pointer"
            >
              <label htmlFor="thumbnail-upload" className="sr-only">
                Upload thumbnail
              </label>
              <input {...getInputProps({ id: 'thumbnail-upload', name: 'thumbnail' })} />
              <span>Upload</span>
            </div>
          )}
        </Dropzone>
      </div>
      {cropSrc && (
        <div>
          <div className="relative w-full h-64">
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <button
            className="mt-2 rounded bg-blue-500 px-4 py-2 text-white"
            onClick={createCroppedImage}
          >
            Use
          </button>
        </div>
      )}
    </div>
  );
}

