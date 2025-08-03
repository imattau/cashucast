import React from 'react';

/**
 * UploadDropzone allows the user to select or drag and drop a file.
 * It is used as a fallback when camera capture is not available.
 */
export interface UploadDropzoneProps {
  onFile: (file: File) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onFile }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
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
        onChange={handleChange}
      />
      <p className="text-center text-sm mt-2">Drop or select a video file</p>
    </div>
  );
};

