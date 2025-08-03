/*
 * Licensed under GPL-3.0-or-later
 * React component for SwipeContainer.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface SwipeContainerProps {
  /** Slides to display. Usually `TimelineCard`s. */
  children: React.ReactNode[];
  /** Notifies when the active slide changes. */
  onIndexChange?: (index: number) => void;
}

/**
 * Basic vertical swipe container.
 * - Keyboard support with ArrowUp / ArrowDown.
 * - Touch swipe support.
 * - Renders only the current slide and \u00b12 siblings for prefetch.
 */
export const SwipeContainer: React.FC<SwipeContainerProps> = ({
  children,
  onIndexChange,
}) => {
  const slides = React.Children.toArray(children) as React.ReactNode[];
  const [index, setIndex] = useState(0);
  const startY = useRef<number | null>(null);

  const next = useCallback(() => {
    setIndex((i) => Math.min(slides.length - 1, i + 1));
  }, [slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') next();
    if (e.key === 'ArrowUp') prev();
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startY.current == null) return;
    const delta = e.changedTouches[0].clientY - startY.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) next();
      else prev();
    }
    startY.current = null;
  };

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  return (
    <div
      className="relative h-full overflow-hidden touch-pan-y"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((child, i) => {
        const offset = i - index;
        if (Math.abs(offset) > 2) return null; // prefetch \u00b12
        return (
          <div
            className="absolute inset-0 transition-transform duration-300 motion-reduce:transition-none motion-reduce:duration-0"
            style={{ transform: `translateY(${offset * 100}%)` }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};
