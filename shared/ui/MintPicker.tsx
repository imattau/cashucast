/*
 * Licensed under GPL-3.0-or-later
 * React component for MintPicker.
 */
import React from 'react';
import Select, { SelectProps } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Material 3 menu spec: https://m3.material.io/components/menus/overview
// MUI Select docs: https://mui.com/material-ui/api/select/

export type MintPickerProps = SelectProps<string>;

export const MintPicker = React.forwardRef<HTMLDivElement, MintPickerProps>(
  ({ className, children, defaultValue = '', ...props }, ref) => (
    <Select
      {...props}
      ref={ref}
      className={className}
      defaultValue={defaultValue}
      displayEmpty
      fullWidth
    >
      <MenuItem value="">Default Mint</MenuItem>
      {children}
    </Select>
  ),
);

MintPicker.displayName = 'MintPicker';
