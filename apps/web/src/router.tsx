import React from 'react';
import Onboarding from './routes/Onboarding';
import Compose from './routes/Compose';
import SettingsOverlay from './routes/SettingsOverlay';
import SearchResults from './routes/SearchResults';
import Discover from './routes/Discover';
import Record from './routes/Record';

export const ROUTES: Record<string, React.FC> = {
  '/compose': Compose,
  '/record': Record,
  '/settings': SettingsOverlay,
  '/search': SearchResults,
  '/discover': Discover,
  '/': Compose,
};

export default ROUTES;
