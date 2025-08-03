import React from 'react';
import FabRecord from './FabRecord';
import { Compass } from 'lucide-react';
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
        className={`fixed bottom-0 left-0 right-0 flex justify-around bg-gray-100 dark:bg-gray-800 p-2 transition-transform duration-300 motion-reduce:transition-none sm:hidden ${hidden ? 'translate-y-full' : ''}`}
      >
        <motion.a
          href="/"
          aria-label="Home"
          className="text-gray-900 dark:text-gray-100 focus:outline-none focus:ring"
          animate={{ scale: path === '/' ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          Home
        </motion.a>
        <motion.a
          href="/discover"
          aria-label="Discover"
          className="text-gray-900 dark:text-gray-100 focus:outline-none focus:ring"
          animate={{ scale: path === '/discover' ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Compass className="mx-auto" />
          <span className="sr-only">Discover</span>
        </motion.a>
        <motion.a
          href="/record"
          aria-label="Record"
          className="text-2xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring"
          animate={{ scale: path === '/record' ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          +
        </motion.a>
        <motion.a
          href="/profile"
          aria-label="Profile"
          className="text-gray-900 dark:text-gray-100 focus:outline-none focus:ring"
          animate={{ scale: path === '/profile' ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          Profile
        </motion.a>
      </nav>
      <FabRecord />
    </>
  );
};
