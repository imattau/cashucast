/*
 * Licensed under GPL-3.0-or-later
 * React component for ClipTrimSlider.
 */
import React from 'react';

/**
 * ClipTrimSlider provides simple start and end range sliders to trim a clip.
 */
export interface ClipTrimSliderProps {
  duration: number;
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
}

export const ClipTrimSlider: React.FC<ClipTrimSliderProps> = ({
  duration,
  start,
  end,
  onChange,
}) => {
  const handleStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value <= end) onChange(value, end);
  };
  const handleEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= start) onChange(start, value);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="start" className="sr-only">
        Start time
      </label>
      <input
        id="start"
        name="start"
        type="range"
        min={0}
        max={duration}
        value={start}
        onChange={handleStart}
      />
      <label htmlFor="end" className="sr-only">
        End time
      </label>
      <input
        id="end"
        name="end"
        type="range"
        min={0}
        max={duration}
        value={end}
        onChange={handleEnd}
      />
      <div className="text-sm text-center">
        {start}s - {end}s
      </div>
    </div>
  );
};

