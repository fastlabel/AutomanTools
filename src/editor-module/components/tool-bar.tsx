import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React, { CSSProperties, FC } from 'react';

type Props = {
  className?: string;
  style?: CSSProperties;
};

const ToolBar: FC<Props> = ({ className, style, children }) => {
  return (
    <Box
      component="div"
      className={className}
      style={style}
      borderRight={'1px solid rgba(0, 0, 0, 0.12)'}>
      <List disablePadding>
        <ListItem dense>{children}</ListItem>
      </List>
    </Box>
  );
};
export default ToolBar;
