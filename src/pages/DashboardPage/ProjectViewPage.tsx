import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Button,
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Alert,
  LinearProgress,
  TextField,
  InputAdornment,
  IconButton as MuiIconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  AvatarGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputBase,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  TextareaAutosize,
  CardActions,
  IconButton
} from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import SyncIcon from '@mui/icons-material/Sync';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import UploadIcon from '@mui/icons-material/Upload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ForestIcon from '@mui/icons-material/Forest';
import GridOnIcon from '@mui/icons-material/GridOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import { getProjectById, updateProject } from '../../services/dbService';
import { importFieldData, importCanopyImages, readCSVFile, parseCSVData } from '../../services/dataImportService';
import PlotMap from '../../components/PlotVisualizer/PlotMap';

// Define project types
interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'archived';
  tools: string[];
  dataSources: string[];
  progress?: number;
  totalDataPoints?: number;
  lastSynced?: string;
}

const ProjectViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0); // Default to Dashboard tab
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [fieldDataPath, setFieldDataPath] = useState('/vegetation-plotting/field-data/woody_vegetation.csv');
  const [canopyImagePath, setCanopyImagePath] = useState('/vegetation-plotting/capopy_images');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [plots, setPlots] = useState<PlotData[]>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);

  // Define PlotData interface (assuming it's similar to PlotManagementPage)
  interface PlotData {
    id: string;
    location: string;
    woodySpeciesCount: number;
    herbSpeciesCount: number;
    dominantWoodySpecies: string;
  }

  // Fetch project data
  useEffect(() => {
    console.log('loadProject: useEffect triggered.');
    const loadProject = async () => {
      console.log('loadProject: Starting to load project from DB...');
      try {
        setLoading(true); // Set loading to true
        if (id) {
          const projectData = await getProjectById(id);
          if (projectData) {
            setProject(projectData);
            console.log('loadProject: Project loaded successfully:', projectData);
          } else {
            setError('Project not found');
            console.log('loadProject: Project not found for ID:', id);
          }
        } else {
          console.log('loadProject: No ID found, skipping project load.');
          setError('No project ID provided');
        }
      } catch (err) {
        console.error('loadProject: Error loading project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false); // Set loading to false in finally block
        console.log('loadProject: Finished loading project. setLoading(false).');
      }
    };

    loadProject();
  }, [id]);

  // State for new features
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved'>('saved');
  const [projectNotes, setProjectNotes] = useState<string>(project?.description || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [teamMembers] = useState([
    { id: 'user1', name: 'John Doe', avatar: 'JD' },
    { id: 'user2', name: 'Jane Smith', avatar: 'JS' },
    { id: 'user3', name: 'Robert Brown', avatar: 'RB' }
  ]);
  const [recentActivity] = useState([
    { id: 'act1', user: 'John Doe', action: 'edited species data', time: '5 mins ago' },
    { id: 'act2', user: 'Jane Smith', action: 'uploaded herb data', time: '1 hour ago' },
    { id: 'act3', user: 'Robert Brown', action: 'ran canopy analysis', time: '2 hours ago' }
  ]);
  const [speciesData, setSpeciesData] = useState<{ name: string; count: number; gbhSum: number }[]>([]);
  const [dominantSpecies, setDominantSpecies] = useState<{ name: string; percentage: number } | null>(null);
  const [analysisPanelData, setAnalysisPanelData] = useState<any>(null);
  const [analysisPanelVisible, setAnalysisPanelVisible] = useState(true);

  // Calculate ecological metrics when plot data loads
  useEffect(() => {
    if (plots.length > 0) {
      // Calculate species data
      const allSpecies: { [key: string]: { count: number; gbhSum: number } } = {};
      plots.forEach(plot => {
        // Note: This is simplified since we don't have direct access to the raw data here
        // In a real implementation, we'd use the original CSV data
        allSpecies[plot.dominantWoodySpecies] = {
          count: allSpecies[plot.dominantWoodySpecies]?.count ? allSpecies[plot.dominantWoodySpecies].count + 1 : 1,
          gbhSum: allSpecies[plot.dominantWoodySpecies]?.gbhSum ? allSpecies[plot.dominantWoodySpecies].gbhSum + 10 : 10
        };
      });

      const speciesArray = Object.entries(allSpecies).map(([name, data]) => ({
        name,
        count: data.count,
        gbhSum: data.gbhSum
      }));

      setSpeciesData(speciesArray);

      // Find dominant species (highest GBH sum)
      if (speciesArray.length > 0) {
        const totalGbh = speciesArray.reduce((sum, species) => sum + species.gbhSum, 0);
        const dominant = speciesArray.reduce((prev, current) =>
          (prev.gbhSum > current.gbhSum) ? prev : current
        );
        const percentage = ((dominant.gbhSum / totalGbh) * 100).toFixed(1);
        setDominantSpecies({
          name: dominant.name,
          percentage: parseFloat(percentage)
        });
      }
    }
  }, [plots]);

  // Fetch plot data
  useEffect(() => {
    console.log('loadPlotData: useEffect triggered.');
    const loadPlotData = async () => {
      console.log('loadPlotData: Starting to load plot data from CSVs...');
      try {
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

          const speciesCounts = woodyPlots.reduce((acc, plot) => {
            acc[plot.Species_Scientific] = (acc[plot.Species_Scientific] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const dominantWoodySpecies = Object.keys(speciesCounts).reduce((a, b) =>
            speciesCounts[a] > speciesCounts[b] ? a : b, '');

          return {
            id: plotId,
            location: woodyPlots[0]?.Location_Name || '',
            woodySpeciesCount: woodySpecies.length,
            herbSpeciesCount: herbSpecies.length,
            dominantWoodySpecies,
          };
        });
        setPlots(plotData);
        console.log('loadPlotData: Plot data loaded successfully.');
      } catch (err) {
        console.error('loadPlotData: Error loading plot data:', err);
      }
    };
    loadPlotData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Auto-save project notes
  useEffect(() => {
    if (isEditingNotes) {
      const timer = setTimeout(() => {
        setSaveStatus('saving');
        // In a real implementation, this would save to the database
        setTimeout(() => {
          setSaveStatus('saved');
        }, 1000);
      }, 1000); // Save after 1 second of inactivity

      return () => clearTimeout(timer);
    }
  }, [projectNotes, isEditingNotes]);

  const handleSyncProject = async () => {
    if (!project) return;

    setSyncStatus('syncing');
    try {
      const updatedProjectData = {
        ...project,
        updatedAt: new Date().toISOString(),
        lastSynced: new Date().toISOString()
      };

      await updateProject(updatedProjectData);
      setProject(updatedProjectData);

      setTimeout(() => {
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 2000);
      }, 1500);
    } catch (err) {
      console.error('Error syncing project:', err);
      setError('Failed to sync project');
      setSyncStatus('idle');
    }
  };

  const handleSaveProject = async () => {
    if (!project) return;

    try {
      const updatedProjectData = {
        ...project,
        updatedAt: new Date().toISOString(),
        description: projectNotes // Save notes as part of project description
      };

      await updateProject(updatedProjectData);
      setProject(updatedProjectData);
      setIsEditingNotes(false);
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project');
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action: string) => {
    handleCloseMenu();
    switch (action) {
      case 'projectSettings':
        // Navigate to project settings
        break;
      case 'export':
        // Handle export
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this project?')) {
          // Handle delete
        }
        break;
      default:
        break;
    }
  };

  const handleImportFieldData = async () => {
    if (!id) return;
    
    setImportStatus('importing');
    setImportMessage('Importing field data...');
    
    try {
      const success = await importFieldData(id, fieldDataPath);
      
      if (success) {
        setImportStatus('success');
        setImportMessage('Field data imported successfully!');
        
        const updatedProject = await getProjectById(id);
        if (updatedProject) {
          setProject(updatedProject);
        }
        
        setTimeout(() => {
          setImportStatus('idle');
          setImportMessage('');
        }, 3000);
      } else {
        throw new Error('Failed to import field data');
      }
    } catch (err) {
      console.error('Error importing field data:', err);
      setImportStatus('error');
      setImportMessage(`Error: ${(err as Error).message}`);
    }
  };

  const handleImportCanopyImages = async () => {
    if (!id) return;
    
    setImportStatus('importing');
    setImportMessage('Importing canopy images...');
    
    try {
      const success = await importCanopyImages(id, canopyImagePath);
      
      if (success) {
        setImportStatus('success');
        setImportMessage('Canopy images imported successfully!');
        
        const updatedProject = await getProjectById(id);
        if (updatedProject) {
          setProject(updatedProject);
        }
        
        setTimeout(() => {
          setImportStatus('idle');
          setImportMessage('');
        }, 3000);
      } else {
        throw new Error('Failed to import canopy images');
      }
    } catch (err) {
      console.error('Error importing canopy images:', err);
      setImportStatus('error');
      setImportMessage(`Error: ${(err as Error).message}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box>
        <Breadcrumb />
        <Container maxWidth={activeTab === 1 ? false : "xl"} sx={{ mt: 4, pb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', width: activeTab === 1 ? '100%' : 'auto' }}>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Loading project...
            </Typography>
            <LinearProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Breadcrumb />
        <Container maxWidth={activeTab === 1 ? false : "xl"} sx={{ mt: 4, pb: 4, width: activeTab === 1 ? '100%' : 'auto' }}>
          <Alert severity="error">
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard/projects')}
            sx={{ mt: 2 }}
          >
            Back to Projects
          </Button>
        </Container>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box>
        <Breadcrumb />
        <Container maxWidth={activeTab === 1 ? false : "xl"} sx={{ mt: 4, pb: 4, width: activeTab === 1 ? '100%' : 'auto' }}>
          <Alert severity="error">
            Project not found
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard/projects')}
            sx={{ mt: 2 }}
          >
            Back to Projects
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          overflowY: 'auto'
        }}
      >
        <Container maxWidth={activeTab === 1 ? false : "xl"} sx={{ mt: 4, pb: 4, width: activeTab === 1 ? '100%' : 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {project.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  color={project.status === 'active' ? 'primary' : project.status === 'completed' ? 'success' : 'default'}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Last edit {recentActivity[0]?.time || 'recently'} by
                  </Typography>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                    {recentActivity[0]?.user?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {recentActivity[0]?.user || 'Unknown User'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {saveStatus === 'saving' ? 'Saving...' : 'All changes saved'}
              </Typography>
              <Box sx={{ width: 100, mr: 1 }}>
                <LinearProgress variant="determinate" value={project.progress || 0} sx={{ height: 8, borderRadius: 5 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">{project.progress || 0}%</Typography>
              <MuiIconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handleOpenMenu}
              >
                <MoreVertIcon />
              </MuiIconButton>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={() => handleMenuAction('projectSettings')}>
                  Project Settings
                </MenuItem>
                <MenuItem onClick={() => handleMenuAction('export')}>
                  Export
                </MenuItem>
                <MenuItem onClick={() => { handleMenuAction('sync'); handleSyncProject(); }}>
                  Sync Project
                </MenuItem>
                <MenuItem onClick={() => handleMenuAction('delete')}>
                  Delete Project
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.05) 100%)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => setActiveTab(2)} // Switch to Data Manager tab when clicking Species Identified
              >
                <ForestIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {speciesData.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Species Identified
                </Typography>
              </Paper>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.05) 100%)',
                  borderRadius: 2
                }}
              >
                <GridOnIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                  {plots.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Plots
                </Typography>
              </Paper>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255,193,7,0.1) 0%, rgba(255,193,7,0.05) 100%)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => alert(`Dominant species: ${dominantSpecies?.name || 'None'}`)} // Show dominant species info when clicked
              >
                <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {dominantSpecies?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({dominantSpecies?.percentage || 0}% of total GBH)
                </Typography>
              </Paper>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(156,39,176,0.1) 0%, rgba(156,39,176,0.05) 100%)',
                  borderRadius: 2
                }}
              >
                <GroupIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                  {teamMembers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Team Members
                </Typography>
                <AvatarGroup max={4} sx={{ mt: 1, justifyContent: 'center' }}>
                  {teamMembers.map((member, index) => (
                    <Avatar key={index} sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {member.avatar}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 'medium'
                }
              }}
            >
              <Tab label="Dashboard" />
              <Tab label="Plot Visualizer" />
              <Tab label="Analysis Tools" />
              <Tab label="Data Manager" />
            </Tabs>
          </Paper>

          <Box>
            {activeTab === 0 && ( // Dashboard tab
              <Grid container spacing={3}>
                <Grid xs={12} md={8}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Project Notes</Typography>
                      {!isEditingNotes ? (
                        <Button startIcon={<EditIcon />} size="small" onClick={() => setIsEditingNotes(true)}>
                          Edit
                        </Button>
                      ) : (
                        <Button variant="contained" size="small" onClick={() => {
                          handleSaveProject();
                          setIsEditingNotes(false);
                        }}>
                          Save
                        </Button>
                      )}
                    </Box>
                    {!isEditingNotes ? (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {projectNotes}
                      </Typography>
                    ) : (
                      <TextareaAutosize
                        minRows={5}
                        value={projectNotes}
                        onChange={(e) => setProjectNotes(e.target.value)}
                        style={{ width: '100%', padding: '10px', fontSize: '1rem', fontFamily: 'inherit' }}
                      />
                    )}
                  </Paper>

                  <Paper sx={{ p: 2, mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
                    <List>
                      {recentActivity.map((activity) => (
                        <ListItem key={activity.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <ListItemText
                            primary={`${activity.user} ${activity.action}`}
                            secondary={activity.time}
                          />
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', mr: 1 }}>
                            {activity.user.charAt(0)}
                          </Avatar>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                <Grid xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Team</Typography>
                    <List>
                      {teamMembers.map((member, index) => (
                        <ListItem key={index}>
                          <Avatar sx={{ mr: 2 }}>
                            {member.avatar}
                          </Avatar>
                          <ListItemText primary={member.name} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && ( // Plot Visualizer tab
              <Box sx={{ width: '100%', px: 2 }}>
                <PlotMap />
              </Box>
            )}

            {activeTab === 2 && ( // Analysis Tools tab
              <Grid container spacing={3}>
                <Grid xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Canopy Analysis
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Analyze canopy cover and vegetation structure.
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="small"
                        component={RouterLink}
                        to={`/dashboard/projects/${id}/canopy-analysis`}
                      >
                        Open Tool
                      </Button>
                    </Box>
                  </Card>
                </Grid>
                <Grid xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Species-Area Curve
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Generate species-area curves from plot data.
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => alert('Species-Area Curve tool would open here')}
                      >
                        Open Tool
                      </Button>
                    </Box>
                  </Card>
                </Grid>
                <Grid xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Biodiversity Indices
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Calculate Shannon, Simpson, and other biodiversity indices.
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => alert('Biodiversity Indices tool would open here')}
                      >
                        Open Tool
                      </Button>
                    </Box>
                  </Card>
                </Grid>
                <Grid xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Compare Plots
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Compare species composition between plots.
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => alert('Compare Plots tool would open here')}
                      >
                        Open Tool
                      </Button>
                    </Box>
                  </Card>
                </Grid>
                <Grid xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Export Report
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Generate a comprehensive project report.
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => alert('Export Report feature would open here')}
                      >
                        Export
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            )}

            {activeTab === 3 && ( // Data Manager tab
              <Grid container spacing={3}>
                <Grid xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 2 }}
                    onClick={() => alert('Upload new data functionality would be implemented here')}
                  >
                    Upload New Data
                  </Button>
                </Grid>
                <Grid xs={12}>
                  <Paper>
                    <List>
                      <ListItem>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box sx={{ mr: 2 }}>
                            <UploadIcon color="action" />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <ListItemText
                              primary="woody_vegetation.csv"
                              secondary="CSV file with 62 rows and 16 columns - Last modified: 2023-06-15"
                            />
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip size="small" label="Woody Vegetation" color="primary" />
                              <Chip size="small" label="CSV" color="default" />
                            </Box>
                          </Box>
                        </Box>
                        <Box>
                          <Button size="small" startIcon={<FileDownloadIcon />}>Download</Button>
                          <Button size="small" startIcon={<EditIcon />} sx={{ ml: 1 }}>Preview</Button>
                          <MuiIconButton size="small" sx={{ ml: 1 }}>
                            <MoreVertIcon />
                            <Menu
                              anchorEl={null}
                              open={false}
                              onClose={() => {}}
                            >
                              <MenuItem>Replace File</MenuItem>
                              <MenuItem>Delete</MenuItem>
                              <MenuItem>View Details</MenuItem>
                            </Menu>
                          </MuiIconButton>
                        </Box>
                      </ListItem>
                      <ListItem>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box sx={{ mr: 2 }}>
                            <UploadIcon color="action" />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <ListItemText
                              primary="herb_floor_vegetation.csv"
                              secondary="CSV file with 45 rows and 8 columns - Last modified: 2023-06-10"
                            />
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip size="small" label="Herb/Floor Vegetation" color="primary" />
                              <Chip size="small" label="CSV" color="default" />
                            </Box>
                          </Box>
                        </Box>
                        <Box>
                          <Button size="small" startIcon={<FileDownloadIcon />}>Download</Button>
                          <Button size="small" startIcon={<EditIcon />} sx={{ ml: 1 }}>Preview</Button>
                          <MuiIconButton size="small" sx={{ ml: 1 }}>
                            <MoreVertIcon />
                            <Menu
                              anchorEl={null}
                              open={false}
                              onClose={() => {}}
                            >
                              <MenuItem>Replace File</MenuItem>
                              <MenuItem>Delete</MenuItem>
                              <MenuItem>View Details</MenuItem>
                            </Menu>
                          </MuiIconButton>
                        </Box>
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

// Set default active tab to Dashboard (index 0)
ProjectViewPage.defaultProps = {
  defaultActiveTab: 0
};

export default ProjectViewPage;
