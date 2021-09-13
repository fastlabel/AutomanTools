import { Button, Divider, Menu, MenuItem } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import {
  createTheme,
  makeStyles,
  ThemeProvider,
} from '@material-ui/core/styles';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React, { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ApplicationConst } from './application/const';
import favicon from './asset/favicon-200.png';
import WorkspaceContext from './context/workspace';

const COLOR = {
  btn_normal: '#cacaca',
  btn_blur: '#8e8e8e',
  btn_hover: '#505050',
  text_normal: '#000000',
  text_blur: '#999999',
  close_btn_hover: '#e81123',
};

const theme = createTheme({
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 'initial',
        height: '100%',
      },
    },
    MuiIconButton: {
      root: {
        borderRadius: 'initial',
        color: COLOR.btn_normal,
        '&:hover': {
          color: COLOR.btn_hover,
        },
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
    MuiMenu: {
      paper: {
        borderRadius: 0,
      },
    },
    MuiMenuItem: {
      root: {
        fontSize: '0.8125rem',
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

  const handleMenu = (func: () => void = () => {}) => {
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
        getContentAnchorEl={null}
        open={Boolean(anchorEl)}
        onClose={handleMenu()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}>
        {menus.map((item, index) => {
          if (item.separator) {
            return <Divider style={{ margin: '4px 8px' }} />;
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

type Props = {};

const TitleBar: FC<Props> = () => {
  const classes = useStyles();
  const history = useHistory();
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
            <Box display="flex" mr={1}>
              <img src={favicon} width="auto" height={24} />
            </Box>
            <Box className={classes.menu} height={38}>
              <ToolMenu
                id="toolbar-file"
                label="ファイル"
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
                    label: '新規ワークスペースを開く',
                    onClick: () => {
                      history.push('/workspace');
                    },
                  },
                  {
                    label: 'ワークスペースを開く',
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
                            history.push('/workspace');
                          })
                          .catch((err) => {
                            // not exist meta/project.json
                            history.push('/workspace');
                          });
                      });
                    },
                  },
                  {
                    separator: true,
                  },
                  {
                    label: 'ウインドウを閉じる',
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
            <Box className={classes.title}>
              <Typography variant="body1">{ApplicationConst.name}</Typography>
            </Box>
            <Box className={classes.control}>
              <IconButton color="inherit" onClick={onMinimize}>
                <MinimizeIcon />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={maximized ? onRestore : onMaximize}>
                {maximized ? <RestoreIcon /> : <MaximizeIcon />}
              </IconButton>
              <IconButton color="inherit" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      </ThemeProvider>
    </div>
  );
};

export default TitleBar;
