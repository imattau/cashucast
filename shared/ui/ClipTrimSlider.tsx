/*
 * Licensed under GPL-3.0-or-later
 * React component for ClipTrimSlider.
 *
 * Material 3 slider spec: https://m3.material.io/components/sliders/overview
 * MUI Slider docs: https://mui.com/material-ui/react-slider/
 */
import React from 'react';
import Slider from '@mui/material/Slider';

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
  const handleChange = (_: Event, value: number | number[]) => {
    const [newStart, newEnd] = value as number[];
    onChange(newStart, newEnd);
  };

  return (
    <div className="flex flex-col gap-2">
      <Slider
        value={[start, end]}
        onChange={handleChange}
        min={0}
        max={duration}
        valueLabelDisplay="auto"
        aria-label="Clip range"
      />
      <div className="text-sm text-center">
        {start}s - {end}s
      </div>
    </div>
  );
};

