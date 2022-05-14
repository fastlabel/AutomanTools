import { Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import IconButton from '@mui/material/IconButton';
import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
} from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import React, { FC } from 'react';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const theme = createTheme({
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 'initial',
        },
      },
    },
    MuiTouchRipple: {
      styleOverrides: {
        rippleVisible: {
          animation: 'initial',
        },
        child: {
          borderRadius: 'initial',
        },
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
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
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
