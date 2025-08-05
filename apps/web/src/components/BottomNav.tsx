/*
 * Licensed under GPL-3.0-or-later
 * Bottom navigation for app pages using MUI BottomNavigation.
 * Material 3 spec: https://m3.material.io/components/navigation-bar/overview
 * MUI docs: https://mui.com/material-ui/react-bottom-navigation/
 */
import React from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import VideocamIcon from '@mui/icons-material/Videocam';
import SettingsIcon from '@mui/icons-material/Settings';

interface Props {
  path: string;
}

export default function BottomNav({ path }: Props) {
  const normalizedPath = path === '/' ? '/compose' : path;

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: string,
  ) => {
    if (newValue !== normalizedPath) {
      window.history.pushState(null, '', newValue);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <BottomNavigation
      value={normalizedPath}
      onChange={handleChange}
      showLabels
      className="fixed bottom-0 left-0 right-0 border-t"
    >
      <BottomNavigationAction label="Compose" value="/compose" icon={<HomeIcon />} />
      <BottomNavigationAction label="Discover" value="/discover" icon={<TravelExploreIcon />} />
      <BottomNavigationAction label="Record" value="/record" icon={<VideocamIcon />} />
      <BottomNavigationAction label="Settings" value="/settings" icon={<SettingsIcon />} />
    </BottomNavigation>
  );
}

