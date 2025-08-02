import React from 'react';

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
    setTimeout(() => setShow(false), 3000);
  };

  return (
    <>
      <button
        disabled={!magnet}
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        Publish
      </button>
      {show && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded">
          Posted! Your followers will sync when online
        </div>
      )}
    </>
  );
};

