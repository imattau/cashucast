/*
 * Licensed under GPL-3.0-or-later
 * React component for UploadDropzone.
 */
import React from 'react';

/**
 * UploadDropzone allows the user to select or drag and drop a file.
 * It is used as a fallback when camera capture is not available.
 */
export interface UploadDropzoneProps {
  onFile: (file: File) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onFile }) => {
  const [error, setError] = React.useState('');

  const validate = (file?: File) => {
    if (!file) return;
    if (file.type.startsWith('video/')) {
      setError('');
      onFile(file);
    } else {
      setError('Please select a video file.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    validate(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    validate(file);
  };

  return (
    <div
      className="p-4 border-2 border-dashed rounded"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <label htmlFor="file-upload" className="sr-only">
        Upload file
      </label>
      <input
        id="file-upload"
        name="file"
        type="file"
        accept="video/*"
        onChange={handleChange}
      />
      <p className="text-center text-sm mt-2">Drop or select a video file</p>
      {error && (
        <p className="text-center text-sm mt-2 text-red-600">{error}</p>
      )}
    </div>
  );
};

