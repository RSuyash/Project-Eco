import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { useAppTheme } from './contexts/ThemeContext';
import getTheme from './theme';
import HomePage from './pages/HomePage/HomePage';
import DashboardPage from './pages/DashboardPage/DashboardPage';

function ThemedApp() {
  const { mode } = useAppTheme();
  const theme = getTheme(mode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard/*" element={<DashboardPage />} />
        </Routes>
      </Router>
    </MuiThemeProvider>
  );
}

function App() {
  return <ThemedApp />;
}

export default App;
