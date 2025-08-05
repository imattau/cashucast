/*
 * Licensed under GPL-3.0-or-later
 * React component for App.
 */
import React from 'react';
import { ROUTES } from './router';
import { useProfile } from '../shared/store/profile';
import Onboarding from './routes/Onboarding';
import SearchBar from './components/SearchBar';
import BottomNav from './components/BottomNav';

export default function App() {
  const { profile } = useProfile();
  const [hydrated, setHydrated] = React.useState(() =>
    useProfile.persist.hasHydrated(),
  );

  React.useEffect(() => {
    const unsub = useProfile.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  if (!hydrated) {
    return null;
  }

  const hasProfile = Boolean(profile?.ssbPk);

  const [path, setPath] = React.useState(() => window.location.pathname);

  React.useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  React.useEffect(() => {
    setPath(window.location.pathname);
  }, [hasProfile]);

  const RouteComponent = ROUTES[path];

  return (
    <>
      {!hasProfile && <Onboarding />}
      <div id="app-container" hidden={!hasProfile}>
        {RouteComponent ? <RouteComponent /> : <div>Not Found</div>}
        <BottomNav path={path} />
        <SearchBar />
      </div>
    </>
  );
}
