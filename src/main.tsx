import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme';
import { AppThemeProvider, useAppTheme } from './contexts/ThemeContext';

const ThemeApplicator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode } = useAppTheme();
  const theme = getTheme(mode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <ThemeApplicator>
        <App />
      </ThemeApplicator>
    </AppThemeProvider>
  </React.StrictMode>
);
