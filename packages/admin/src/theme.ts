import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    secondary: {
      main: '#6B7280',
    },
    background: {
      default: '#080808',
      paper: '#111111',
    },
    surface: {
      main: '#181818',
    },
    text: {
      primary: '#D4D4D4',
      secondary: '#9CA3AF',
    },
    success: {
      main: '#10B981',
      light: '#6EE7B7',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#FCA5A5',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6',
      light: '#93C5FD',
      dark: '#1D4ED8',
    },
    divider: '#262626',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#111111',
          border: '1px solid #262626',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#111111',
          border: '1px solid #262626',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: '#404040',
          color: '#D4D4D4',
          '&:hover': {
            borderColor: '#F59E0B',
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#181818',
            '& fieldset': {
              borderColor: '#404040',
            },
            '&:hover fieldset': {
              borderColor: '#505050',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#F59E0B',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: '#262626',
        },
        head: {
          backgroundColor: '#181818',
          fontWeight: 600,
          color: '#D4D4D4',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#111111',
          borderBottom: '1px solid #262626',
          boxShadow: 'none',
        },
      },
    },
  },
});

export default theme;
