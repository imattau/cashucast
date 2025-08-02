import React, { useCallback, useEffect, useState } from 'react';
import { SwipeContainer } from './SwipeContainer';
import { TimelineCard } from './TimelineCard';
import { BalanceChip } from './BalanceChip';
import { BottomNav } from './BottomNav';

/**
 * Demo timeline that renders an infinite list of `TimelineCard`s.
 * Cards are generated on demand and adjacent clips are prefetched
 * when the user navigates with swipe or arrow keys.
 */
export const Timeline: React.FC = () => {
  const [cards, setCards] = useState<React.ReactNode[]>([]);

  const ensureCard = useCallback((index: number) => {
    setCards((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = (
        <TimelineCard
          key={index}
          author={`Creator ${index}`}
          onZap={(amt) => console.log('zap', amt)}
        >
          <div className="flex h-full items-center justify-center">
            Clip {index}
          </div>
        </TimelineCard>
      );
      return next;
    });
  }, []);

  const handleIndexChange = useCallback(
    (i: number) => {
      ensureCard(i);
      ensureCard(i + 1); // prefetch next
    },
    [ensureCard]
  );

  useEffect(() => {
    // initial load
    ensureCard(0);
    ensureCard(1);
  }, [ensureCard]);

  return (
    <div className="relative flex h-screen flex-col">
      <header className="flex justify-end p-2">
        <BalanceChip />
      </header>
      <div className="relative flex-1 flex justify-center">
        <div className="w-full max-w-screen-md">
          <SwipeContainer onIndexChange={handleIndexChange}>
            {cards}
          </SwipeContainer>
        </div>
        <div className="pointer-events-none fixed inset-y-0 left-0 hidden w-1/4 bg-gray-100/40 backdrop-blur lg:block" />
        <div className="pointer-events-none fixed inset-y-0 right-0 hidden w-1/4 bg-gray-100/40 backdrop-blur lg:block" />
      </div>
      <BottomNav />
    </div>
  );
};
