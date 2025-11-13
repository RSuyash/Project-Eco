import { Box, Typography, Grid, Paper, Container, useTheme, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PlotVisualizer from '../../../components/PlotVisualizer/PlotVisualizer';
import Breadcrumb from '../../../components/Breadcrumb';

// Icons for the tools/actions
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import GrassIcon from '@mui/icons-material/Grass'; // Main icon for Vegetation Plotting
import SettingsIcon from '@mui/icons-material/Settings';
import ExtensionIcon from '@mui/icons-material/Extension';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot'; // For Plotting Canvas

const VegetationPlottingPage = () => {
  const theme = useTheme();

  // Re-using the section header and container styles
  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    p: 2,
    borderLeft: `5px solid ${theme.palette.primary.main}`,
    mb: 2,
    pl: 2,
    backgroundColor: theme.palette.mode === 'dark' ? '#333842' : '#f0f0f0',
    borderRadius: '4px',
    boxShadow: 1,
  };

  const sectionContainerStyle = {
    mb: 4,
    p: 2,
    backgroundColor: 'background.paper',
    borderRadius: '4px',
    boxShadow: 1,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Breadcrumb />
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel (Scrollable) */}
        <Box
          sx={{
            width: { xs: '100%', sm: '300px' }, // Responsive width
            flexShrink: 0,
            overflowY: 'auto',
            p: 2,
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'background.default',
            [theme.breakpoints.down('sm')]: {
              height: 'auto', // Allow height to be auto on small screens
              borderRight: 'none',
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            // Hide scrollbar by default
            '&::-webkit-scrollbar': {
              width: '0px', // Completely hide for Webkit
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'transparent', // Make thumb transparent by default
            },
            '&:hover::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.main, // Show on hover
              opacity: 1,
            },
            scrollbarWidth: 'none', // Hide for Firefox
            '-ms-overflow-style': 'none', // Hide for IE/Edge
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
            <GrassIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
            Vegetation Plotting Controls
          </Typography>

          {/* Data Input Section */}
          <Box sx={sectionContainerStyle}>
            <Box sx={sectionHeaderStyle}>
              <UploadFileIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Data Input
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload your field data or select from existing datasets.
            </Typography>
            <Paper sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">Upload CSV</Typography>
              <UploadFileIcon color="action" />
            </Paper>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">Select Dataset</Typography>
              <FolderOpenIcon color="action" />
            </Paper>
          </Box>

          {/* Analysis Options Section */}
          <Box sx={sectionContainerStyle}>
            <Box sx={sectionHeaderStyle}>
              <SettingsIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Analysis Options
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure parameters for your vegetation analysis.
            </Typography>
            <Paper sx={{ p: 2, mb: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Plot Type:</Typography>
              {/* Placeholder for a select/radio group */}
              <Box sx={{ height: 30, border: `1px dashed ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">Select Input</Typography>
              </Box>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Species Filter:</Typography>
              {/* Placeholder for a text input/autocomplete */}
              <Box sx={{ height: 30, border: `1px dashed ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">Text Input</Typography>
              </Box>
            </Paper>
          </Box>

          {/* Available Components Section */}
          <Box sx={sectionContainerStyle}>
            <Box sx={sectionHeaderStyle}>
              <ExtensionIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Available Components
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Drag and drop components onto the canvas.
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Paper sx={{ p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'grab' }}>
                  <VisibilityIcon sx={{ fontSize: 24, mb: 0.5 }} />
                  <Typography variant="caption">Visualizer</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'grab' }}>
                  <AssessmentIcon sx={{ fontSize: 24, mb: 0.5 }} />
                  <Typography variant="caption">Report Gen</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Right Panel (Fixed Canvas) */}
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            overflow: 'auto', // Allow scrolling if content exceeds height
            backgroundColor: 'background.default',
            [theme.breakpoints.down('sm')]: {
              height: 'calc(100vh - BreadcrumbHeight - LeftPanelHeight)', // Adjust height on small screens
            },
          }}
        >
          <Paper sx={{ height: '100%', width: '100%', p: 2, overflow: 'auto', backgroundColor: 'background.paper',
            // Hide scrollbar by default
            '&::-webkit-scrollbar': {
              width: '0px', // Completely hide for Webkit
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'transparent', // Make thumb transparent by default
            },
            '&:hover::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.main, // Show on hover
              opacity: 1,
            },
            scrollbarWidth: 'none', // Hide for Firefox
            '-ms-overflow-style': 'none', // Hide for IE/Edge
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
              <ScatterPlotIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
              Plotting Canvas
              {/* New "Cardy Thingies" */}
              <Box sx={{ ml: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label="10x10m" size="small" color="primary" variant="outlined" />
                <Chip label="4 Quadrants" size="small" color="primary" variant="outlined" />
              </Box>
            </Typography>
            <PlotVisualizer />
            {/* Placeholder for other analysis outputs */}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default VegetationPlottingPage;