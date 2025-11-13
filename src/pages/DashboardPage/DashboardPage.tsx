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
import ForestIcon from '@mui/icons-material/Forest';
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
import ProjectsPage from './ProjectsPage';
import ProjectViewPage from './ProjectViewPage';
import NewProjectPage from './NewProjectPage';
import CanopyAnalysisPage from './CanopyAnalysisPage';
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
          
          {/* App Title/Logo Section */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'background.paper',
              borderRadius: '8px',
              padding: '6px 12px',
              boxShadow: 1,
              mr: 2,
              height: '40px'
            }}
          >
            <ForestIcon sx={{ color: 'primary.main', mr: 1 }} />
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '1.2rem'
              }}
            >
              EcoData
            </Typography>
          </Box>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Ecological Analysis
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
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id/view" element={<ProjectViewPage />} />
          <Route path="projects/:id/edit" element={<ProjectsPage />} />
          <Route path="projects/new" element={<NewProjectPage />} />
          <Route path="projects/:id/canopy-analysis" element={<CanopyAnalysisPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default DashboardPage;
