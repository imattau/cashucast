/*
 * Licensed under GPL-3.0-or-later
 * Top navigation bar using MUI AppBar and Toolbar.
 * Material 3 spec: https://m3.material.io/components/top-app-bar/overview
 * MUI docs: https://mui.com/material-ui/react-app-bar/
 */
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SearchBar from './SearchBar';

export default function TopNav() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CashuCast
        </Typography>
        <SearchBar />
      </Toolbar>
    </AppBar>
  );
}

