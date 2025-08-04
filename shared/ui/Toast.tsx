/*
 * Licensed under GPL-3.0-or-later
 * React component for Toast.
 */
import React from 'react';

/**
 * Toast displays a temporary notification at the bottom center of the screen.
 * It announces itself via an ARIA status role and hides after the given duration.
 */
export interface ToastProps {
  /** Message to display inside the toast. */
  message: string;
  /** Duration in milliseconds before auto-hiding. Defaults to 3000ms. */
  duration?: number;
  /** Optional callback invoked after the toast hides. */
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  duration = 3000,
  onHide,
}) => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const id = setTimeout(() => {
      setVisible(false);
      onHide?.();
    }, duration);
    return () => clearTimeout(id);
  }, [duration, onHide]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded"
    >
      {message}
    </div>
  );
};

export default Toast;

