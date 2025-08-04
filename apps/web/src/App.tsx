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
  const [hydrated, setHydrated] = React.useState(() =>
    useProfile.persist.hasHydrated(),
  );

  React.useEffect(() => {
    const unsub = useProfile.persist.onFinish(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated) {
    return null;
  }

  const hasProfile = Boolean(profile?.ssbPk);
  if (!hasProfile) {
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
      <SearchBar />
    </>
  );
}
