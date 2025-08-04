/*
 * Licensed under GPL-3.0-or-later
 * React component for BottomNav.
 */
import React from 'react';
import FabRecord from './FabRecord';
import { Compass, Home, User } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { prefersReducedMotion } from './prefersReducedMotion';

/** Bottom navigation bar that hides on scroll down.
 * Visible only on screens up to 600px wide.
 */
export const BottomNav: React.FC = () => {
  const [hidden, setHidden] = React.useState(false);
  const [path, setPath] = React.useState(
    () => (typeof window !== 'undefined' ? window.location.pathname : '/')
  );
  const reduceMotion = useReducedMotion();
  const transition = prefersReducedMotion(reduceMotion, {
    type: 'spring',
    stiffness: 400,
    damping: 20,
  });
  const scaleStyle = (target: string) =>
    reduceMotion ? { scale: path === target ? 1.2 : 1 } : undefined;
  const animateScale = (target: string) =>
    prefersReducedMotion(reduceMotion, { scale: path === target ? 1.2 : 1 });

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
          className="text-gray-900 dark:text-gray-100 focus:outline-none focus:ring min-tap flex items-center justify-center"
          animate={animateScale('/')}
          transition={transition}
          style={scaleStyle('/')}
        >
          <Home className="mx-auto" />
          <span className="sr-only">Home</span>
        </motion.a>
        <motion.a
          href="/discover"
          aria-label="Discover"
          aria-current={path === '/discover' ? 'page' : undefined}
          className="text-gray-900 dark:text-gray-100 focus:outline-none focus:ring min-tap flex items-center justify-center"
          animate={animateScale('/discover')}
          transition={transition}
          style={scaleStyle('/discover')}
        >
          <Compass className="mx-auto" />
          <span className="sr-only">Discover</span>
        </motion.a>
        <motion.a
          href="/profile"
          aria-label="Profile"
          aria-current={path === '/profile' ? 'page' : undefined}
          className="text-gray-900 dark:text-gray-100 focus:outline-none focus:ring min-tap flex items-center justify-center"
          animate={animateScale('/profile')}
          transition={transition}
          style={scaleStyle('/profile')}
        >
          <User className="mx-auto" />
          <span className="sr-only">Profile</span>
        </motion.a>
      </nav>
      <FabRecord />
    </>
  );
};
