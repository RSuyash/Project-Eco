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
  Tooltip,
  Stack,
  Badge,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
import PlotManagementPage from './PlotManagementPage';

import {
  getAppBarStyles,
  getMenuButtonStyles,
  getMainBoxStyles,
  rootBoxStyle
} from './DashboardPage.styles';
import { useAppTheme } from '../../contexts/ThemeContext';

const DashboardPage = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={rootBoxStyle}>
      <CssBaseline />

      {/* AppBar: Fixed at the top, zIndex higher than drawer */}
      <AppBar
        position="fixed"
        sx={{
          ...getAppBarStyles(sidebarOpen, theme),
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            sx={getMenuButtonStyles()}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo Area */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
              EcoData
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, opacity: 0.7, border: '1px solid', px: 0.5, borderRadius: 1 }}>
              BETA
            </Typography>
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Global Search (Cmd+K)">
              <IconButton color="inherit" size="small">
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Toggle Theme">
              <IconButton onClick={toggleTheme} color="inherit" size="small">
                {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton color="inherit" size="small">
                <Badge badgeContent={3} color="error" variant="dot">
                  <NotificationsNoneIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Help & Support">
              <IconButton color="inherit" size="small">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Box sx={{ ml: 1, pl: 1, borderLeft: `1px solid ${theme.palette.divider}` }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                JD
              </Avatar>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar: Sits in the flex flow on desktop */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={handleDrawerToggle}
      />

      {/* Main Content: Flex grows to fill remaining space */}
      <Box
        component="main"
        sx={getMainBoxStyles(sidebarOpen, theme)}
      >
        <Routes>
          {/* Default Route */}
          <Route index element={<EcologicalAnalysisPage />} />

          {/* Analysis Routes */}
          <Route path="ecological-analysis">
            <Route index element={<EcologicalAnalysisPage />} />
            <Route path="vegetation-plotting" element={<VegetationPlottingPage />} />
            <Route path="species-area-curve" element={<SpeciesAreaCurvePage />} />
            <Route path="bird-monitoring" element={<BirdMonitoringPage />} />
            <Route path="bat-survey" element={<BatSurveyPage />} />
            <Route path="flora" element={<FloraPage />} />
            <Route path="fauna" element={<FaunaPage />} />
            <Route path="landscape" element={<LandscapePage />} />
            <Route path="data-analysis" element={<DataAnalysisPage />} />
          </Route>

          {/* Project Routes */}
          <Route path="projects">
            <Route index element={<ProjectsPage />} />
            <Route path="new" element={<NewProjectPage />} />
            <Route path=":id/view" element={<ProjectViewPage />} />
            <Route path=":id/edit" element={<NewProjectPage isEditing={true} />} />
            <Route path=":id/canopy-analysis" element={<CanopyAnalysisPage />} />
          </Route>

          {/* Plot Routes */}
          <Route path="plots">
            <Route index element={<PlotManagementPage />} />
            <Route path=":id" element={<PlotManagementPage />} />
          </Route>
        </Routes>
      </Box>
    </Box>
  );
};

export default DashboardPage;