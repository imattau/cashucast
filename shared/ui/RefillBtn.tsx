import React from 'react';

/** Button to trigger wallet refill. Placeholder implementation. */
export const RefillBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (
  props,
) => {
  return (
    <button
      {...props}
      className={`px-3 py-1 bg-blue-500 text-white rounded ${props.className ?? ''}`}
    >
      Refill
    </button>
  );
};
