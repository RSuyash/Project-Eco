// src/pages/DashboardPage/PlotManagementPage.tsx

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  TextField,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TableSortLabel,
  Toolbar,
  AppBar,
  Toolbar as MuiToolbar,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Avatar,
  AvatarGroup,
  useTheme,
  useMediaQuery,
  PopoverOrigin
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import GridViewIcon from '@mui/icons-material/GridView';
import TableViewIcon from '@mui/icons-material/TableView';
import MapIcon from '@mui/icons-material/Map';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GrassIcon from '@mui/icons-material/Grass';
import ForestIcon from '@mui/icons-material/Forest';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import { readCSVFile, parseCSVData } from '../../services/dataImportService';

interface PlotData {
  id: string;
  location: string;
  woodySpeciesCount: number;
  herbSpeciesCount: number;
  dominantWoodySpecies: string;
  habitat?: string;
  shannonIndex?: number;
  canopyCover?: number;
  totalSpecies?: number;
}

const PlotManagementPage = () => {
  const [plots, setPlots] = useState<PlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null);
  const [editedLocation, setEditedLocation] = useState('');

  // New state for enhanced functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('location');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedHabitats, setSelectedHabitats] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [selectedPlots, setSelectedPlots] = useState<string[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const loadPlotData = async () => {
      try {
        setLoading(true);
        const woodyCsvText = await readCSVFile('/vegetation-plotting/field-data/woody_vegetation.csv');
        const herbFloorCsvText = await readCSVFile('/vegetation-plotting/field-data/herb_floor_vegetation.csv');

        const woodyData = parseCSVData(woodyCsvText);
        const herbFloorData = parseCSVData(herbFloorCsvText);

        const plotIds = [...new Set(woodyData.map(row => row.Plot_ID))];

        const plotData: PlotData[] = plotIds.map(plotId => {
          const woodyPlots = woodyData.filter(row => row.Plot_ID === plotId);
          const herbPlots = herbFloorData.filter(row => row.Plot_ID === plotId);

          const woodySpecies = [...new Set(woodyPlots.map(p => p.Species_Scientific))];
          const herbSpecies = [...new Set(herbPlots.map(p => p.Species_or_Category))];

          // Find dominant species
          const speciesCounts = woodyPlots.reduce((acc, plot) => {
            acc[plot.Species_Scientific] = (acc[plot.Species_Scientific] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const dominantWoodySpecies = Object.keys(speciesCounts).reduce((a, b) => speciesCounts[a] > speciesCounts[b] ? a : b, '');

          // Calculate additional metrics
          const allSpecies = [...woodySpecies, ...herbSpecies];
          const totalSpecies = allSpecies.length;

          // Calculate a simplified Shannon Index
          const allCounts = [...Object.values(speciesCounts)];
          const totalIndividuals = allCounts.reduce((sum, count) => sum + count, 0);
          let shannonIndex = 0;
          if (totalIndividuals > 0) {
            allCounts.forEach(count => {
              if (count > 0) {
                const proportion = count / totalIndividuals;
                shannonIndex -= proportion * Math.log2(proportion);
              }
            });
          }

          // Determine habitat based on location name
          let habitat = 'Mixed';
          if (woodyPlots[0]?.Location_Name.toLowerCase().includes('forest')) {
            habitat = 'Forest';
          } else if (woodyPlots[0]?.Location_Name.toLowerCase().includes('urban')) {
            habitat = 'Urban Garden';
          } else if (woodyPlots[0]?.Location_Name.toLowerCase().includes('wetland')) {
            habitat = 'Wetland';
          } else if (woodyPlots[0]?.Location_Name.toLowerCase().includes('park')) {
            habitat = 'Park';
          }

          return {
            id: plotId,
            location: woodyPlots[0]?.Location_Name || '',
            woodySpeciesCount: woodySpecies.length,
            herbSpeciesCount: herbSpecies.length,
            dominantWoodySpecies,
            habitat,
            shannonIndex: parseFloat(shannonIndex.toFixed(2)),
            canopyCover: Math.floor(Math.random() * 60) + 20, // Placeholder for canopy cover
            totalSpecies
          };
        });

        setPlots(plotData);
      } catch (err) {
        console.error('Error loading plot data:', err);
        setError('Failed to load plot data');
      } finally {
        setLoading(false);
      }
    };

    loadPlotData();
  }, []);

  // Filter and sort plots based on search, filters, and sorting
  const filteredAndSortedPlots = plots
    .filter(plot => {
      // Search filter
      const matchesSearch =
        plot.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plot.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plot.dominantWoodySpecies.toLowerCase().includes(searchQuery.toLowerCase());

      // Habitat filter
      const matchesHabitat = selectedHabitats.length === 0 ||
        selectedHabitats.includes(plot.habitat || 'Mixed');

      return matchesSearch && matchesHabitat;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortField) {
        case 'woodySpeciesCount':
          aValue = a.woodySpeciesCount;
          bValue = b.woodySpeciesCount;
          break;
        case 'herbSpeciesCount':
          aValue = a.herbSpeciesCount;
          bValue = b.herbSpeciesCount;
          break;
        case 'shannonIndex':
          aValue = a.shannonIndex || 0;
          bValue = b.shannonIndex || 0;
          break;
        case 'totalSpecies':
          aValue = a.totalSpecies || 0;
          bValue = b.totalSpecies || 0;
          break;
        case 'location':
        default:
          aValue = a.location;
          bValue = b.location;
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Get unique habitats for the filter dropdown
  const allHabitats = [...new Set(plots.map(plot => plot.habitat || 'Mixed'))];

  const handleEdit = (plot: PlotData) => {
    setEditingPlotId(plot.id);
    setEditedLocation(plot.location);
  };

  const handleSave = (plotId: string) => {
    setPlots(plots.map(p => p.id === plotId ? { ...p, location: editedLocation } : p));
    setEditingPlotId(null);
    setSnackbarMessage(`Plot ${plotId} location updated.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingPlotId(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortField(event.target.value);
  };

  const handleHabitatChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedHabitats(value);
  };

  const handleViewModeChange = (mode: 'grid' | 'list' | 'map') => {
    setViewMode(mode);
  };

  const handleSelectPlot = (plotId: string) => {
    if (selectedPlots.includes(plotId)) {
      setSelectedPlots(selectedPlots.filter(id => id !== plotId));
    } else {
      setSelectedPlots([...selectedPlots, plotId]);
    }
  };

  const handleSelectAllPlots = () => {
    if (selectedPlots.length === filteredAndSortedPlots.length) {
      setSelectedPlots([]);
    } else {
      setSelectedPlots(filteredAndSortedPlots.map(plot => plot.id));
    }
  };

  const handleBatchAction = (action: string) => {
    if (action === 'delete') {
      setPlots(plots.filter(plot => !selectedPlots.includes(plot.id)));
      setSelectedPlots([]);
      setSnackbarMessage(`Deleted ${selectedPlots.length} plots.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } else if (action === 'export') {
      // Export logic would go here
      setSnackbarMessage('Exported selected plots.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Breadcrumb />
      <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Plot Management
        </Typography>

        {/* Control Panel Header */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center'
          }}
        >
          {/* Search Bar */}
          <TextField
            fullWidth={isMobile}
            size="small"
            placeholder="Search by plot ID, location, or dominant species..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: isMobile ? '100%' : 300 }}
          />

          {/* Sort Dropdown */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortField}
              label="Sort by"
              onChange={handleSortChange}
            >
              <MenuItem value="location">Location (A-Z)</MenuItem>
              <MenuItem value="woodySpeciesCount">Woody Species (High-Low)</MenuItem>
              <MenuItem value="herbSpeciesCount">Herb Species (High-Low)</MenuItem>
              <MenuItem value="shannonIndex">Shannon Index (High-Low)</MenuItem>
              <MenuItem value="totalSpecies">Total Species (High-Low)</MenuItem>
            </Select>
          </FormControl>

          {/* Habitat Filter */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Habitat</InputLabel>
            <Select
              multiple
              value={selectedHabitats}
              onChange={handleHabitatChange}
              label="Habitat"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {allHabitats.map((habitat) => (
                <MenuItem key={habitat} value={habitat}>
                  <Checkbox checked={selectedHabitats.indexOf(habitat) > -1} />
                  <ListItemText primary={habitat} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* View Toggle */}
          <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', ml: 'auto' }}>
            <IconButton
              size="small"
              onClick={() => handleViewModeChange('grid')}
              title="Grid View"
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              <GridViewIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleViewModeChange('list')}
              title="List View"
              color={viewMode === 'list' ? 'primary' : 'default'}
            >
              <TableViewIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleViewModeChange('map')}
              title="Map View"
              color={viewMode === 'map' ? 'primary' : 'default'}
            >
              <MapIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* Global Actions Bar */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            backgroundColor: showBatchActions ? alpha(theme.palette.warning.main, 0.1) : 'inherit'
          }}
        >
          <Button
            variant="contained"
            startIcon={<EmojiNatureIcon />}
          >
            Add New Plot
          </Button>

          {viewMode === 'list' && selectedPlots.length > 0 ? (
            <>
              <Typography variant="body2" color="text.secondary">
                {selectedPlots.length} plot(s) selected
              </Typography>
              <Button
                variant="outlined"
                onClick={() => handleBatchAction('export')}
              >
                Export Selected
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleBatchAction('delete')}
              >
                Delete Selected
              </Button>
              <Button
                onClick={() => {
                  setSelectedPlots([]);
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              {viewMode === 'list' ? (
                <Typography variant="body2" color="text.secondary">
                  Select plots to perform batch actions
                </Typography>
              ) : (
                <Button
                  variant="outlined"
                >
                  Batch Actions...
                </Button>
              )}
              <Button
                variant="outlined"
              >
                Export All
              </Button>
            </>
          )}
        </Paper>

        {/* Plot List based on view mode */}
        {viewMode === 'grid' && (
          <Grid container spacing={3}>
            {filteredAndSortedPlots.map(plot => (
              <Grid item xs={12} md={6} lg={4} key={plot.id}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': { boxShadow: 6 },
                    height: '100%',
                    cursor: 'pointer',
                    border: editingPlotId === plot.id ? '2px solid' : '1px solid',
                    borderColor: editingPlotId === plot.id ? 'primary.main' : 'divider'
                  }}
                  onClick={() => navigate(`/dashboard/plots/${plot.id}`)}
                >
                  {/* Visual-First Header */}
                  <Box sx={{
                    height: 140,
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {/* Mini plot visualization placeholder */}
                    <Box sx={{
                      width: '80%',
                      height: '80%',
                      display: 'flex',
                      flexDirection: 'row',
                      border: '1px solid',
                      borderColor: 'grey.400',
                      backgroundColor: 'background.paper',
                      borderRadius: 1
                    }}>
                      <Box sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid',
                        borderColor: 'grey.400',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1)
                      }}>
                        <Typography variant="caption" color="text.secondary">
                          Woody: {plot.woodySpeciesCount}
                        </Typography>
                      </Box>
                      <Box sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1)
                      }}>
                        <Typography variant="caption" color="text.secondary">
                          Herb: {plot.herbSpeciesCount}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Habitat indicator */}
                    {plot.habitat && (
                      <Chip
                        label={plot.habitat}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: 'background.paper'
                        }}
                      />
                    )}
                  </Box>

                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        {editingPlotId === plot.id ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={editedLocation}
                            onChange={(e) => setEditedLocation(e.target.value)}
                            sx={{ mb: 1 }}
                          />
                        ) : (
                          <>
                            <Typography variant="h6" component="div" sx={{ mb: 0.5 }}>
                              {plot.location}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Plot ID: {plot.id}
                            </Typography>
                          </>
                        )}
                      </Box>

                      {/* Action icons when editing */}
                      {editingPlotId === plot.id ? (
                        <Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(plot.id);
                            }}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(plot);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>

                    {/* Species count visualization */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        {plot.totalSpecies} Total Species
                      </Typography>
                      <Box sx={{ display: 'flex', height: 8, borderRadius: 1, backgroundColor: 'grey.200' }}>
                        <Box
                          sx={{
                            width: `${(plot.woodySpeciesCount / (plot.woodySpeciesCount + plot.herbSpeciesCount)) * 100}%`,
                            backgroundColor: 'primary.main',
                            borderRadius: 1
                          }}
                          title={`Woody: ${plot.woodySpeciesCount}`}
                        />
                        <Box
                          sx={{
                            width: `${(plot.herbSpeciesCount / (plot.woodySpeciesCount + plot.herbSpeciesCount)) * 100}%`,
                            backgroundColor: 'secondary.main',
                            borderRadius: 1
                          }}
                          title={`Herb: ${plot.herbSpeciesCount}`}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Dominant: {plot.dominantWoodySpecies}
                      </Typography>
                    </Box>

                    {/* Additional metrics */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Shannon Index</Typography>
                        <Typography variant="body2">{plot.shannonIndex?.toFixed(2) || 'N/A'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Canopy Cover</Typography>
                        <Typography variant="body2">{plot.canopyCover}%</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* List View - Will be implemented next */}
        {viewMode === 'list' && (
          <Paper sx={{ width: '100%', mb: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedPlots.length > 0 && selectedPlots.length < filteredAndSortedPlots.length}
                        checked={selectedPlots.length === filteredAndSortedPlots.length}
                        onChange={handleSelectAllPlots}
                      />
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortField === 'location'}
                        direction={sortField === 'location' ? sortDirection : 'asc'}
                        onClick={() => {
                          setSortField('location');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Plot ID
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortField === 'woodySpeciesCount'}
                        direction={sortField === 'woodySpeciesCount' ? sortDirection : 'asc'}
                        onClick={() => {
                          setSortField('woodySpeciesCount');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Woody Species
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortField === 'herbSpeciesCount'}
                        direction={sortField === 'herbSpeciesCount' ? sortDirection : 'asc'}
                        onClick={() => {
                          setSortField('herbSpeciesCount');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Herb/Floor
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Dominant Species</TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortField === 'shannonIndex'}
                        direction={sortField === 'shannonIndex' ? sortDirection : 'asc'}
                        onClick={() => {
                          setSortField('shannonIndex');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Shannon Index
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedPlots.map((plot) => (
                    <TableRow
                      key={plot.id}
                      hover
                      onClick={() => navigate(`/dashboard/plots/${plot.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedPlots.includes(plot.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPlot(plot.id);
                          }}
                        />
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {plot.id}
                      </TableCell>
                      <TableCell>{plot.location}</TableCell>
                      <TableCell align="right">{plot.woodySpeciesCount}</TableCell>
                      <TableCell align="right">{plot.herbSpeciesCount}</TableCell>
                      <TableCell align="right">{plot.dominantWoodySpecies}</TableCell>
                      <TableCell align="right">{plot.shannonIndex?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(plot);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/plots/${plot.id}`);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Map View - Placeholder for now */}
        {viewMode === 'map' && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Map View
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Visualize all plots on a map (Map View would be implemented here)
            </Typography>
            <Box sx={{ mt: 4, height: 400, backgroundColor: 'background.paper', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Interactive map showing plot locations would appear here
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default PlotManagementPage;
