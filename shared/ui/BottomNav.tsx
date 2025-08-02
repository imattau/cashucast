import React from 'react';

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
    <nav
      className={`fixed bottom-0 left-0 right-0 flex justify-around bg-gray-100 p-2 transition-transform duration-300 sm:hidden ${hidden ? 'translate-y-full' : ''}`}
    >
      <a href="/" aria-label="Home">Home</a>
      <a href="/record" aria-label="Record" className="text-2xl">+</a>
      <a href="/profile" aria-label="Profile">Profile</a>
    </nav>
  );
};
