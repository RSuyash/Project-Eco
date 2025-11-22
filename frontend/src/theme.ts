import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';

// "Digital Biosphere" (Dark Mode) Colors
const darkColors = {
  background: '#0a1f1c', // Deep Forest
  paper: 'rgba(255, 255, 255, 0.03)',
  primary: '#00f3ff', // Neon Cyan
  secondary: '#39ff14', // Bio Green
  textPrimary: '#e0e6ed',
  textSecondary: '#94a3b8',
  divider: 'rgba(255, 255, 255, 0.1)',
};

// "Lab Mode" (Light Mode) Colors
const lightColors = {
  background: '#f8f9fa', // Clean Off-White
  paper: '#ffffff',
  primary: '#0052cc', // Scientific Blue
  secondary: '#00875a', // Forest Green
  textPrimary: '#172b4d',
  textSecondary: '#5e6c84',
  divider: 'rgba(0, 0, 0, 0.08)',
};

const sharedTypography: ThemeOptions['typography'] = {
  fontFamily: [
    'Inter',
    'sans-serif',
  ].join(','),
  h1: { fontFamily: 'Outfit, sans-serif', fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.02em' },
  h2: { fontFamily: 'Outfit, sans-serif', fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.01em' },
  h3: { fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 600 },
  h4: { fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 600 },
  h5: { fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 500 },
  h6: { fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 500 },
  body1: { fontSize: '1rem', lineHeight: 1.6 },
  caption: { fontSize: '0.875rem' },
  code: {
    fontFamily: 'Fira Code, monospace',
  },
};

const getTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: colors.primary,
      },
      secondary: {
        main: colors.secondary,
      },
      background: {
        default: colors.background,
        paper: colors.paper,
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },
      divider: colors.divider,
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      ...sharedTypography,
      caption: { ...sharedTypography.caption, color: colors.textSecondary },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          body {
            background: ${isDark
            ? 'radial-gradient(circle at 50% 50%, #112926 0%, #050a14 100%)'
            : '#f4f5f7'};
            min-height: 100vh;
            color: ${colors.textPrimary};
            transition: background 0.3s ease, color 0.3s ease;
          }
          /* Custom Scrollbar */
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { 
            background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}; 
            border-radius: 4px; 
          }
          ::-webkit-scrollbar-thumb:hover { 
            background: ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}; 
          }
        `,
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
            backdropFilter: isDark ? 'blur(16px)' : 'none',
            border: `1px solid ${colors.divider}`,
            boxShadow: isDark
              ? '0 4px 30px rgba(0, 0, 0, 0.1)'
              : '0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark
                ? '0 10px 40px rgba(0, 243, 255, 0.1)'
                : '0 8px 24px rgba(0, 0, 0, 0.1)',
              borderColor: isDark ? 'rgba(0, 243, 255, 0.3)' : colors.primary,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
          },
          containedPrimary: {
            background: isDark
              ? `linear-gradient(135deg, ${colors.primary} 0%, #00b8ff 100%)`
              : colors.primary,
            color: isDark ? '#000' : '#fff',
            '&:hover': {
              boxShadow: isDark
                ? '0 0 20px rgba(0, 243, 255, 0.4)'
                : '0 4px 12px rgba(0, 82, 204, 0.3)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  };
  return createTheme(themeOptions);
};

export default getTheme;
