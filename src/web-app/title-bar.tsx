import { Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import React, { FC } from 'react';

const TitleBar: FC = () => {
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <Typography variant="h6" color="inherit">
          Automan
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
export default TitleBar;
