import { Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import React, { FC } from 'react';

type Props = {};

const TitleBar: FC<Props> = () => {
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
