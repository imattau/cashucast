/*
 * Licensed under GPL-3.0-or-later
 * React component for InstallBanner.
 */
import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

export interface InstallBannerProps {
  onFinish: () => void;
}

/**
 * Step prompting the user to install the PWA.
 * Material 3 banner spec: https://m3.material.io/components/banners/overview
 * MUI Snackbar: https://mui.com/material-ui/react-snackbar/
 * MUI Alert: https://mui.com/material-ui/react-alert/
 */
export const InstallBanner: React.FC<InstallBannerProps> = ({ onFinish }) => {
  const [deferred, setDeferred] = React.useState<any>(null);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleClose = (_?: any, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
    onFinish();
  };

  const install = async () => {
    if (!deferred) {
      handleClose();
      return;
    }
    deferred.prompt();
    try {
      await deferred.userChoice;
    } finally {
      setDeferred(null);
      handleClose();
    }
  };

  return (
    <Snackbar open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small" onClick={install} autoFocus>
            {deferred ? 'Install' : 'Continue'}
          </Button>
        }
        onClose={handleClose}
        sx={{ width: '100%' }}
      >
        Add this app to your home screen.
      </Alert>
    </Snackbar>
  );
};
