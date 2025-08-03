/*
 * Licensed under GPL-3.0-or-later
 * React component for ToggleDarkMode.
 */
import React from 'react';

/** Toggle between light and dark themes and persist choice to localStorage. */
export const ToggleDarkMode: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (
  props,
) => {
  const [dark, setDark] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', dark);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    }
  }, [dark]);
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      {...props}
      aria-label={label}
      aria-pressed={dark}
      onClick={(e) => {
        props.onClick?.(e);
        setDark((d) => !d);
      }}
      className={`px-2 py-1 rounded bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 ${
        props.className ?? ''
      }`}
    >
      <span aria-hidden="true">{dark ? '🌙' : '☀️'}</span>
    </button>
  );
};
