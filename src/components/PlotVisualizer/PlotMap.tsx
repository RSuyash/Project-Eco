// src/components/PlotVisualizer/PlotMap.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { PlotVisualizer, Legend } from './PlotVisualizer';
import { processPlotData } from './PlotVisualizerService';
import { WoodyData, HerbData, PlotData } from './types';
import { readCSVFile, parseCSVData } from '../../services/dataImportService';

interface PlotMapProps {
  selectedPlotId?: string | null;
}

const PlotMap: React.FC<PlotMapProps> = ({ selectedPlotId }) => {
  const [woodyData, setWoodyData] = useState<WoodyData[]>([]);
  const [herbData, setHerbData] = useState<HerbData[]>([]);
  const [plots, setPlots] = useState<PlotData[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
  const [visualizationData, setVisualizationData] = useState<any>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Change to md breakpoint for better mobile experience

  // Fetch plot data on component mount
  useEffect(() => {
    const loadPlotData = async () => {
      try {
        const woodyCsvText = await readCSVFile('/vegetation-plotting/field-data/woody_vegetation.csv');
        const herbFloorCsvText = await readCSVFile('/vegetation-plotting/field-data/herb_floor_vegetation.csv');

        const woodyRawData = parseCSVData(woodyCsvText) as any[];
        const herbFloorRawData = parseCSVData(herbFloorCsvText) as any[];

        // Convert raw data to typed data
        const typedWoodyData: WoodyData[] = woodyRawData.map(row => ({
          Plot_ID: row.Plot_ID,
          Location_Name: row.Location_Name,
          Quad_ID: row.Quad_ID as 'Q1' | 'Q2' | 'Q3' | 'Q4',
          Species_Scientific: row.Species_Scientific,
          Growth_Form: row.Growth_Form,
          Tree_ID: row.Tree_ID,
          Total_GBH_cm: parseFloat(row.Total_GBH_cm) || 0
        }));

        const typedHerbData: HerbData[] = herbFloorRawData.map(row => ({
          Plot_ID: row.Plot_ID,
          Location_Name: row.Location_Name,
          Subplot_ID: row.Subplot_ID as 'SP1' | 'SP2' | 'SP3' | 'SP4',
          Layer_Type: row.Layer_Type as 'Herb' | 'Grass' | 'Litter' | 'Bare Soil',
          'Count_or_Cover%': parseFloat(row['Count_or_Cover%']) || 0
        }));

        setWoodyData(typedWoodyData);
        setHerbData(typedHerbData);

        // Generate plot list
        const plotIds = [...new Set(typedWoodyData.map(row => row.Plot_ID))];
        const plotData: PlotData[] = plotIds.map(plotId => {
          const woodyPlots = typedWoodyData.filter(row => row.Plot_ID === plotId);
          const herbPlots = typedHerbData.filter(row => row.Plot_ID === plotId);

          const woodySpecies = [...new Set(woodyPlots.map(p => p.Species_Scientific))];
          const herbSpecies = [...new Set(herbPlots.map(p => p.Species_Scientific))];

          const speciesCounts = woodyPlots.reduce((acc, plot) => {
            acc[plot.Species_Scientific] = (acc[plot.Species_Scientific] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const dominantWoodySpecies = Object.keys(speciesCounts).reduce((a, b) => 
            speciesCounts[a] > speciesCounts[b] ? a : b, '');

          return {
            id: plotId,
            name: `${plotId} - ${woodyPlots[0]?.Location_Name || 'Unknown Location'}`,
            location: woodyPlots[0]?.Location_Name || 'Unknown Location',
            woodySpeciesCount: woodySpecies.length,
            herbSpeciesCount: herbSpecies.length,
            dominantWoodySpecies,
          };
        });

        setPlots(plotData);

        // Set initial selection if provided via props or default to first plot
        const initialPlot = selectedPlotId || plotData[0]?.id || null;
        if (initialPlot) {
          setSelectedPlot(initialPlot);
        }
      } catch (err) {
        console.error('Error loading plot data:', err);
      }
    };

    loadPlotData();
  }, [selectedPlotId]);

  // Update visualization when selected plot changes
  useEffect(() => {
    if (selectedPlot && woodyData.length > 0 && herbData.length > 0) {
      const data = processPlotData(woodyData, herbData, selectedPlot);
      setVisualizationData(data);
    }
  }, [selectedPlot, woodyData, herbData]);

  const handlePlotChange = (event: SelectChangeEvent<string>) => {
    setSelectedPlot(event.target.value as string);
  };

  if (plots.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Loading plot data...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 0,           // Remove internal padding to maximize space
        mb: 2,
        height: '100%',
        width: '100%',   // Explicitly set width to 100%
        display: 'flex',
        flexDirection: 'column',
        flex: 1,         // Allow it to grow to fill available space
      }}
    >
      {/* Header with title and dropdown - full width */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 1 : 2,
        p: 2,           // Add padding only to header
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6" sx={{ minWidth: isMobile ? '100%' : 'auto' }}>
          Vegetation Plots Map
        </Typography>
        <FormControl variant="outlined" sx={{ minWidth: isMobile ? '100%' : 300, flex: 1 }}>
          <InputLabel id="plot-select-label">Select Plot</InputLabel>
          <Select
            labelId="plot-select-label"
            id="plot-select"
            value={selectedPlot || ''}
            onChange={handlePlotChange}
            label="Select Plot"
          >
            {plots.map(plot => (
              <MenuItem key={plot.id} value={plot.id}>
                {plot.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Main content area */}
      <Box sx={{ p: 2, flex: 1 }}>
        {visualizationData && selectedPlot && (
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {/* Visualization area - takes available space */}
            <Grid item xs={12} md={selectedPlot ? 9 : 12} sx={{ height: '100%' }}>
              <Box sx={{
                height: '100%',
                width: '100%',  // Ensure full width
                minHeight: { xs: '500px', md: '600px' }  // Set minimum heights for better visualization
              }}>
                <PlotVisualizer
                  plotSize={10}
                  plotLabel={plots.find(p => p.id === selectedPlot)?.name || selectedPlot}
                  showQuadrants={true}
                  subplots={visualizationData.subplots}
                  woodyGlyphs={visualizationData.woodyGlyphs}
                  woodyLegend={visualizationData.woodyLegend}
                  herbLegend={visualizationData.herbLegend}
                />
              </Box>
            </Grid>

            {/* Legend area - only shown when plot is selected */}
            {selectedPlot && (
              <Grid item xs={12} md={3} sx={{ height: '100%' }}>
                <Box sx={{
                  height: '100%',
                  minWidth: { xs: '100%', md: 250 },
                  maxWidth: { xs: '100%', md: 250 }
                }}>
                  <Legend
                    woody={visualizationData.woodyLegend}
                    herb={visualizationData.herbLegend}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </Paper>
  );
};

export default PlotMap;