/*
 * Licensed under GPL-3.0-or-later
 * React component for FabRecord.
 */
import React, { useRef } from 'react';

const FabRecord: React.FC = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startPress = () => {
    longPressRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressRef.current = true;
      inputRef.current?.click();
    }, 500);
  };

  const endPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!longPressRef.current && typeof window !== 'undefined') {
      window.history.pushState(null, '', '/record');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && typeof window !== 'undefined') {
      window.recordedFile = file;
      window.history.pushState(null, '', '/compose');
      window.dispatchEvent(new PopStateEvent('popstate'));
      e.target.value = '';
    }
  };

  return (
    <>
      <button
        onMouseDown={startPress}
        onTouchStart={startPress}
        onMouseUp={endPress}
        onTouchEnd={endPress}
        onMouseLeave={endPress}
        aria-label="Record"
        className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#FF0759] to-[#FF8A90] text-white drop-shadow-lg motion-safe:hover:scale-105 sm:hidden"
      >
        +
      </button>
      <input
        type="file"
        accept="video/*"
        ref={inputRef}
        className="hidden"
        onChange={handleChange}
      />
    </>
  );
};

export default FabRecord;
