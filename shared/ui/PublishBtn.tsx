/*
 * Licensed under GPL-3.0-or-later
 * React component for PublishBtn.
 */
import React from 'react';
import { Toast } from './Toast';

/**
 * PublishBtn remains disabled until a magnet link is provided.
 */
export interface PublishBtnProps {
  magnet?: string;
  onPublish: () => void | Promise<void>;
}

export const PublishBtn: React.FC<PublishBtnProps> = ({ magnet, onPublish }) => {
  const [show, setShow] = React.useState(false);

  const handleClick = async () => {
    await onPublish();
    setShow(true);
  };

  return (
    <>
      <button
        disabled={!magnet}
        onClick={handleClick}
        className="px-4 py-2 bg-primary rounded disabled:bg-surface-100 dark:disabled:bg-surface-800"
      >
        Publish
      </button>
      {show && (
        <Toast
          message="Posted! Your followers will sync when online"
          onHide={() => setShow(false)}
        />
      )}
    </>
  );
};

