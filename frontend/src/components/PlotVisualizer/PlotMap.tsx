import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Chip,
  Drawer,
  alpha,
  InputBase,
  Divider,
  Tooltip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab
} from '@mui/material';
import {
  Forest as ForestIcon,
  Grass as GrassIcon,
  MenuOpen as MenuOpenIcon,
  Search as SearchIcon,
  Map as MapIcon,
  LocationOn as LocationOnIcon,
  ChevronRight,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FilterCenterFocus as CenterFocusIcon,
  List as ListIcon,
  Category as CategoryIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Internal Components
import PlotVisualizer from './PlotVisualizer';
import { processPlotData } from './PlotVisualizerService';
import { WoodyData, HerbData, PlotData } from './types';
import { readCSVFile, parseCSVData } from '../../services/dataImportService';

// --- Types ---
interface PlotMapProps {
  selectedPlotId?: string | null;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface VisualizerSettings {
  showGrid: boolean;
  showQuadrants: boolean;
  showLabels: boolean;
  showWoody: boolean;
  showHerb: boolean;
}

// --- Constants ---
const BASE_PLOT_SIZE = 600;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

// --- Helper Components ---
const InfiniteGrid = ({ transform, theme }: { transform: Transform, theme: any }) => {
  const gridSize = 50 * transform.scale;
  const offsetX = transform.x % gridSize;
  const offsetY = transform.y % gridSize;

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: theme.palette.mode === 'dark' ? 0.2 : 0.4,
        backgroundImage: `
          linear-gradient(to right, ${theme.palette.divider} 1px, transparent 1px),
          linear-gradient(to bottom, ${theme.palette.divider} 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
      }}
    />
  );
};

const PlotMap: React.FC<PlotMapProps> = ({ selectedPlotId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Data State ---
  const [woodyData, setWoodyData] = useState<WoodyData[]>([]);
  const [herbData, setHerbData] = useState<HerbData[]>([]);
  const [plots, setPlots] = useState<PlotData[]>([]);
  const [selectedPlotIdState, setSelectedPlotIdState] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<any>(null);

  // --- UI State ---
  const [sidebarTab, setSidebarTab] = useState(0); 
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedSpecies, setHighlightedSpecies] = useState<string | null>(null); // Renamed for clarity

  // --- Viewport State ---
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);

  const [viewSettings, setViewSettings] = useState<VisualizerSettings>({
    showGrid: true,
    showQuadrants: true,
    showLabels: true,
    showWoody: true,
    showHerb: true
  });

  // --- 1. Data Loading (Once on Mount) ---
  useEffect(() => {
    const initData = async () => {
      try {
        const woodyCsv = await readCSVFile('/vegetation-plotting/field-data/woody_vegetation.csv');
        const herbCsv = await readCSVFile('/vegetation-plotting/field-data/herb_floor_vegetation.csv');
        const woodyRaw = parseCSVData(woodyCsv) as any[];
        const herbRaw = parseCSVData(herbCsv) as any[];

        // Transform Data
        const normWoody: WoodyData[] = woodyRaw.map(r => ({
          Plot_ID: r.Plot_ID,
          Location_Name: r.Location_Name,
          Quad_ID: r.Quad_ID,
          Species_Scientific: r.Species_Scientific,
          Growth_Form: r.Growth_Form,
          Tree_ID: r.Tree_ID,
          Total_GBH_cm: parseFloat(r.Total_GBH_cm) || 0
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

        const uniquePlots = Array.from(new Set(normWoody.map(d => d.Plot_ID))).map(pid => {
          const w = normWoody.filter(d => d.Plot_ID === pid);
          const h = normHerb.filter(d => d.Plot_ID === pid);
          return {
            id: pid,
            name: pid,
            location: w[0]?.Location_Name || 'Unknown',
            woodySpeciesCount: new Set(w.map(i => i.Species_Scientific)).size,
            herbSpeciesCount: new Set(h.map(i => i.Layer_Type)).size,
            dominantWoodySpecies: 'Mixed'
          };
        });
        setPlots(uniquePlots);

        // Initial Selection
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
  }, []); // Empty dependency array = Run once on mount

  // --- 2. Derived State & Stats ---
  const filteredPlots = useMemo(() => plots.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  ), [plots, searchQuery]);

  const activePlot = useMemo(() => plots.find(p => p.id === selectedPlotIdState), [plots, selectedPlotIdState]);

  // Statistics for Legend
  const speciesStats = useMemo(() => {
    if (!activePlot || woodyData.length === 0) return [];
    const plotTrees = woodyData.filter(d => d.Plot_ID === activePlot.id);
    
    const stats = new Map<string, { count: number, totalGbh: number }>();
    plotTrees.forEach(tree => {
      const current = stats.get(tree.Species_Scientific) || { count: 0, totalGbh: 0 };
      stats.set(tree.Species_Scientific, {
        count: current.count + 1,
        totalGbh: current.totalGbh + tree.Total_GBH_cm
      });
    });

    return Array.from(stats.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      avgGbh: Math.round(data.totalGbh / data.count)
    })).sort((a, b) => b.count - a.count);
  }, [activePlot, woodyData]);

  // --- 3. Reset View & Process Data ---
  useEffect(() => {
    if (activePlot && woodyData.length > 0) {
      const processed = processPlotData(woodyData, herbData, activePlot.id);
      setProcessedData(processed);
      setHighlightedSpecies(null); // Reset highlight on plot change
      
      // Delay reset slightly to ensure DOM is ready
      setTimeout(() => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          const scaleX = (width * 0.8) / BASE_PLOT_SIZE;
          const scaleY = (height * 0.8) / BASE_PLOT_SIZE;
          const newScale = Math.min(scaleX, scaleY);
          const newX = (width - BASE_PLOT_SIZE * newScale) / 2;
          const newY = (height - BASE_PLOT_SIZE * newScale) / 2;
          setTransform({ x: newX, y: newY, scale: newScale });
        }
      }, 50);
    }
  }, [activePlot]); // Only run when active plot changes

  // --- 4. Scroll & Zoom Handlers ---
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomIntensity = 0.001;
      const delta = -e.deltaY * zoomIntensity;
      
      setTransform(prev => {
        const newScale = Math.min(Math.max(prev.scale + delta * prev.scale, MIN_ZOOM), MAX_ZOOM);
        const rect = node.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const scaleRatio = newScale / prev.scale;
        const newX = mouseX - (mouseX - prev.x) * scaleRatio;
        const newY = mouseY - (mouseY - prev.y) * scaleRatio;
        return { x: newX, y: newY, scale: newScale };
      });
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
  }, []);

  // Mouse Handlers for Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !lastMousePos.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    lastMousePos.current = null;
  };

  const handleFitScreen = () => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const scale = Math.min((width * 0.8) / BASE_PLOT_SIZE, (height * 0.8) / BASE_PLOT_SIZE);
    const x = (width - BASE_PLOT_SIZE * scale) / 2;
    const y = (height - BASE_PLOT_SIZE * scale) / 2;
    setTransform({ x, y, scale });
  };

  // --- Render Sub-Components ---

  const SidebarContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MapIcon color="primary" /> Plot Explorer
        </Typography>
      </Box>

      <Tabs 
        value={sidebarTab} 
        onChange={(_, v) => setSidebarTab(v)} 
        variant="fullWidth"
        sx={{ borderBottom: '1px solid', borderColor: 'divider', minHeight: 48 }}
      >
        <Tab icon={<ListIcon fontSize="small" />} label="Plots" />
        <Tab icon={<CategoryIcon fontSize="small" />} label="Legend" />
      </Tabs>

      {sidebarTab === 0 && (
        <>
          <Box sx={{ p: 2 }}>
            <Paper elevation={0} sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider' }}>
              <SearchIcon fontSize="small" sx={{ m: 1, color: 'text.secondary' }} />
              <InputBase 
                sx={{ ml: 1, flex: 1 }} 
                placeholder="Find plot..." 
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
                sx={{ 
                  borderLeft: plot.id === selectedPlotIdState ? '4px solid' : '4px solid transparent',
                  borderColor: 'primary.main',
                  bgcolor: plot.id === selectedPlotIdState ? alpha(theme.palette.primary.main, 0.08) : 'transparent'
                }}
              >
                <ListItemAvatar>
                  <Avatar variant="rounded" sx={{ bgcolor: plot.id === selectedPlotIdState ? 'primary.main' : 'action.hover' }}>
                    {plot.id.replace(/[^0-9]/g, '')}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={<Typography fontWeight="bold">{plot.id}</Typography>}
                  secondary={plot.location}
                />
                {plot.id === selectedPlotIdState && <ChevronRight color="primary" />}
              </ListItemButton>
            ))}
          </List>
        </>
      )}

      {sidebarTab === 1 && (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>LAYERS</Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <FormControlLabel control={<Switch size="small" checked={viewSettings.showWoody} onChange={() => setViewSettings(p => ({...p, showWoody: !p.showWoody}))} />} label="Woody Trees" />
            <FormControlLabel control={<Switch size="small" checked={viewSettings.showHerb} onChange={() => setViewSettings(p => ({...p, showHerb: !p.showHerb}))} />} label="Herb Subplots" />
            <Divider sx={{ my: 1 }} />
            <FormControlLabel control={<Switch size="small" checked={viewSettings.showGrid} onChange={() => setViewSettings(p => ({...p, showGrid: !p.showGrid}))} />} label="Grid (1m)" />
            <FormControlLabel control={<Switch size="small" checked={viewSettings.showQuadrants} onChange={() => setViewSettings(p => ({...p, showQuadrants: !p.showQuadrants}))} />} label="Quadrants" />
          </Paper>

          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>SPECIES DATA</Typography>
          {processedData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {speciesStats.map((stat) => {
                const color = processedData.woodyLegend.get(stat.name);
                const isHighlighted = highlightedSpecies === stat.name;
                
                return (
                  <Paper 
                    key={stat.name}
                    variant="outlined"
                    onClick={() => setHighlightedSpecies(isHighlighted ? null : stat.name)}
                    sx={{ 
                      p: 1.5, 
                      cursor: 'pointer',
                      borderColor: isHighlighted ? 'primary.main' : 'divider',
                      bgcolor: isHighlighted ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color }} />
                      <Typography variant="body2" fontWeight="bold">{stat.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, pl: 3 }}>
                      <Typography variant="caption" color="text.secondary">Count: <b>{stat.count}</b></Typography>
                      <Typography variant="caption" color="text.secondary">Avg GBH: <b>{stat.avgGbh}cm</b></Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          ) : (
            <Typography variant="caption">Select a plot to view data.</Typography>
          )}
        </Box>
      )}
    </Box>
  );

  // --- Main Render ---
  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', bgcolor: 'background.default' }}>
      
      {/* Sidebar */}
      <Box sx={{ 
        width: isSidebarOpen ? 320 : 0, 
        transition: 'width 0.3s ease', 
        overflow: 'hidden', 
        flexShrink: 0 
      }}>
        <SidebarContent />
      </Box>

      {/* Main Layout: Column direction to stack Header above Canvas */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        
        {/* 1. FIXED HEADER (No longer absolute, prevents obstruction) */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 2,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            zIndex: 20
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => setSidebarOpen(!isSidebarOpen)} size="small">
              <MenuOpenIcon sx={{ transform: isSidebarOpen ? 'rotate(180deg)' : 'none' }} />
            </IconButton>
            <Divider orientation="vertical" flexItem />
            {activePlot ? (
              <Box>
                <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
                  {activePlot.id}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activePlot.location} • 10x10m Plot
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2">Select a plot</Typography>
            )}
          </Box>

          {activePlot && (
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
               <Chip icon={<ForestIcon sx={{ fontSize: 14 }} />} label={`${activePlot.woodySpeciesCount} Woody`} size="small" variant="outlined" />
               <Chip icon={<GrassIcon sx={{ fontSize: 14 }} />} label={`${activePlot.herbSpeciesCount} Herb`} size="small" variant="outlined" />
            </Box>
          )}
        </Paper>

        {/* 2. CANVAS AREA (Fills remaining space) */}
        <Box 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          sx={{ 
            flexGrow: 1, 
            position: 'relative', 
            bgcolor: theme.palette.mode === 'dark' ? '#111' : '#f0f2f5', 
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
        >
          <InfiniteGrid transform={transform} theme={theme} />

          {processedData && (
            <Box sx={{ 
              position: 'absolute',
              left: transform.x,
              top: transform.y,
              width: BASE_PLOT_SIZE,
              height: BASE_PLOT_SIZE,
              transform: `scale(${transform.scale})`,
              transformOrigin: '0 0',
              willChange: 'transform',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              bgcolor: 'white'
            }}>
              <PlotVisualizer 
                subplots={processedData.subplots}
                woodyGlyphs={processedData.woodyGlyphs}
                settings={viewSettings}
                highlightedSpecies={highlightedSpecies}
              />
            </Box>
          )}

          {/* Bottom Controls (Absolute within Canvas area) */}
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              borderRadius: 8,
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(8px)',
              border: '1px solid',
              borderColor: 'divider',
              p: 0.5,
              display: 'flex',
              gap: 0.5
            }}
          >
            <Tooltip title="Zoom Out"><IconButton onClick={() => setTransform(t => ({ ...t, scale: Math.max(t.scale / 1.2, MIN_ZOOM) }))}><ZoomOutIcon /></IconButton></Tooltip>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 1, borderLeft: '1px solid #eee', borderRight: '1px solid #eee' }}>
              <Typography variant="caption" fontWeight="bold">{Math.round(transform.scale * 100)}%</Typography>
            </Box>
            <Tooltip title="Zoom In"><IconButton onClick={() => setTransform(t => ({ ...t, scale: Math.min(t.scale * 1.2, MAX_ZOOM) }))}><ZoomInIcon /></IconButton></Tooltip>
            <Tooltip title="Fit to Screen"><IconButton onClick={handleFitScreen} color="primary"><CenterFocusIcon /></IconButton></Tooltip>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default PlotMap;