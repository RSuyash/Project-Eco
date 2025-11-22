import { createTheme, ThemeOptions } from '@mui/material/styles';

const sharedTypography: ThemeOptions['typography'] = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: { fontSize: '2.5rem', fontWeight: 700 },
  h2: { fontSize: '2rem', fontWeight: 700 },
  h3: { fontSize: '1.75rem', fontWeight: 700 },
  h4: { fontSize: '1.5rem', fontWeight: 500 },
  h5: { fontSize: '1.25rem', fontWeight: 500 },
  h6: { fontSize: '1.1rem', fontWeight: 500 },
  body1: { fontSize: '1rem' },
  caption: { fontSize: '0.875rem' },
  code: {
    fontFamily: [
      'Fira Code',
      'Menlo',
      'Monaco',
      'Consolas',
      '"Courier New"',
      'monospace',
    ].join(','),
  },
};

const getTheme = (mode: 'light' | 'dark') => {
  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            // Dark Mode Palette
            primary: {
              main: '#6c63ff',
            },
            background: {
              default: '#282c34',
              paper: '#3a3f4b',
            },
            text: {
              primary: '#abb2bf',
              secondary: '#9da5b4',
            },
            divider: '#44475a',
          }
        : {
            // Light Mode Palette
            primary: {
              main: '#6c63ff',
            },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            text: {
              primary: '#212121',
              secondary: '#757575',
            },
            divider: '#e0e0e0',
          }),
    },
    shape: {
      borderRadius: 12,
    },
    typography: sharedTypography,
    components: {
      MuiTypography: {
        defaultProps: {
          color: 'textPrimary',
        },
      },
      MuiCssBaseline: {
        styleOverrides: (theme) => `
          /* Custom Scrollbar for Webkit browsers (even sleeker) */
          ::-webkit-scrollbar {
            width: 4px; /* Even thinner */
          }

          ::-webkit-scrollbar-track {
            background: transparent; /* Still transparent */
          }

          ::-webkit-scrollbar-thumb {
            background: rgba(128, 128, 128, 0.1); /* Very subtle grey, almost invisible */
            border-radius: 2px; /* Smaller rounded ends */
            transition: background 0.3s ease-in-out, opacity 0.3s ease-in-out; /* Smooth transitions */
            opacity: 0; /* Start almost invisible */
          }

          ::-webkit-scrollbar-thumb:hover {
            background: ${theme.palette.primary.main}; /* Accent color on hover */
            opacity: 1; /* Fully visible on hover */
          }

          /* Hide scrollbar buttons for Webkit browsers */
          ::-webkit-scrollbar-button {
            display: none;
            height: 0;
            width: 0;
          }

          /* Custom Scrollbar for Firefox */
          html {
            scrollbar-width: thin;
            scrollbar-color: rgba(128, 128, 128, 0.1) transparent; /* thumb and track color, very subtle */
          }
          /* For Firefox, to make it appear on hover (best effort with CSS) */
          html:hover {
            scrollbar-color: ${theme.palette.primary.main} transparent;
          }

          code {
            font-family: 'Fira Code', monospace;
            background-color: ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)'};
            padding: 0.2em 0.4em;
            border-radius: 3px;
          }
          a {
            color: ${theme.palette.text.primary};
            text-decoration: none;
            transition: color 0.2s ease-in-out;
          }
          a:hover {
            color: ${theme.palette.primary.main};
            text-decoration: underline;
          }
        `,
      },
      MuiCard: {
        styleOverrides: {
          root: (props) => ({
            borderRadius: props.theme.shape.borderRadius,
            border: `1px solid ${props.theme.palette.divider}`,
            boxShadow: props.theme.palette.mode === 'dark' 
              ? '0 4px 12px 0 rgba(0, 0, 0, 0.2)' 
              : '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
          }),
        },
      },
    },
  };
  return createTheme(themeOptions);
};

export default getTheme;

