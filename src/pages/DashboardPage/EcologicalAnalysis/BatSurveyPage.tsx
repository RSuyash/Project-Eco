import { Box, Typography, Grid, Paper } from '@mui/material';
import Breadcrumb from '../../../components/Breadcrumb';

const BatSurveyPage = () => {
  return (
    <Box>
      <Breadcrumb />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Bat Survey
        </Typography>
        <Typography variant="h6" gutterBottom color="text.secondary">
          Field surveys and analysis for bat population studies
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Field Data Collection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Protocols for bat detection using acoustic surveys, mist netting,
                roost counts, emergence counts, and habitat assessment techniques.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Data Visualization & Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activity pattern analysis, species composition graphs, habitat preference mapping,
                and seasonal variation studies for bat communities.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default BatSurveyPage;