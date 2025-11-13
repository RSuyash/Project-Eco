import { Box, Typography } from '@mui/material';

interface PlotVisualizerProps {
  title?: string;
}

const PlotVisualizer = ({ 
  title = "10x10m Plot Visualizer" 
}: PlotVisualizerProps) => {
  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Visual representation of the 10x10 plot divided into 4 quadrants */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          border: '2px solid #333',
          width: '100%', // Make it take full width of its container
          height: '100%', // Make it take full height of its container
          backgroundColor: '#e8f5e8',
        }}
      >
        <Box
          sx={{
            border: '1px solid #666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e8f5e8',
          }}
        >
          <Typography variant="h6" color="text.secondary">Q1</Typography>
        </Box>
        <Box
          sx={{
            border: '1px solid #666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e8f5e8',
          }}
        >
          <Typography variant="h6" color="text.secondary">Q2</Typography>
        </Box>
        <Box
          sx={{
            border: '1px solid #666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e8f5e8',
          }}
        >
          <Typography variant="h6" color="text.secondary">Q3</Typography>
        </Box>
        <Box
          sx={{
            border: '1px solid #666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e8f5e8',
          }}
        >
          <Typography variant="h6" color="text.secondary">Q4</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PlotVisualizer;