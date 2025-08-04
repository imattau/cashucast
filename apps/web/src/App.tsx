/*
 * Licensed under GPL-3.0-or-later
 * React component for App.
 */
import React from 'react';
import { ROUTES } from './router';
import { useProfile } from '../shared/store/profile';
import Onboarding from './routes/Onboarding';
import SearchBar from './components/SearchBar';

export default function App() {
  const { profile } = useProfile();

  if (!profile?.ssbPk) {
    return <Onboarding />;
  }

  const [path, setPath] = React.useState(() => window.location.pathname);

  React.useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const RouteComponent = ROUTES[path];
  return (
    <>
      {RouteComponent ? <RouteComponent /> : <div>Not Found</div>}
      {profile?.ssbPk && <SearchBar />}
    </>
  );
}
