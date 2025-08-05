/*
 * Licensed under GPL-3.0-or-later
 * React component for Button.
 *
 * Material 3 button spec: https://m3.material.io/components/buttons/overview
 * MUI Button docs: https://mui.com/material-ui/react-button/
 */
import React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';

export type ButtonProps = MuiButtonProps;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'contained', color = 'primary', ...props }, ref) => (
    <MuiButton ref={ref} variant={variant} color={color} {...props} />
  ),
);

Button.displayName = 'Button';

