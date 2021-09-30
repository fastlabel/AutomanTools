import { createTheme } from '@material-ui/core/styles';

// Create a theme instance.
const muiTheme = createTheme({
  typography: {
    button: {
      textTransform: 'none',
    },
    fontFamily: ['"Helvetica Neue"'].join(','),
  },
  props: {
    MuiIconButton: {
      tabIndex: -1,
    },
    MuiIcon: {
      tabIndex: -1,
    },
    MuiListItem: {
      tabIndex: -1,
    },
    MuiSlider: {
      tabIndex: -1,
    },
    MuiPaper: {
      variant: 'outlined',
    },
    MuiTable: {
      size: 'small',
    },
    MuiInput: {
      tabIndex: 1,
    },
    MuiTextField: {
      variant: 'outlined',
      size: 'small',
      InputProps: {
        classes: {
          input: "{'font-size': '0.875rem'}",
        },
      },
    },
    MuiButton: {
      variant: 'contained',
      disableElevation: true,
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
  overrides: {
    MuiTableCell: {
      head: {
        cursor: 'default',
      },
    },
    MuiLink: {
      root: {
        cursor: 'pointer',
      },
    },
    MuiToolbar: {
      root: {
        paddingLeft: '16px !important',
        paddingRight: '16px !important',
      },
    },
    MuiOutlinedInput: {
      inputMarginDense: {
        paddingTop: '8.5px',
        paddingBottom: '8.5px',
        fontSize: '0.9rem',
      },
    },
  },
});

export default muiTheme;
