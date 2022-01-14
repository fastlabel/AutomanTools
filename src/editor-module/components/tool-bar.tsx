import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import React, { CSSProperties, FC } from 'react';

type Props = {
  className?: string;
  style?: CSSProperties;
};

const ToolBar: FC<Props> = ({ className, style, children }) => {
  return (
    <Box
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
