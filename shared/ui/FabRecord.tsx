import React from 'react';

declare const navigate: (path: string) => void;

const FabRecord: React.FC = () => {
  const handleClick = () => {
    navigate('/record');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Record"
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#FF0759] to-[#FF8A90] text-white drop-shadow-lg sm:hidden"
    >
      +
    </button>
  );
};

export default FabRecord;
