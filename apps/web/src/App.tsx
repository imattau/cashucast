import React from 'react';
import Onboarding from './routes/Onboarding';
import Compose from './routes/Compose';
import SettingsNetwork from './routes/SettingsNetwork';
import SettingsStorage from './routes/SettingsStorage';
import SettingsProfile from './routes/SettingsProfile';
import { useProfile } from '../../shared/store/profile';

const ROUTES: Record<string, React.FC> = {
  '/compose': Compose,
  '/settings/network': SettingsNetwork,
  '/settings/storage': SettingsStorage,
  '/settings/profile': SettingsProfile,
  '/': Compose,
};

export default function App() {
  const profile = useProfile((s) => s.profile);
  const [path, setPath] = React.useState(() => window.location.pathname);

  React.useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (!profile?.ssbPk) {
    return <Onboarding />;
  }

  const RouteComponent = ROUTES[path];
  return RouteComponent ? <RouteComponent /> : <div>Not Found</div>;
}
