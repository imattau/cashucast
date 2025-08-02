import React from 'react';

/**
 * PublishBtn remains disabled until a magnet link is provided.
 */
export interface PublishBtnProps {
  magnet?: string;
  onPublish: () => void;
}

export const PublishBtn: React.FC<PublishBtnProps> = ({ magnet, onPublish }) => (
  <button disabled={!magnet} onClick={onPublish} className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400">
    Publish
  </button>
);

