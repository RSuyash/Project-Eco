import { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material';

const APP_BAR_HEIGHT = 64;

export const getAppBarStyles = (sidebarOpen: boolean, theme: Theme) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // Glassmorphism finish
  backdropFilter: 'blur(12px)',
  backgroundColor: alpha(theme.palette.background.default, 0.6), // More transparent
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  color: theme.palette.text.primary,
  width: '100%',
});

export const getMenuButtonStyles = () => ({
  mr: 2,
  display: { sm: 'none' }, // Show only on mobile
});

export const getMainBoxStyles = (sidebarOpen: boolean, theme: Theme) => ({
  flexGrow: 1,
  p: 3,
  minWidth: 0,
  minHeight: '100vh',
  paddingTop: `${APP_BAR_HEIGHT + 24}px`,

  // Transparent background to let the global animated background show through
  backgroundColor: 'transparent',

  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
});

export const rootBoxStyle = {
  display: 'flex',
  minHeight: '100vh',
  overflow: 'hidden',
};