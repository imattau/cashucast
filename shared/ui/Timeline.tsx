import React, { useCallback, useEffect, useState } from 'react';
import { SwipeContainer } from './SwipeContainer';
import { TimelineCard } from './TimelineCard';
import { BalanceChip } from './BalanceChip';

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
    <div className="flex h-screen flex-col">
      <header className="flex justify-end p-2">
        <BalanceChip />
      </header>
      <div className="flex-1">
        <SwipeContainer onIndexChange={handleIndexChange}>
          {cards}
        </SwipeContainer>
      </div>
    </div>
  );
};
