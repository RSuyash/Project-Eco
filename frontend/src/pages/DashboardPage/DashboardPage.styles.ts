import { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material';

const APP_BAR_HEIGHT = 64;

// Only AppBar needs width calculation to sit *over* the content but next to sidebar
// OR it can sit over everything (zIndex drawer + 1).
// The best "Gold Standard" usually puts AppBar *next* to the sidebar on Desktop (clipped)
// or *above* the sidebar (clipped sidebar).
// Based on the Sidebar.tsx implementation (Toolbar inside Sidebar), the AppBar sits NEXT to it.

export const getAppBarStyles = (sidebarOpen: boolean, theme: Theme) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // Glassmorphism finish
  backdropFilter: 'blur(6px)',
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none', // Cleaner, flat look
  
  // On desktop, the AppBar usually spans the full width if zIndex is higher,
  // OR it starts after the sidebar. Let's make it span full width for a "Clipped Drawer" look
  // or adjust margin if we want "Persistent Drawer" look.
  // Given the sidebar has a Toolbar spacer, let's ensure AppBar is fixed at top and full width
  // but typically the content flows under it.
  width: '100%',
});

export const getMenuButtonStyles = () => ({
  mr: 2,
  display: { sm: 'none' }, // Show only on mobile
});

export const getMainBoxStyles = (sidebarOpen: boolean, theme: Theme) => ({
  flexGrow: 1,
  p: 3,
  // CRITICAL FIX: Removed marginLeft/width calculations. 
  // Flexbox handles the positioning relative to the Sidebar component.
  minWidth: 0, // Prevents flex child from overflowing
  minHeight: '100vh',
  paddingTop: `${APP_BAR_HEIGHT + 24}px`, // Keep space for fixed AppBar
  
  backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
});

export const rootBoxStyle = {
  display: 'flex',
  minHeight: '100vh',
  overflow: 'hidden', // Prevents horizontal scrollbar during transitions
};