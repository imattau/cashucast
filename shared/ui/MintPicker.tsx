/*
 * Licensed under GPL-3.0-or-later
 * React component for MintPicker.
 */
import React from 'react';
import Select, { SelectProps } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

/**
 * Selection component styled with MUI theme tokens.
 * Material 3 selection menu guidelines: https://m3.material.io/components/menus/overview
 * MUI Select component docs: https://mui.com/material-ui/react-select/
 */
export const MintPicker: React.FC<SelectProps<string>> = ({
  value,
  defaultValue = '',
  children,
  sx,
  ...props
}) => {
  const selectProps =
    value !== undefined ? { value } : { defaultValue };

  return (
    <Select
      displayEmpty
      fullWidth
      {...selectProps}
      {...props}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'primary.main',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'secondary.main',
        },
        ...sx,
      }}
    >
      <MenuItem value="">
        <em>Default Mint</em>
      </MenuItem>
      {children}
    </Select>
  );
};
