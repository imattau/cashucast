/*
 * Licensed under GPL-3.0-or-later
 * React component for MintPicker.
 */
import React from 'react';
import Select, { SelectProps } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

/**
 * Simple mint picker component.
 * Material 3 menu spec: https://m3.material.io/components/menus/overview
 * MUI Select docs: https://mui.com/material-ui/api/select/
 */
export const MintPicker: React.FC<SelectProps<string>> = ({
  className,
  children,
  defaultValue = '',
  ...props
}) => {
  return (
    <Select
      {...props}
      className={className}
      defaultValue={defaultValue}
      displayEmpty
      fullWidth
    >
      <MenuItem value="">Default Mint</MenuItem>
      {children}
    </Select>
  );
};
