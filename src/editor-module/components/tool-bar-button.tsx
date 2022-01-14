import { createStyles, makeStyles, Theme } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import React, { FC } from 'react';

const theme = createTheme({
  overrides: {
    MuiIconButton: {
      root: {
        borderRadius: 'initial',
      },
    },
    MuiTouchRipple: {
      rippleVisible: {
        animation: 'initial',
      },
      child: {
        borderRadius: 'initial',
      },
    },
  },
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: () => ({
      marginRight: theme.spacing(1),
    }),
  })
);

type Props = {
  toolTip: string;
  icon: JSX.Element;
  dense?: true;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
};

export const ToolBarBoxButtonThemeProvider: FC = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const ToolBarButton: FC<Props> = ({
  toolTip,
  icon,
  dense,
  disabled,
  active,
  onClick,
}) => {
  const classes = useStyles();
  if (disabled) {
    return (
      <IconButton
        className={dense ? undefined : classes.icon}
        size="small"
        disabled={disabled}
        color={active ? 'primary' : 'default'}
        onClick={onClick}>
        {icon}
      </IconButton>
    );
  }
  return (
    <Tooltip title={toolTip} arrow>
      <IconButton
        className={dense ? undefined : classes.icon}
        size="small"
        disabled={disabled}
        color={active ? 'primary' : 'default'}
        onClick={onClick}>
        {icon}
      </IconButton>
    </Tooltip>
  );
};
export default ToolBarButton;
