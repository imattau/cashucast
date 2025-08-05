/*
 * Licensed under GPL-3.0-or-later
 * React component for BlurOverlay.
 *
 * Material 3 scrim guidance:
 * https://m3.material.io/styles/scrim/overview
 * MUI Backdrop docs:
 * https://mui.com/material-ui/react-backdrop/
 */
import React from 'react';
import Backdrop, { BackdropProps } from '@mui/material/Backdrop';
import { useTheme } from '@mui/material/styles';

export type BlurOverlayProps = BackdropProps;

/**
 * BlurOverlay renders a blurred overlay covering its parent. Useful for
 * hiding sensitive content until user interaction.
 */
export const BlurOverlay: React.FC<BlurOverlayProps> = ({
  className,
  children,
  open = true,
  sx,
  ...props
}) => {
  const theme = useTheme();
  return (
    <Backdrop
      {...props}
      open={open}
      className={className}
      sx={[
        {
          position: 'absolute',
          inset: 0,
          backgroundColor: `rgba(${theme.vars?.palette.background.defaultChannel ?? '0 0 0'} / 0.6)`,
          backdropFilter: 'blur(4px)',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Backdrop>
  );
};

