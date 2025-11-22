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
  Divider
} from '@mui/material';
import {
  Layers as LayersIcon,
  GridOn as GridIcon,
  Forest as ForestIcon,
  Grass as GrassIcon,
  Map as MapIcon,
  Refresh
} from '@mui/icons-material';

import PlotVisualizer from './PlotVisualizer';
import { VisualTreeNode, VisualSubplotNode, InteractionMode } from './types';
import { distributeTreesInQuadrant } from './PlotVisualizerService';

// --- Props ---
export interface PlotExplorerProps {
  data: {
    trees: any[];
    subplots: any[];
  };
  plotId: string;
}

const PlotExplorer: React.FC<PlotExplorerProps> = ({ data, plotId }) => {
  const theme = useTheme();

  // --- State ---
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
  const [layoutSeed, setLayoutSeed] = useState(0); // To force re-layout

  // --- Data Processing Pipeline ---
  const visualizationData = useMemo(() => {
    if (!data) return { trees: [], subplots: [] };

    // 1. Trees: Convert raw data to Visual Trees & Run Physics
    const rawNodes: VisualTreeNode[] = (data.trees || []).map((t: any, i: number) => ({
      id: t.id || `t-${i}`,
      species: t.species || 'Unknown',
      x: 0, // Reset X/Y for physics engine to take over
      y: 0,
      // Calculate Radius based on GBH or Size. 
      // If input is tiny (0-20 scale), multiply it up. Otherwise assume cm.
      radius: Math.max(1.5, Math.min(6, (t.gbh || t.size || 10) / 20)),
      height: t.height || (Math.random() * 15 + 2),
      color: t.color || '#2E7D32',
      gbh: t.gbh || t.size || 0,
      quadrant: t.quadId || t.quadrant || ['Q1', 'Q2', 'Q3', 'Q4'][i % 4] // Fallback to round-robin quadrant
    }));

    // Run Layout Per Quadrant
    let processedTrees: VisualTreeNode[] = [];
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
      const quadTrees = rawNodes.filter(n => n.quadrant === q);
      const distributed = distributeTreesInQuadrant(quadTrees, q);
      processedTrees = [...processedTrees, ...distributed];
    });

    // 2. Subplots: Normalize coordinates to 0-100%
    const processedSubplots: VisualSubplotNode[] = (data.subplots || []).map((s: any, i: number) => {
      // If x/y are missing or small (<20), map them to corners based on index
      const defaultPos = [
        { x: 2, y: 2 }, { x: 88, y: 2 }, { x: 2, y: 88 }, { x: 88, y: 88 }
      ][i % 4];

      return {
        id: s.id || `SP-${i + 1}`,
        // Logic: If val > 20, assume pixels/percent. If <= 20, assume meters (multiply by 10 for %)
        x: s.x ? (s.x > 20 ? s.x : s.x * 10) : defaultPos.x,
        y: s.y ? (s.y > 20 ? s.y : s.y * 10) : defaultPos.y,
        width: 10,
        height: 10,
        data: []
      };
    });

    return { trees: processedTrees, subplots: processedSubplots };
  }, [data, layoutSeed]); // Re-run when data or seed changes

  // --- Handlers ---
  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      height: '100%',
      bgcolor: theme.palette.background.default,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* 1. Toolbar */}
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
          zIndex: 10,
          flexShrink: 0 // Prevent toolbar shrinking
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MapIcon color="primary" fontSize="small" />
          Plot Explorer: {plotId}
        </Typography>

        <Stack direction="row" spacing={1}>
          <ToggleButtonGroup
            size="small"
            value={interactionMode}
            exclusive
            onChange={(_, v) => v && setInteractionMode(v)}
            aria-label="mode"
          >
            <ToggleButton value="view">View</ToggleButton>
            <ToggleButton value="select">Select</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Shuffle Layout">
            <IconButton size="small" onClick={() => setLayoutSeed(s => s + 1)}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* 2. Main Canvas Area - Responsive Layout Fix */}
      <Box sx={{
        flexGrow: 1,
        position: 'relative',
        p: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        {/* The Visualizer Container */}
        {/* Using 'aspect-ratio: 1 / 1' with 'max-height: 100%' ensures it fits vertically 
           without overflowing, while 'width: auto' lets the aspect ratio determine width.
           Fallback width ensures it takes space if aspect-ratio isn't fully supported or needs a base.
        */}
        <Box sx={{
          height: '100%',
          width: 'auto', // Let height dictate width via aspect ratio
          aspectRatio: '1 / 1', // Maintain square shape
          maxHeight: '100%', // Never exceed parent height
          maxWidth: '100%', // Never exceed parent width
          boxShadow: theme.shadows[4],
          borderRadius: 2,
          position: 'relative', // For absolute children
          bgcolor: 'white'
        }}>
          <PlotVisualizer
            trees={visualizationData.trees}
            subplots={visualizationData.subplots}
            settings={settings}
            interactionMode={interactionMode}
            highlightedSpecies={highlightedSpecies}
            selectedTreeIds={selectedTreeIds}
            onTreeSelect={(id, multi) => {
              if (!multi) setSelectedTreeIds([id]);
              else setSelectedTreeIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
            }}
            onTreeMove={(id, x, y) => {
              console.log(`Tree ${id} moved to ${x.toFixed(1)}%, ${y.toFixed(1)}%`);
            }}
          />
        </Box>

        {/* 3. Floating Control Deck */}
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            p: 2,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(8px)',
            width: 200,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            LAYERS
          </Typography>
          <Stack spacing={0}>
            <FormControlLabel
              control={<Switch size="small" checked={settings.showWoody} onChange={() => toggleSetting('showWoody')} />}
              label={<Box sx={{ display: 'flex', gap: 1, fontSize: '0.85rem' }}><ForestIcon fontSize="small" color={settings.showWoody ? 'primary' : 'disabled'} /> Canopy</Box>}
            />
            <FormControlLabel
              control={<Switch size="small" checked={settings.showHerb} onChange={() => toggleSetting('showHerb')} />}
              label={<Box sx={{ display: 'flex', gap: 1, fontSize: '0.85rem' }}><GrassIcon fontSize="small" color={settings.showHerb ? 'success' : 'disabled'} /> Subplots</Box>}
            />
            <Divider sx={{ my: 1 }} />
            <FormControlLabel
              control={<Switch size="small" checked={settings.showGrid} onChange={() => toggleSetting('showGrid')} />}
              label={<Box sx={{ display: 'flex', gap: 1, fontSize: '0.85rem' }}><GridIcon fontSize="small" color="action" /> Grid</Box>}
            />
            <FormControlLabel
              control={<Switch size="small" checked={settings.showQuadrants} onChange={() => toggleSetting('showQuadrants')} />}
              label={<Box sx={{ display: 'flex', gap: 1, fontSize: '0.85rem' }}><LayersIcon fontSize="small" color="action" /> Quadrants</Box>}
            />
          </Stack>
        </Paper>

        {/* 4. Quick Stats Overlay */}
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: 24,
            left: 24,
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            pointerEvents: 'none'
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">Total Individuals</Typography>
            <Typography variant="h6" lineHeight={1}>{visualizationData.trees.length}</Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default PlotExplorer;