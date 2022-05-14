import { ApplicationConst } from '@fl-three-editor/application/const';
import { Button, Divider, Menu, MenuItem } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import {
  createTheme,
  StyledEngineProvider,
  Theme,
  ThemeProvider,
} from '@mui/material/styles';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import favicon from './asset/favicon-200.png';
import WorkspaceContext from './context/workspace';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const COLOR = {
  btn_normal: '#cacaca',
  btn_blur: '#8e8e8e',
  btn_hover: '#505050',
  text_normal: '#000000',
  text_blur: '#999999',
  close_btn_hover: '#e81123',
};

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 'initial',
          height: '100%',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 'initial',
          color: COLOR.btn_normal,
          '&:hover': {
            color: COLOR.btn_hover,
          },
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
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
        },
      },
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    '-webkit-app-region': 'drag',
  },
  appBar: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  },
  menu: {
    '-webkit-app-region': 'no-drag',
  },
  title: {
    display: 'flex',
    justifyContent: 'center',
    flexGrow: 1,
  },
  control: {
    '-webkit-app-region': 'no-drag',
  },
  toolbarRoot: {
    paddingLeft: '4px !important',
    paddingRight: '0 !important',
  },
  toolbarDense: {
    minHeight: 32,
  },
}));

const MinimizeIcon = (props: SvgIconProps) => (
  <SvgIcon
    {...props}
    width="10"
    height="1"
    style={{ fontSize: '0.875rem' }}
    viewBox={'0 0 10 1'}>
    <rect width="10" height="1" fill={COLOR.btn_normal} />
  </SvgIcon>
);

const MaximizeIcon = (props: SvgIconProps) => (
  <SvgIcon
    {...props}
    width="10"
    height="10"
    style={{ fontSize: '0.875rem' }}
    viewBox={'0 0 10 10'}>
    <rect
      x="0.5"
      y="0.5"
      width="9"
      height="9"
      fill="transparent"
      stroke={COLOR.btn_normal}
    />
  </SvgIcon>
);

const RestoreIcon = (props: SvgIconProps) => (
  <SvgIcon
    {...props}
    width="10"
    height="10"
    style={{ fontSize: '0.875rem' }}
    viewBox={'0 0 10 10'}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9 1H3V2H2V1V0H3H9H10V1V7V8H9H8V7H9V1Z"
      fill={COLOR.btn_normal}
    />
    <rect
      x="0.5"
      y="2.5"
      width="7"
      height="7"
      fill="transparent"
      stroke={COLOR.btn_normal}
    />
  </SvgIcon>
);

const CloseIcon = (props: SvgIconProps) => (
  <SvgIcon
    {...props}
    width="12"
    height="12"
    style={{ fontSize: '0.875rem' }}
    viewBox={'0 0 12 12'}>
    <path d="M1 11L11 1" stroke={COLOR.btn_normal} />
    <path d="M1 1L11 11" stroke={COLOR.btn_normal} />
  </SvgIcon>
);

type ToolMenuProps = {
  id: string;
  label: string;
  menus: ToolMenuItemProps[];
};

type ToolMenuItemProps =
  | {
      label: string;
      onClick: () => void;
      separator?: false;
    }
  | {
      separator: true;
    };

