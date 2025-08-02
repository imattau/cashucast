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

  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        setDark((d) => !d);
      }}
      className={`px-2 py-1 rounded bg-gray-200 ${props.className ?? ''}`}
    >
      {dark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};
