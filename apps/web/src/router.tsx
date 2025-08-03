import React from 'react';
import Onboarding from './routes/Onboarding';
import Compose from './routes/Compose';
import SettingsNetwork from './routes/SettingsNetwork';
import SettingsStorage from './routes/SettingsStorage';
import SettingsProfile from './routes/SettingsProfile';
import SearchResults from './routes/SearchResults';
import Discover from './routes/Discover';

export const ROUTES: Record<string, React.FC> = {
  '/compose': Compose,
  '/settings/network': SettingsNetwork,
  '/settings/storage': SettingsStorage,
  '/settings/profile': SettingsProfile,
  '/search': SearchResults,
  '/discover': Discover,
  '/': Compose,
};

export default ROUTES;
