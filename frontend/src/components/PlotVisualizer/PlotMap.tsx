import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  useTheme,
  useMediaQuery,
  IconButton,
  InputBase,
  Divider,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import {
  Map as MapIcon,
  Search as SearchIcon,
  ChevronRight,
  List as ListIcon,
  Category as CategoryIcon,
  MenuOpen as MenuOpenIcon,
  AdsClick as SelectIcon,
  OpenWith as MoveIcon,
  Visibility as ViewIcon,
  FilterAltOff as ClearFilterIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// Internal Components
import PlotVisualizer from './PlotVisualizer';
import { processPlotData, PlotVisualizationData } from './PlotVisualizerService';
import { WoodyData, HerbData, PlotData, InteractionMode } from './types';
import { readCSVFile, parseCSVData } from '../../services/dataImportService';

interface PlotMapProps {
  selectedPlotId?: string | null;
}

interface VisualizerSettings {
  showGrid: boolean;
  showQuadrants: boolean;
  showLabels: boolean;
  showWoody: boolean;
  showHerb: boolean;
}

const PlotMap: React.FC<PlotMapProps> = ({ selectedPlotId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // --- Data State ---
  const [woodyData, setWoodyData] = useState<WoodyData[]>([]);
  const [herbData, setHerbData] = useState<HerbData[]>([]);
  const [plots, setPlots] = useState<PlotData[]>([]);
  const [selectedPlotIdState, setSelectedPlotIdState] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<PlotVisualizationData | null>(null);

  // --- UI State ---
  const [sidebarTab, setSidebarTab] = useState(0); 
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedSpecies, setHighlightedSpecies] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('view');
  const [selectedTreeIds, setSelectedTreeIds] = useState<string[]>([]);

  const [viewSettings, setViewSettings] = useState<VisualizerSettings>({
    showGrid: true,
    showQuadrants: true,
    showLabels: true,
    showWoody: true,
    showHerb: true
  });

  // --- 1. Data Loading ---
  useEffect(() => {
    const initData = async () => {
      try {
        // Load real data from CSVs
        const woodyCsv = await readCSVFile('/vegetation-plotting/field-data/woody_vegetation.csv');
        const herbCsv = await readCSVFile('/vegetation-plotting/field-data/herb_floor_vegetation.csv');
        const woodyRaw = parseCSVData(woodyCsv) as any[];
        const herbRaw = parseCSVData(herbCsv) as any[];

        // Normalize
        const normWoody: WoodyData[] = woodyRaw.map(r => ({
          Plot_ID: r.Plot_ID,
          Location_Name: r.Location_Name,
          Quad_ID: r.Quad_ID,
          Species_Scientific: r.Species_Scientific,
          Growth_Form: r.Growth_Form,
          Tree_ID: r.Tree_ID,
          Total_GBH_cm: parseFloat(r.Total_GBH_cm) || 0,
          Height_m: parseFloat(r.Height_m) || undefined
        }));

        const normHerb: HerbData[] = herbRaw.map(r => ({
          Plot_ID: r.Plot_ID,
          Location_Name: r.Location_Name,
          Subplot_ID: r.Subplot_ID,
          Layer_Type: r.Layer_Type,
          'Count_or_Cover%': parseFloat(r['Count_or_Cover%']) || 0
        }));

        setWoodyData(normWoody);
        setHerbData(normHerb);

        const uniquePlots = Array.from(new Set(normWoody.map(d => d.Plot_ID))).map(pid => ({
          id: pid,
          name: pid,
          location: normWoody.find(d => d.Plot_ID === pid)?.Location_Name || 'Unknown',
          woodySpeciesCount: new Set(normWoody.filter(d => d.Plot_ID === pid).map(i => i.Species_Scientific)).size,
          herbSpeciesCount: new Set(normHerb.filter(d => d.Plot_ID === pid).map(i => i.Layer_Type)).size,
          dominantWoodySpecies: 'Mixed'
        }));
        setPlots(uniquePlots);

        if (selectedPlotId && uniquePlots.find(p => p.id === selectedPlotId)) {
          setSelectedPlotIdState(selectedPlotId);
        } else if (uniquePlots.length > 0 && !selectedPlotIdState) {
          setSelectedPlotIdState(uniquePlots[0].id);
        }
      } catch (error) {
        console.error("Failed to load plot data", error);
      }
    };
    initData();
  }, []);

  // --- 2. Derived State ---
  const filteredPlots = useMemo(() => plots.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  ), [plots, searchQuery]);

  const activePlot = useMemo(() => plots.find(p => p.id === selectedPlotIdState), [plots, selectedPlotIdState]);

  const speciesStats = useMemo(() => {
    if (!activePlot || woodyData.length === 0) return [];
    const plotTrees = woodyData.filter(d => d.Plot_ID === activePlot.id);
    const stats = new Map<string, { count: number }>();
    plotTrees.forEach(tree => {
      const current = stats.get(tree.Species_Scientific) || { count: 0 };
      stats.set(tree.Species_Scientific, { count: current.count + 1 });
    });
    return Array.from(stats.entries()).map(([name, data]) => ({ name, count: data.count })).sort((a, b) => b.count - a.count);
  }, [activePlot, woodyData]);

  // --- 3. Processing ---
  useEffect(() => {
    if (activePlot && woodyData.length > 0) {
      const processed = processPlotData(woodyData, herbData, activePlot.id);
      setProcessedData(processed);
      setHighlightedSpecies(null);
      setSelectedTreeIds([]);
    }
  }, [activePlot]);

  // --- 4. Interaction Handlers ---
  const handleTreeSelect = (id: string, multi: boolean) => {
    if (multi) {
      setSelectedTreeIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setSelectedTreeIds([id]);
    }
  };

  const handleTreeMove = (id: string, x: number, y: number) => {
    if (processedData) {
      // This is a visual-only update for the demo. In real app, update DB.
      const updatedTrees = processedData.trees.map(t => 
        t.id === id ? { ...t, x, y } : t
      );
      setProcessedData({ ...processedData, trees: updatedTrees });
    }
  };

  // --- Render ---
  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', bgcolor: 'background.default' }}>
      
      {/* Sidebar */}
      <Paper 
        elevation={0}
        sx={{ 
          width: isSidebarOpen ? 340 : 0, 
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
          overflow: 'hidden', 
          flexShrink: 0,
          borderRight: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <MapIcon color="primary" /> 
          <Typography variant="h6" fontWeight="bold">Plot Explorer</Typography>
        </Box>

        <Tabs value={sidebarTab} onChange={(_, v) => setSidebarTab(v)} variant="fullWidth">
          <Tab icon={<ListIcon fontSize="small" />} label="Plots" />
          <Tab icon={<CategoryIcon fontSize="small" />} label="Layers" />
        </Tabs>

        {sidebarTab === 0 && (
          <>
            <Box sx={{ p: 2 }}>
              <Paper variant="outlined" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
                <SearchIcon fontSize="small" sx={{ m: 1, color: 'text.secondary' }} />
                <InputBase 
                  sx={{ ml: 1, flex: 1 }} 
                  placeholder="Search plots..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Paper>
            </Box>
            <List dense sx={{ flex: 1, overflowY: 'auto' }}>
              {filteredPlots.map(plot => (
                <ListItemButton 
                  key={plot.id} 
                  selected={plot.id === selectedPlotIdState}
                  onClick={() => setSelectedPlotIdState(plot.id)}
                  sx={{ borderLeft: plot.id === selectedPlotIdState ? '4px solid' : '4px solid transparent', borderColor: 'primary.main' }}
                >
                  <ListItemAvatar>
                    <Avatar variant="rounded" sx={{ bgcolor: plot.id === selectedPlotIdState ? 'primary.main' : 'action.selected', color: plot.id === selectedPlotIdState ? 'white' : 'text.primary' }}>
                      {plot.id.replace(/[^0-9]/g, '')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={plot.id} secondary={plot.location} primaryTypographyProps={{ fontWeight: 'bold' }} />
                  {plot.id === selectedPlotIdState && <ChevronRight color="primary" />}
                </ListItemButton>
              ))}
            </List>
          </>
        )}

        {sidebarTab === 1 && (
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom>LAYERS</Typography>
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel control={<Switch size="small" checked={viewSettings.showWoody} onChange={() => setViewSettings(p => ({...p, showWoody: !p.showWoody}))} />} label="Canopy Trees" />
              <FormControlLabel control={<Switch size="small" checked={viewSettings.showHerb} onChange={() => setViewSettings(p => ({...p, showHerb: !p.showHerb}))} />} label="Herb Subplots" />
              <FormControlLabel control={<Switch size="small" checked={viewSettings.showGrid} onChange={() => setViewSettings(p => ({...p, showGrid: !p.showGrid}))} />} label="Grid Lines" />
              <FormControlLabel control={<Switch size="small" checked={viewSettings.showQuadrants} onChange={() => setViewSettings(p => ({...p, showQuadrants: !p.showQuadrants}))} />} label="Quadrants" />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary">SPECIES FILTER</Typography>
              {highlightedSpecies && (
                <Tooltip title="Clear Filter">
                  <IconButton size="small" onClick={() => setHighlightedSpecies(null)}>
                    <ClearFilterIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            
            {processedData ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {speciesStats.map((stat) => {
                  const color = processedData.woodyLegend.get(stat.name);
                  const isHighlighted = highlightedSpecies === stat.name;
                  return (
                    <Paper 
                      key={stat.name}
                      variant="outlined"
                      onClick={() => setHighlightedSpecies(isHighlighted ? null : stat.name)}
                      sx={{ 
                        p: 1, px: 1.5,
                        cursor: 'pointer',
                        borderColor: isHighlighted ? 'primary.main' : 'transparent',
                        bgcolor: isHighlighted ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{stat.name}</Typography>
                      </Box>
                      <Typography variant="caption" fontWeight="bold">{stat.count}</Typography>
                    </Paper>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary">Select a plot to view data.</Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        
        {/* Toolbar */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 1.5, px: 3,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => setSidebarOpen(!isSidebarOpen)} size="small">
              <MenuOpenIcon sx={{ transform: isSidebarOpen ? 'rotate(180deg)' : 'none' }} />
            </IconButton>
            <Divider orientation="vertical" flexItem />
            {activePlot && (
              <Box>
                <Typography variant="subtitle1" fontWeight="800" lineHeight={1.2}>{activePlot.id}</Typography>
                <Typography variant="caption" color="text.secondary">{activePlot.location} • 10x10m Survey</Typography>
              </Box>
            )}
          </Box>

          <ToggleButtonGroup
            value={interactionMode}
            exclusive
            onChange={(_, newMode) => newMode && setInteractionMode(newMode)}
            size="small"
            aria-label="interaction mode"
          >
            <ToggleButton value="view" aria-label="view mode">
              <Tooltip title="View Mode"><ViewIcon fontSize="small" /></Tooltip>
            </ToggleButton>
            <ToggleButton value="select" aria-label="select mode">
              <Tooltip title="Selection Mode"><SelectIcon fontSize="small" /></Tooltip>
            </ToggleButton>
            <ToggleButton value="edit" aria-label="edit mode">
              <Tooltip title="Edit Mode (Drag Trees)"><MoveIcon fontSize="small" /></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>

        {/* Canvas Container */}
        <Box sx={{ 
          flexGrow: 1, 
          p: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f0f2f5',
          overflow: 'hidden'
        }}>
          {processedData && (
            <Box 
              sx={{ 
                width: '100%', 
                maxWidth: '800px', 
                aspectRatio: '1/1', 
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                bgcolor: 'white',
                borderRadius: 2
              }}
            >
              <PlotVisualizer 
                trees={processedData.trees}
                subplots={processedData.subplots}
                settings={viewSettings}
                interactionMode={interactionMode}
                highlightedSpecies={highlightedSpecies}
                selectedTreeIds={selectedTreeIds}
                onTreeSelect={handleTreeSelect}
                onTreeMove={handleTreeMove}
              />
            </Box>
          )}
          {!processedData && (
            <Typography variant="body1" color="text.secondary">Select a plot from the sidebar to visualize data</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PlotMap;