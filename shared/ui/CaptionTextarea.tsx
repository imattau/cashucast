import React from 'react';

/**
 * CaptionTextarea is a simple textarea for adding captions to a clip.
 */
export interface CaptionTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

export const CaptionTextarea: React.FC<CaptionTextareaProps> = ({ value, onChange }) => (
  <textarea
    className="w-full p-2 border rounded"
    placeholder="Add a caption"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

