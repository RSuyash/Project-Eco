import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  CssBaseline,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Sidebar from '../../components/Sidebar';
import EcologicalAnalysisPage from './EcologicalAnalysisPage';
import VegetationPlottingPage from './EcologicalAnalysis/VegetationPlottingPage';
import SpeciesAreaCurvePage from './EcologicalAnalysis/SpeciesAreaCurvePage';
import BirdMonitoringPage from './EcologicalAnalysis/BirdMonitoringPage';
import BatSurveyPage from './EcologicalAnalysis/BatSurveyPage';
import FloraPage from './EcologicalAnalysis/FloraPage';
import FaunaPage from './EcologicalAnalysis/FaunaPage';
import LandscapePage from './EcologicalAnalysis/LandscapePage';
import DataAnalysisPage from './EcologicalAnalysis/DataAnalysisPage';
import { getAppBarStyles, getMenuButtonStyles, getMainBoxStyles, rootBoxStyle } from './DashboardPage.styles';
import { useAppTheme } from '../../contexts/ThemeContext';

const DashboardPage = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={rootBoxStyle}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={getAppBarStyles(sidebarOpen, theme)}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            sx={getMenuButtonStyles()}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <IconButton
            color="inherit"
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            sx={{ ml: 1 }}
            onClick={toggleTheme}
            color="inherit"
            aria-label="toggle theme"
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={handleDrawerToggle} 
      />
      <Box
        component="main"
        sx={getMainBoxStyles(sidebarOpen, theme)}
      >
        <Routes>
          <Route path="ecological-analysis" element={<EcologicalAnalysisPage />} />
          <Route path="ecological-analysis/vegetation-plotting" element={<VegetationPlottingPage />} />
          <Route path="ecological-analysis/species-area-curve" element={<SpeciesAreaCurvePage />} />
          <Route path="ecological-analysis/bird-monitoring" element={<BirdMonitoringPage />} />
          <Route path="ecological-analysis/bat-survey" element={<BatSurveyPage />} />
          <Route path="ecological-analysis/flora" element={<FloraPage />} />
          <Route path="ecological-analysis/fauna" element={<FaunaPage />} />
          <Route path="ecological-analysis/landscape" element={<LandscapePage />} />
          <Route path="ecological-analysis/data-analysis" element={<DataAnalysisPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default DashboardPage;
