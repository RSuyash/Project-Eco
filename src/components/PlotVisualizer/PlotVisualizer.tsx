import { Box, Typography } from '@mui/material';

interface PlotVisualizerProps {
  plotSize?: number;
  cellSize?: number;
  title?: string;
}

const PlotVisualizer = ({ 
  plotSize = 10, 
  cellSize = 40, 
  title = "10x10m Plot Visualizer" 
}: PlotVisualizerProps) => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${plotSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${plotSize}, ${cellSize}px)`,
          border: '1px solid black',
          width: plotSize * cellSize,
          height: plotSize * cellSize,
        }}
      >
        {Array.from({ length: plotSize * plotSize }).map((_, index) => (
          <Box
            key={index}
            sx={{
              width: cellSize,
              height: cellSize,
              border: '1px solid lightgray',
              boxSizing: 'border-box',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PlotVisualizer;