const ToolMenu: FC<ToolMenuProps> = ({ id, label, menus }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenu = (
    func: () => void = () => {
      // empty func
    }
  ) => {
    return () => {
      func();
      setAnchorEl(null);
    };
  };

  return (
    <>
      <Button
        aria-controls={id}
        aria-haspopup="true"
        size="small"
        variant="text"
        color="inherit"
        onClick={handleClick}>
        {label}
      </Button>
      <Menu
        id={id}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenu()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}>
        {menus.map((item, index) => {
          if (item.separator) {
            return <Divider key={index} style={{ margin: '4px 8px' }} />;
          }
          return (
            <MenuItem key={index} onClick={handleMenu(item.onClick)}>
              {item.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

const { appApi, workspace } = window;

type Props = {
  //
};

const TitleBar: FC<Props> = () => {
  const classes = useStyles();
  const history = useHistory();
  const [t] = useTranslation();
  const workspaceStore = WorkspaceContext.useContainer();

  const [maximized, setMaximized] = useState(false);
  const [blur, setBlur] = useState(false);

  const onMinimize = async () => {
    await appApi.minimize();
  };

  const onMaximize = async () => {
    setMaximized(!maximized);
    await appApi.maximize();
  };

  const onRestore = async () => {
    setMaximized(!maximized);
    await appApi.restore();
  };

  const onClose = async () => await appApi.close();

  useEffect(() => {
    appApi.resized(async () => setMaximized(false));

    return () => {
      appApi.removeResized();
    };
  }, []);

  useEffect(() => {
    appApi.getFocus(async () => setBlur(false));

    return () => {
      appApi.removeGetFocus();
    };
  }, [blur]);

  useEffect(() => {
    appApi.getBlur(async () => setBlur(true));

    return () => {
      appApi.removeGetBlur();
    };
  });

  useEffect(() => {
    appApi.maximized(async () => setMaximized(true));

    return () => {
      appApi.removeMaximized();
    };
  }, []);

  useEffect(() => {
    appApi.unMaximized(async () => setMaximized(false));

    return () => {
      appApi.removeUnMaximized();
    };
  }, []);

  return (
    <div className={classes.root}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <AppBar
            className={classes.appBar}
            position="static"
            color="transparent"
            elevation={0}>
            <Toolbar
              variant="dense"
              classes={{
                root: classes.toolbarRoot,
                dense: classes.toolbarDense,
              }}>
              <Box component="div" display="flex" mr={1}>
                <img src={favicon} width="auto" height={24} />
              </Box>
              <Box component="div" className={classes.menu} height={38}>
                <ToolMenu
                  id="toolbar-file"
                  label={t('titleBar-menu_label__file')}
                  menus={[
                    // {
                    //   label: '新しいウインドウ',
                    //   onClick: () => {
                    //     // TODO
                    //   },
                    // },
                    // {
                    //   separator: true
                    // },
                    {
                      label: t('titleBar-menu_item_label__createWorkspace'),
                      onClick: () => {
                        history.push('/workspace');
                      },
                    },
                    {
                      label: t('titleBar-menu_item_label__openWorkspace'),
                      onClick: () => {
                        const selectFolder = workspace.openFolderDialog();
                        selectFolder.then((wkDir) => {
                          if (!wkDir) return;
                          workspaceStore.setWorkspaceFolder(wkDir);
                          workspace
                            .load({ wkDir, query: { meta: { project: true } } })
                            .then((res) => {
                              if (res.meta?.project) {
                                const projectId = res.meta?.project.projectId;
                                history.push(`/threeannotation/${projectId}`);
                                return;
                              }
                              workspaceStore.setForceUpdate(true);
                              history.push('/workspace');
                            })
                            .catch((err) => {
                              // not exist meta/project.json
                              workspaceStore.setForceUpdate(true);
                              history.push('/workspace');
                            });
                        });
                      },
                    },
                    {
                      separator: true,
                    },
                    {
                      label: t('titleBar-menu_item_label__close'),
                      onClick: () => {
                        window.close();
                      },
                    },
                    // {
                    //   separator: true
                    // },
                    // {
                    //   label: '終了',
                    //   onClick: () => {
                    //     history.push('/workspace');
                    //   },
                    // }
                  ]}
                />
              </Box>
              <Box component="div" className={classes.title}>
                <Typography variant="body1">{ApplicationConst.name}</Typography>
              </Box>
              <Box component="div" className={classes.control}>
                <IconButton color="inherit" onClick={onMinimize} size="large">
                  <MinimizeIcon />
                </IconButton>
                <IconButton
                  color="inherit"
                  onClick={maximized ? onRestore : onMaximize}
                  size="large">
                  {maximized ? <RestoreIcon /> : <MaximizeIcon />}
                </IconButton>
                <IconButton color="inherit" onClick={onClose} size="large">
                  <CloseIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
        </ThemeProvider>
      </StyledEngineProvider>
    </div>
  );
};

export default TitleBar;
