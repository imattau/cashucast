/*
 * Licensed under GPL-3.0-or-later
 * React component for BottomSheet using MUI SwipeableDrawer.
 */
import React from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * BottomSheet built with MUI SwipeableDrawer.
 * Configured for mobile with swipe-to-dismiss.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  const iOS =
    typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={() => onOpenChange(false)}
      onOpen={() => onOpenChange(true)}
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        className: 'rounded-t-2xl bg-surface dark:bg-surface-dark shadow-lg',
      }}
      BackdropProps={{
        className: 'bg-on-surface/50 dark:bg-on-surface-dark/50',
      }}
    >
      {children}
    </SwipeableDrawer>
  );
};
