import React from 'react';
import FabRecord from './FabRecord';

/** Bottom navigation bar that hides on scroll down.
 * Visible only on screens up to 600px wide.
 */
export const BottomNav: React.FC = () => {
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setHidden(currentY > lastY);
      lastY = currentY;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed bottom-0 left-0 right-0 flex justify-around bg-gray-100 dark:bg-gray-800 p-2 transition-transform duration-300 motion-reduce:transition-none sm:hidden ${hidden ? 'translate-y-full' : ''}`}
      >
        <a
          href="/"
          aria-label="Home"
          className="text-gray-900 dark:text-gray-100 focus:outline-none focus:ring"
        >
          Home
        </a>
        <a
          href="/record"
          aria-label="Record"
          className="text-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring"
        >
          +
        </a>
        <a
          href="/profile"
          aria-label="Profile"
          className="text-gray-900 dark:text-gray-100 focus:outline-none focus:ring"
        >
          Profile
        </a>
      </nav>
      <FabRecord />
    </>
  );
};
