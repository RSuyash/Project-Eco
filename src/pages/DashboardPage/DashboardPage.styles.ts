import { Theme } from '@mui/material/styles';

export const getAppBarStyles = (sidebarOpen: boolean, theme: Theme) => ({
  width: { sm: sidebarOpen ? `calc(100% - 240px)` : `calc(100% - 64px)` },
  ml: { sm: sidebarOpen ? '240px' : '64px' },
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(sidebarOpen && {
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
});

export const getMenuButtonStyles = () => ({
  mr: 2,
  display: { sm: 'none' },
});

export const getMainBoxStyles = (sidebarOpen: boolean, theme: Theme) => ({
  flexGrow: 1,
  p: 3,
  width: '100%',
  marginLeft: { sm: sidebarOpen ? '240px' : '64px' },
  minHeight: `calc(100vh - 64px)`, // Account for AppBar height
  marginTop: '64px', // Account for fixed AppBar
  backgroundColor: theme.palette.background.default, // Ensure proper background
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(sidebarOpen && {
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
});

export const rootBoxStyle = {
  display: 'flex',
};
