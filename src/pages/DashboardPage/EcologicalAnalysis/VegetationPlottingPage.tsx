import { Box, Typography, Grid, Paper } from '@mui/material';
import PlotVisualizer from '../../../components/PlotVisualizer/PlotVisualizer';
import Breadcrumb from '../../../components/Breadcrumb';

const VegetationPlottingPage = () => {
  return (
    <Box>
      <Breadcrumb />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Vegetation Plotting
        </Typography>
        <Typography variant="h6" gutterBottom color="text.secondary">
          Field data collection and analysis for vegetation surveys
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Field Data Collection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Protocols for collecting vegetation data in the field including species identification,
                abundance counts, coverage measurements, and environmental parameters.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Data Visualization & Analysis
              </Typography>
              <PlotVisualizer title="Vegetation Distribution Map" />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default VegetationPlottingPage;