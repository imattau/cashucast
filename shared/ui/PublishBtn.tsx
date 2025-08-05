/*
 * Licensed under GPL-3.0-or-later
 * React component for PublishBtn.
 *
 * Material 3 button spec: https://m3.material.io/components/buttons/overview
 * MUI Button docs: https://mui.com/material-ui/react-button/
 */
import React from 'react';
import Button from '@mui/material/Button';
import PublishIcon from '@mui/icons-material/Publish';
import { Toast } from './Toast';

/**
 * PublishBtn remains disabled until a magnet link is provided.
 */
export interface PublishBtnProps {
  magnet?: string;
  onPublish: () => void | Promise<void>;
}

export const PublishBtn: React.FC<PublishBtnProps> = ({ magnet, onPublish }) => {
  const [show, setShow] = React.useState(false);

  const handleClick = async () => {
    await onPublish();
    setShow(true);
  };

  return (
    <>
      <Button
        disabled={!magnet}
        onClick={handleClick}
        variant="contained"
        startIcon={<PublishIcon />}
        className="min-tap"
      >
        Publish
      </Button>
      {show && (
        <Toast
          message="Posted! Your followers will sync when online"
          onHide={() => setShow(false)}
        />
      )}
    </>
  );
};

