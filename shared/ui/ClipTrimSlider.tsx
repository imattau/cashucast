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
      <input
        type="range"
        min={0}
        max={duration}
        value={start}
        onChange={handleStart}
      />
      <input type="range" min={0} max={duration} value={end} onChange={handleEnd} />
      <div className="text-sm text-center">
        {start}s - {end}s
      </div>
    </div>
  );
};

