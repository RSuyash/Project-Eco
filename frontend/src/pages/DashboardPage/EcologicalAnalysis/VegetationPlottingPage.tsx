import { Box, Typography, Grid, Paper, useTheme, Chip } from '@mui/material';
import PlotVisualizer from '../../../components/PlotVisualizer/PlotVisualizer';
import Breadcrumb from '../../../components/Breadcrumb';

// Icons
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GrassIcon from '@mui/icons-material/Grass';
import SettingsIcon from '@mui/icons-material/Settings';
import ExtensionIcon from '@mui/icons-material/Extension';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';

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
    // FIX: Changed height from 100vh to 100% to fit within the dashboard container without double scrollbars
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 120px)' }}>
      <Breadcrumb />
      
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden', gap: 2 }}>
        {/* Left Panel (Controls) */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', sm: '320px' }, 
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            [theme.breakpoints.down('sm')]: {
              display: 'none' // Hide on mobile for now or make collapsible
            },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
            <GrassIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            Controls
          </Typography>

          {/* Data Input Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>
              Data Source
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                 <UploadFileIcon color="action" />
                 <Box>
                   <Typography variant="body2" fontWeight={600}>Upload CSV</Typography>
                   <Typography variant="caption" color="text.secondary">Drag & drop file</Typography>
                 </Box>
               </Box>
            </Paper>
          </Box>

          {/* Analysis Options */}
          <Box sx={{ mb: 4 }}>
             <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>
              Parameters
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
               <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Plot Size</Typography>
                  <Typography variant="body2" fontWeight={500}>10m x 10m</Typography>
               </Box>
               <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Filter Species</Typography>
                  <Typography variant="body2" fontWeight={500} color="text.disabled">All Species</Typography>
               </Box>
            </Box>
          </Box>
        </Paper>

        {/* Right Panel (Canvas) */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Paper 
            variant="outlined" 
            sx={{ 
              height: '100%', 
              width: '100%', 
              p: 0, 
              overflow: 'hidden',
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScatterPlotIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={700}>Visualization Canvas</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                 <Chip label="Grid On" size="small" color="primary" variant="outlined" />
                 <Chip label="Live Update" size="small" color="success" variant="dot" />
              </Box>
            </Box>
            
            {/* Actual Visualizer Component */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
               <Box sx={{ height: '100%', minHeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlotVisualizer />
               </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default VegetationPlottingPage;