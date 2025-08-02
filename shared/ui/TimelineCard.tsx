import React from 'react';

export interface TimelineCardProps {
  children?: React.ReactNode;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ children }) => {
  return (
    <div className="p-4 rounded border shadow-sm bg-white">
      {children ?? 'TimelineCard'}
    </div>
  );
};
