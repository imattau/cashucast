import React, { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * BottomSheet built with Radix UI Dialog.
 * Supports swipe down to dismiss on touch devices.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  const startY = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startY.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startY.current == null) return;
    const delta = e.clientY - startY.current;
    if (delta > 0) setDrag(delta);
  };

  const handlePointerUp = () => {
    if (drag > 50) onOpenChange(false);
    setDrag(0);
    startY.current = null;
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 rounded-t-2xl bg-white shadow-lg transition-transform duration-300"
          style={{ transform: `translateY(${drag}px)` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
