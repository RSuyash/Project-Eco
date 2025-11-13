import { Box, Typography, Grid, Paper } from '@mui/material';
import Breadcrumb from '../../../components/Breadcrumb';

const BirdMonitoringPage = () => {
  return (
    <Box>
      <Breadcrumb />
      <Box sx={{ p: 3, mt: 0 }}>
        <Typography variant="h4" gutterBottom>
          Bird Monitoring
        </Typography>
        <Typography variant="h6" gutterBottom color="text.secondary">
          Field surveys and analysis for bird population studies
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Field Data Collection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Standardized protocols for bird surveys including point counts,
                territory mapping, breeding bird surveys, and migration monitoring techniques.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Data Visualization & Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Population trend analysis, species abundance graphs, seasonal distribution maps,
                and diversity indices for bird communities.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default BirdMonitoringPage;