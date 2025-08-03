/*
 * Licensed under GPL-3.0-or-later
 * React component for MintPicker.
 */
import React from 'react';

/** Simple mint picker placeholder component. */
export const MintPicker: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement>
> = ({ className, children, ...props }) => {
  return (
    <select
      {...props}
      className={`w-full p-2 border rounded ${className ?? ''}`}
    >
      <option value="">Default Mint</option>
      {children}
    </select>
  );
};
