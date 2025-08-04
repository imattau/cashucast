/*
 * Licensed under GPL-3.0-or-later
 * React component for BottomNav.
 */
import React from 'react';
import FabRecord from './FabRecord';
import { Compass, Home, User } from 'lucide-react';
import { motion } from 'framer-motion';

/** Bottom navigation bar that hides on scroll down.
 * Visible only on screens up to 600px wide.
 */
export const BottomNav: React.FC = () => {
  const [hidden, setHidden] = React.useState(false);
  const [path, setPath] = React.useState(
    () => (typeof window !== 'undefined' ? window.location.pathname : '/')
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setHidden(currentY > lastY);
      lastY = currentY;
    };
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  return (
    <>
      <nav
        className={`fixed bottom-0 left-0 right-0 flex justify-around bg-subtleBg dark:bg-surface-800 p-2 transition-transform duration-300 motion-reduce:transition-none sm:hidden ${hidden ? 'translate-y-full' : ''}`}
      >
        <motion.a
          href="/"
          aria-label="Home"
          aria-current={path === '/' ? 'page' : undefined}
          className="text-gray-900 dark:text-gray-100 focus:outline-none focus:ring"
          animate={{ scale: path === '/' ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Home className="mx-auto" />
          <span className="sr-only">Home</span>
        </motion.a>
        <motion.a
          href="/discover"
          aria-label="Discover"
          aria-current={path === '/discover' ? 'page' : undefined}
          className="text-gray-900 dark:text-gray-100 focus:outline-none focus:ring"
          animate={{ scale: path === '/discover' ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Compass className="mx-auto" />
          <span className="sr-only">Discover</span>
        </motion.a>
        <motion.a
          href="/profile"
          aria-label="Profile"
          aria-current={path === '/profile' ? 'page' : undefined}
          className="text-gray-900 dark:text-gray-100 focus:outline-none focus:ring"
          animate={{ scale: path === '/profile' ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <User className="mx-auto" />
          <span className="sr-only">Profile</span>
        </motion.a>
      </nav>
      <FabRecord />
    </>
  );
};
