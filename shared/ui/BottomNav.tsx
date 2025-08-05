/*
 * Licensed under GPL-3.0-or-later
 * React component for BottomNav.
 */
import React from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeRounded from '@mui/icons-material/HomeRounded';
import ExploreRounded from '@mui/icons-material/ExploreRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import FabRecord from './FabRecord';

/**
 * Material 3 navigation bar using MUI BottomNavigation.
 * Spec: https://m3.material.io/components/navigation-bar/overview
 * Docs: https://mui.com/material-ui/react-bottom-navigation/
 */
export const BottomNav: React.FC = () => {
  const [value, setValue] = React.useState(
    () => (typeof window !== 'undefined' ? window.location.pathname : '/')
  );
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setHidden(currentY > lastY);
      lastY = currentY;
    };
    const onPopState = () => setValue(window.location.pathname);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    if (newValue === value) return;
    setValue(newValue);
    window.history.pushState(null, '', newValue);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <>
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        className={`fixed bottom-0 left-0 right-0 sm:hidden transition-transform duration-300 bg-surface dark:bg-surface-dark ${
          hidden ? 'translate-y-full' : ''
        }`}
      >
        <BottomNavigationAction
          label="Home"
          value="/"
          icon={<HomeRounded />}
          className="text-gray-900 dark:text-gray-100"
        />
        <BottomNavigationAction
          label="Discover"
          value="/discover"
          icon={<ExploreRounded />}
          className="text-gray-900 dark:text-gray-100"
        />
        <BottomNavigationAction
          label="Profile"
          value="/profile"
          icon={<PersonRounded />}
          className="text-gray-900 dark:text-gray-100"
        />
      </BottomNavigation>
      <FabRecord />
    </>
  );
};
