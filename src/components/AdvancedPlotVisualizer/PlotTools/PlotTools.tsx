import { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';

interface PlotToolsProps {
  onAddPoint?: (x: number, y: number) => void;
  onClearPlot?: () => void;
  onSavePlot?: () => void;
  onRotatePlot?: () => void;
}

const PlotTools = ({
  onAddPoint,
  onClearPlot,
  onSavePlot,
  onRotatePlot
}: PlotToolsProps) => {
  const [activeTool, setActiveTool] = useState<string>('select'); // 'select', 'addPoint', 'measure'

  const handleToolSelect = (tool: string) => {
    setActiveTool(tool);
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Plot Tools
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Button
          variant={activeTool === 'select' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handleToolSelect('select')}
        >
          Select
        </Button>
        <Button
          variant={activeTool === 'addPoint' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handleToolSelect('addPoint')}
        >
          Add Point
        </Button>
        <Button
          variant={activeTool === 'measure' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handleToolSelect('measure')}
        >
          Measure
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Tooltip title="Add a point to the plot">
          <IconButton onClick={() => onAddPoint?.(Math.random() * 100, Math.random() * 100)}>
            <AddIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Clear all points">
          <IconButton onClick={onClearPlot}>
            <RemoveIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Save plot">
          <IconButton onClick={onSavePlot}>
            <SaveIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Rotate plot">
          <IconButton onClick={onRotatePlot}>
            <RotateLeftIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        Active tool: {activeTool}
      </Typography>
    </Paper>
  );
};

export default PlotTools;