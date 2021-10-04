import { Typography } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import React, { FC } from 'react';

type Props = {};

const TitleBar: FC<Props> = () => {
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <Typography variant="h6" color="inherit">
          FastLabel 3D Annotation
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
export default TitleBar;
