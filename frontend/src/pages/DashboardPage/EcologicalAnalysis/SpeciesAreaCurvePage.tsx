import { Box, Typography, Grid, Paper } from '@mui/material';
import PlotVisualizer from '../../../components/PlotVisualizer/PlotVisualizer';
import Breadcrumb from '../../../components/Breadcrumb';

const SpeciesAreaCurvePage = () => {
  return (
    <Box>
      <Breadcrumb />
      <Box sx={{ p: 3, mt: 0 }}>
        <Typography variant="h4" gutterBottom>
          Species-Area Curve
        </Typography>
        <Typography variant="h6" gutterBottom color="text.secondary">
          Field sampling protocols and analysis for species-area relationships
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Field Data Collection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Systematic and random sampling protocols for determining species-area relationships,
                including plot size variations and replication strategies.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Data Visualization & Analysis
              </Typography>
              <PlotVisualizer title="Species-Area Relationship Graph" />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SpeciesAreaCurvePage;