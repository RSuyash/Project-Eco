import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Slider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlotTools from './PlotTools/PlotTools';
import PlotDataDisplay from './DataDisplay/PlotDataDisplay';

interface AdvancedPlotVisualizerProps {
  title?: string;
}

const AdvancedPlotVisualizer = ({
  title = "Advanced Plot Visualizer"
}: AdvancedPlotVisualizerProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Changed from 'lg' to 'md'
  
  // State for plot dimensions (in meters)
  const [plotSize, setPlotSize] = useState<number>(10); // in meters
  const [showQuadrants, setShowQuadrants] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [gridDivision, setGridDivision] = useState<number>(10); // divide into n x n grid
  const [quadrantLabels, setQuadrantLabels] = useState<string[]>(['Q1', 'Q2', 'Q3', 'Q4']);
  
  // State for plot data
  const [plotData, setPlotData] = useState<Array<{
    id: number;
    x: number;
    y: number;
    type: string;
    description: string;
  }>>([]);

  // Calculate plot size based on screen size
  const basePlotSize = isMobile ? 300 : 500; // Smaller on mobile
  const plotScale = basePlotSize / plotSize;

  const handlePlotSizeChange = (event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setPlotSize(value);
  };

  const handleGridDivisionChange = (event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setGridDivision(value);
  };

  const handleQuadrantLabelChange = (index: number, value: string) => {
    const newLabels = [...quadrantLabels];
    newLabels[index] = value;
    setQuadrantLabels(newLabels);
  };
  
  const handleAddPoint = (x: number, y: number) => {
    const newPoint = {
      id: plotData.length + 1,
      x: (x / basePlotSize) * plotSize, // Convert pixel coords to meter coords
      y: (y / basePlotSize) * plotSize,
      type: 'Sample Point',
      description: `Point at (${((x / basePlotSize) * plotSize).toFixed(2)}m, ${((y / basePlotSize) * plotSize).toFixed(2)}m)`
    };
    setPlotData([...plotData, newPoint]);
  };
  
  const handleClearPlot = () => {
    setPlotData([]);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        height: '100%', 
        width: '100%',
        flexDirection: isMobile ? 'column' : 'row' // Stack on mobile, side-by-side on desktop
      }}
    >
      {/* Settings Panel */}
      <Paper 
        elevation={3} 
        sx={{ 
          width: isMobile ? '100%' : 350, 
          p: 2, 
          mb: isMobile ? 2 : 0,
          mr: isMobile ? 0 : 2,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          flex: isMobile ? 'none' : 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <IconButton sx={{ ml: 1 }}>
            <SettingsIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {/* Plot Size Control */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Plot Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Plot Size: {plotSize}m x {plotSize}m
                </Typography>
                <Slider
                  value={plotSize}
                  onChange={handlePlotSizeChange}
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={5}
                  max={50}
                />
                <Typography variant="caption" color="textSecondary">
                  Adjust plot dimensions (5m to 50m)
                </Typography>
              </Box>
              
              {/* Quadrant Controls */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Show Quadrants</InputLabel>
                  <Select
                    value={showQuadrants.toString()}
                    label="Show Quadrants"
                    onChange={(e) => setShowQuadrants(e.target.value === 'true')}
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
                
                {/* Quadrant Labels */}
                {showQuadrants && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Quadrant Labels
                    </Typography>
                    <Grid container spacing={1}>
                      {quadrantLabels.map((label, index) => (
                        <Grid item xs={6} key={index}>
                          <TextField
                            label={`Q${index + 1}`}
                            value={label}
                            onChange={(e) => handleQuadrantLabelChange(index, e.target.value)}
                            size="small"
                            fullWidth
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Box>
              
              {/* Grid Controls */}
              <Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Show Grid</InputLabel>
                  <Select
                    value={showGrid.toString()}
                    label="Show Grid"
                    onChange={(e) => setShowGrid(e.target.value === 'true')}
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
                
                {showGrid && (
                  <>
                    <Typography gutterBottom>
                      Grid Division: {gridDivision}x{gridDivision}
                    </Typography>
                    <Slider
                      value={gridDivision}
                      onChange={handleGridDivisionChange}
                      valueLabelDisplay="auto"
                      step={1}
                      marks
                      min={2}
                      max={20}
                    />
                    <Typography variant="caption" color="textSecondary">
                      Divide plot into {gridDivision}x{gridDivision} grid
                    </Typography>
                  </>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
          
          {/* Plot Tools */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Plot Tools</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <PlotTools 
                onAddPoint={handleAddPoint}
                onClearPlot={handleClearPlot}
              />
            </AccordionDetails>
          </Accordion>
          
          {/* Data Display */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Plot Data</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <PlotDataDisplay plotData={plotData} />
            </AccordionDetails>
          </Accordion>
        </Box>
      </Paper>
      
      {/* Plot Visualization - Right Side (or bottom on mobile) */}
      <Box sx={{ 
        flex: 1, 
        p: isMobile ? 1 : 2, 
        overflow: 'auto', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: isMobile ? '400px' : 'auto'
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            width: isMobile ? '100%' : basePlotSize + 40, // Full width on mobile
            height: isMobile ? 'auto' : basePlotSize + 100, // Auto height on mobile
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            {plotSize}m x {plotSize}m Plot
          </Typography>
          
          <Box
            sx={{
              width: isMobile ? '100%' : basePlotSize,
              height: isMobile ? 300 : basePlotSize, // Fixed height on mobile to prevent squishing
              border: '2px solid #000',
              position: 'relative',
              backgroundColor: '#e8f5e8', // Light green background
              maxWidth: '100%',
              maxHeight: '100%',
              overflow: 'hidden' // Prevent overflow in small containers
            }}
          >
            {/* Grid lines */}
            {showGrid && gridDivision > 1 && (
              <>
                {/* Horizontal grid lines */}
                {Array.from({ length: gridDivision - 1 }).map((_, index) => (
                  <Box
                    key={`h-${index}`}
                    sx={{
                      position: 'absolute',
                      top: `${((index + 1) / gridDivision) * 100}%`,
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundColor: '#aaa',
                      transform: 'translateY(-0.5px)',
                    }}
                  />
                ))}
                
                {/* Vertical grid lines */}
                {Array.from({ length: gridDivision - 1 }).map((_, index) => (
                  <Box
                    key={`v-${index}`}
                    sx={{
                      position: 'absolute',
                      left: `${((index + 1) / gridDivision) * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: '1px',
                      backgroundColor: '#aaa',
                      transform: 'translateX(-0.5px)',
                    }}
                  />
                ))}
              </>
            )}
            
            {/* Quadrant lines */}
            {showQuadrants && (
              <>
                {/* Horizontal quadrant line */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#000',
                    transform: 'translateY(-1px)',
                  }}
                />
                
                {/* Vertical quadrant line */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    backgroundColor: '#000',
                    transform: 'translateX(-1px)',
                  }}
                />
                
                {/* Quadrant labels */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '25%',
                    left: '25%',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  {quadrantLabels[0]}
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '25%',
                    right: '25%',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  {quadrantLabels[1]}
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '25%',
                    left: '25%',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  {quadrantLabels[2]}
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '25%',
                    right: '25%',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  {quadrantLabels[3]}
                </Box>
              </>
            )}
            
            {/* Plot data points */}
            {plotData.map((point) => (
              <Box
                key={point.id}
                sx={{
                  position: 'absolute',
                  left: `${(point.x / plotSize) * 100}%`,
                  top: `${(point.y / plotSize) * 100}%`,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#ff5722',
                  transform: 'translate(-50%, -50%)',
                  border: '2px solid white',
                  zIndex: 10,
                }}
              />
            ))}
          </Box>
          
          <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
            <Typography variant="body2" color="textSecondary">
              {plotSize}m x {plotSize}m plot ({isMobile ? '300' : basePlotSize}px x {isMobile ? '300' : basePlotSize}px)
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdvancedPlotVisualizer;