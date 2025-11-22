import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  GridOn, Forest, Grass, Layers, Map as MapIcon, Refresh, Settings
} from '@mui/icons-material';

import PlotVisualizer from './PlotVisualizer';
import { VisualTreeNode, VisualSubplotNode, InteractionMode } from './types';
import { distributeTreesInQuadrant } from './PlotVisualizerService';
import { PlotConfiguration } from '../../types/plot';

export interface PlotExplorerProps {
  data: { trees: any[]; subplots: any[] };
  plotId: string;
}

// --- Mock Configurations for Testing ---
const PRESET_CONFIGS: Record<string, PlotConfiguration> = {
  'standard_10x10': {
    type: 'standard',
    dimensions: { width: 10, height: 10, unit: 'm' },
    grid: { rows: 10, cols: 10, labeling: 'sequential' },
    subdivisions: [
      { id: 'SP1', type: 'subplot_herb', dimensions: { width: 1, height: 1, unit: 'm' }, position_x: 0, position_y: 0, relative_to: 'plot_origin', required_data: [] },
      { id: 'SP2', type: 'subplot_herb', dimensions: { width: 1, height: 1, unit: 'm' }, position_x: 9, position_y: 0, relative_to: 'plot_origin', required_data: [] },
      { id: 'SP3', type: 'subplot_herb', dimensions: { width: 1, height: 1, unit: 'm' }, position_x: 0, position_y: 9, relative_to: 'plot_origin', required_data: [] },
      { id: 'SP4', type: 'subplot_herb', dimensions: { width: 1, height: 1, unit: 'm' }, position_x: 9, position_y: 9, relative_to: 'plot_origin', required_data: [] }
    ]
  },
  'large_20x20': {
    type: 'standard',
    dimensions: { width: 20, height: 20, unit: 'm' },
    grid: { rows: 20, cols: 20, labeling: 'sequential' },
    subdivisions: [
      { id: 'Q1-SP', type: 'subplot_herb', dimensions: { width: 2, height: 2, unit: 'm' }, position_x: 0, position_y: 0, relative_to: 'plot_origin', required_data: [] },
      { id: 'Q2-SP', type: 'subplot_herb', dimensions: { width: 2, height: 2, unit: 'm' }, position_x: 18, position_y: 0, relative_to: 'plot_origin', required_data: [] },
      { id: 'Q3-SP', type: 'subplot_herb', dimensions: { width: 2, height: 2, unit: 'm' }, position_x: 0, position_y: 18, relative_to: 'plot_origin', required_data: [] },
      { id: 'Q4-SP', type: 'subplot_herb', dimensions: { width: 2, height: 2, unit: 'm' }, position_x: 18, position_y: 18, relative_to: 'plot_origin', required_data: [] }
    ]
  },
  'species_area_curve': {
    type: 'species_area_curve',
    dimensions: { width: 20, height: 20, unit: 'm' },
    grid: { rows: 20, cols: 20, labeling: 'sequential' },
    subdivisions: [
      { id: '5x5', type: 'custom', dimensions: { width: 5, height: 5, unit: 'm' }, position_x: 0, position_y: 0, relative_to: 'plot_origin', required_data: [] },
      { id: '10x10', type: 'custom', dimensions: { width: 10, height: 10, unit: 'm' }, position_x: 0, position_y: 0, relative_to: 'plot_origin', required_data: [] },
      { id: '15x15', type: 'custom', dimensions: { width: 15, height: 15, unit: 'm' }, position_x: 0, position_y: 0, relative_to: 'plot_origin', required_data: [] }
    ]
  }
};

const PlotExplorer: React.FC<PlotExplorerProps> = ({ data, plotId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // --- State ---
  const [activeConfigKey, setActiveConfigKey] = useState<string>('standard_10x10');
  const [settings, setSettings] = useState({
    showGrid: true,
    showQuadrants: true,
    showLabels: true,
    showWoody: true,
    showHerb: true
  });
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('view');
  const [selectedTreeIds, setSelectedTreeIds] = useState<string[]>([]);
  const [highlightedSpecies, setHighlightedSpecies] = useState<string | null>(null);
  const [layoutSeed, setLayoutSeed] = useState(0);

  // --- Data Processing ---
  const visualizationData = useMemo(() => {
    const safeData = data || { trees: [], subplots: [] };

    // 1. Trees
    const rawNodes: VisualTreeNode[] = (safeData.trees || []).map((t: any, i: number) => ({
      id: t.id || `t-${i}`,
      species: t.species || 'Unknown',
      x: 0, y: 0,
      // Standardize radius: 1.5% to 5% of plot width
      radius: Math.max(1.5, Math.min(5, (t.gbh || t.size || 10) / 25)),
      height: t.height || (Math.random() * 15 + 2),
      color: t.color || '#2E7D32',
      gbh: t.gbh || t.size || 0,
      quadrant: t.quadId || t.quadrant || ['Q1', 'Q2', 'Q3', 'Q4'][i % 4]
    }));

    // Physics Layout
    let processedTrees: VisualTreeNode[] = [];
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
      const quadTrees = rawNodes.filter(n => n.quadrant === q);
      const distributed = distributeTreesInQuadrant(quadTrees, q);
      processedTrees = [...processedTrees, ...distributed];
    });

    return { trees: processedTrees };
  }, [data, layoutSeed]);

  const activeConfig = PRESET_CONFIGS[activeConfigKey];

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>

      {/* 1. Toolbar (Compact) */}
      <Paper
        elevation={0}
        sx={{
          p: 1, px: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
          flexShrink: 0,
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapIcon color="primary" fontSize="small" />
            {plotId}
          </Typography>

          {/* Config Selector */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={activeConfigKey}
              onChange={(e) => setActiveConfigKey(e.target.value)}
              displayEmpty
              variant="outlined"
              sx={{ height: 32, fontSize: '0.875rem' }}
            >
              <MenuItem value="standard_10x10">Standard 10x10m</MenuItem>
              <MenuItem value="large_20x20">Large 20x20m</MenuItem>
              <MenuItem value="species_area_curve">Species Area Curve</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Stack direction="row" spacing={1}>
          <ToggleButtonGroup
            size="small"
            value={interactionMode}
            exclusive
            onChange={(_, v) => v && setInteractionMode(v)}
            aria-label="mode"
            sx={{ height: 32 }}
          >
            <ToggleButton value="view" sx={{ px: 2 }}>View</ToggleButton>
            <ToggleButton value="select" sx={{ px: 2 }}>Select</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Re-run Layout">
            <IconButton size="small" onClick={() => setLayoutSeed(s => s + 1)}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* 2. Visualization Container (Responsive Fit) */}
      <Box sx={{
        flexGrow: 1,
        position: 'relative',
        p: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f7'
      }}>
        {/* Aspect Ratio Wrapper - Key to "Fitting Right" */}
        <Box sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Box sx={{
            // Use CSS min() to fit within whichever dimension is smaller
            width: 'min(100%, 100vh - 120px)', // Subtract header/padding space
            aspectRatio: '1/1',
            position: 'relative',
            boxShadow: theme.shadows[8],
            borderRadius: 2
          }}>
            <PlotVisualizer
              config={activeConfig}
              trees={visualizationData.trees}
              interactionMode={interactionMode}
              highlightedSpecies={highlightedSpecies}
              selectedTreeIds={selectedTreeIds}
              onTreeSelect={(id, multi) => {
                if (!multi) setSelectedTreeIds([id]);
                else setSelectedTreeIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
              }}
              onTreeMove={() => { }} // Visual only
              showGrid={settings.showGrid}
              showSubplots={settings.showHerb}
              showTrees={settings.showWoody}
              showLabels={settings.showLabels}
            />
          </Box>
        </Box>

        {/* 3. Floating HUD Controls (Semi-transparent) */}
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            p: 2,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.85),
            backdropFilter: 'blur(8px)',
            border: '1px solid',
            borderColor: 'divider',
            width: 180,
            display: isMobile ? 'none' : 'block'
          }}
        >
          <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            LAYERS
          </Typography>
          <Stack spacing={0}>
            <FormControlLabel
              control={<Switch size="small" checked={settings.showWoody} onChange={() => toggleSetting('showWoody')} />}
              label={<Box sx={{ display: 'flex', gap: 1, fontSize: '0.8rem' }}><Forest fontSize="small" color={settings.showWoody ? 'primary' : 'disabled'} /> Canopy</Box>}
            />
            <FormControlLabel
              control={<Switch size="small" checked={settings.showHerb} onChange={() => toggleSetting('showHerb')} />}
              label={<Box sx={{ display: 'flex', gap: 1, fontSize: '0.8rem' }}><Grass fontSize="small" color={settings.showHerb ? 'success' : 'disabled'} /> Subplots</Box>}
            />
            <Divider sx={{ my: 1 }} />
            <FormControlLabel
              control={<Switch size="small" checked={settings.showGrid} onChange={() => toggleSetting('showGrid')} />}
              label={<Box sx={{ display: 'flex', gap: 1, fontSize: '0.8rem' }}><GridOn fontSize="small" color="action" /> Grid</Box>}
            />
            <FormControlLabel
              control={<Switch size="small" checked={settings.showQuadrants} onChange={() => toggleSetting('showQuadrants')} />}
              label={<Box sx={{ display: 'flex', gap: 1, fontSize: '0.8rem' }}><Layers fontSize="small" color="action" /> Quadrants</Box>}
            />
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default PlotExplorer;