import { createTheme } from '@mui/material/styles';

// Create a theme instance.
const muiTheme = createTheme({
  typography: {
    button: {
      textTransform: 'none',
    },
    fontFamily: ['"Helvetica Neue"'].join(','),
  },
  components: {
    MuiIconButton: {
      defaultProps: {
        tabIndex: -1,
      },
    },
    MuiIcon: {
      defaultProps: {
        tabIndex: -1,
      },
    },
    MuiListItem: {
      defaultProps: {
        tabIndex: -1,
      },
    },
    MuiSlider: {
      defaultProps: {
        tabIndex: -1,
      },
    },
    MuiPaper: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
        InputProps: {
          classes: {
            input: "{'font-size': '0.875rem'}",
          },
        },
        SelectProps: {
          MenuProps: {
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        color: 'inherit',
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          '&.MuiButtonGroup-groupedOutlined': {
            borderColor: 'rgba(0, 0, 0, 0.23)',
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderColor: 'rgba(0, 0, 0, 0.23)',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          cursor: 'default',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          paddingLeft: '16px !important',
          paddingRight: '16px !important',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        inputSizeSmall: {
          paddingTop: '8.5px',
          paddingBottom: '8.5px',
          fontSize: '0.9rem',
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D32F2F',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fff',
    },
  },
});

export default muiTheme;
