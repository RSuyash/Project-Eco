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
  IconButton,
  Divider,
  Alert,
  AlertTitle,
  AppBar,
  Toolbar,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton as MuiIconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SyncIcon from '@mui/icons-material/Sync';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import { Link as RouterLink } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import { getProjectById, updateProject } from '../../services/dbService';
import { importFieldData, importCanopyImages, readCSVFile, parseCSVData, processFieldData } from '../../services/dataImportService';

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

interface Tool {
  id: string;
  name: string;
  category: string;
  lastUsed: string;
  usageCount: number;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  lastUpdated: string;
  size: string;
  status: 'connected' | 'disconnected' | 'syncing';
}

const ProjectViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [fieldDataPath, setFieldDataPath] = useState('/vegetation-plotting/field-data/woody_vegetation.csv');
  const [canopyImagePath, setCanopyImagePath] = useState('/vegetation-plotting/capopy_images');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  // Load project data from IndexedDB
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const dbProject = await getProjectById(id!);
        if (dbProject) {
          setProject(dbProject);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProject();
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSyncProject = async () => {
    if (!project) return;
    
    setSyncStatus('syncing');
    try {
      // Update the last synced time
      const updatedProject = {
        ...project,
        updatedAt: new Date().toISOString(),
        lastSynced: new Date().toISOString()
      };
      
      // Save updated project to IndexedDB
      await updateProject(updatedProject);
      setProject(updatedProject);
      
      // Simulate sync process
      setTimeout(() => {
        setSyncStatus('synced');
        // Reset after 2 seconds
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
      // Update the last updated time
      const updatedProject = {
        ...project,
        updatedAt: new Date().toISOString()
      };
      
      // Save updated project to IndexedDB
      await updateProject(updatedProject);
      setProject(updatedProject);
      
      // Show success message
      alert('Project saved successfully!');
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project');
    }
  };

  const handleImportFieldData = async () => {
    if (!id) return;
    
    setImportStatus('importing');
    setImportMessage('Importing field data...');
    
    try {
      // In a real implementation, we would use the actual path
      // For now, we'll use a fixed path and simulate the import
      const success = await importFieldData(id, fieldDataPath);
      
      if (success) {
        setImportStatus('success');
        setImportMessage('Field data imported successfully!');
        
        // Reload the project to reflect the changes
        const updatedProject = await getProjectById(id);
        if (updatedProject) {
          setProject(updatedProject);
        }
        
        // Reset after 3 seconds
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
      // In a real implementation, we would use the actual path
      // For now, we'll use a fixed path and simulate the import
      const success = await importCanopyImages(id, canopyImagePath);
      
      if (success) {
        setImportStatus('success');
        setImportMessage('Canopy images imported successfully!');
        
        // Reload the project to reflect the changes
        const updatedProject = await getProjectById(id);
        if (updatedProject) {
          setProject(updatedProject);
        }
        
        // Reset after 3 seconds
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
        <Container maxWidth="xl" sx={{ mt: 4, pb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
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
        <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
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
        <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
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

  // Side panel navigation
  const sidePanelItems = [
    { text: 'Dashboard', icon: <BarChartIcon />, path: `/dashboard/projects/${id}/view` },
    { text: 'Tools', icon: <SettingsIcon />, path: `/dashboard/projects/${id}/tools` },
    { text: 'Data Sources', icon: <BarChartIcon />, path: `/dashboard/projects/${id}/data` },
    { text: 'Canopy Analysis', icon: <BarChartIcon />, path: `/dashboard/projects/${id}/canopy-analysis` },
    { text: 'Analysis', icon: <AssessmentIcon />, path: `/dashboard/projects/${id}/analysis` },
    { text: 'Reports', icon: <AssessmentIcon />, path: `/dashboard/projects/${id}/reports` },
    { text: 'Settings', icon: <SettingsIcon />, path: `/dashboard/projects/${id}/settings` },
  ];

  // Sample tools and data sources for demo purposes
  const sampleTools: Tool[] = [
    {
      id: '1',
      name: 'Plot Visualizer',
      category: 'Visualization',
      lastUsed: '2024-11-10',
      usageCount: 42
    },
    {
      id: '2',
      name: 'Species Analysis',
      category: 'Analysis',
      lastUsed: '2024-11-08',
      usageCount: 38
    },
    {
      id: '3',
      name: 'Canopy Analysis',
      category: 'Analysis',
      lastUsed: '2024-11-05',
      usageCount: 25
    },
    {
      id: '4',
      name: 'Data Visualization',
      category: 'Visualization',
      lastUsed: '2024-11-03',
      usageCount: 30
    }
  ];

  const sampleDataSources: DataSource[] = [
    {
      id: '1',
      name: 'Field Data',
      type: 'CSV',
      lastUpdated: '2024-11-10',
      size: '12.4 MB',
      status: 'connected'
    },
    {
      id: '2',
      name: 'Satellite Imagery',
      type: 'GeoTIFF',
      lastUpdated: '2024-11-05',
      size: '45.2 MB',
      status: 'connected'
    },
    {
      id: '3',
      name: 'Canopy Images',
      type: 'JPEG',
      lastUpdated: '2024-11-08',
      size: '28.7 MB',
      status: 'syncing'
    },
    {
      id: '4',
      name: 'Soil Samples',
      type: 'JSON',
      lastUpdated: '2024-10-29',
      size: '3.1 MB',
      status: 'connected'
    }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Side Panel */}
      <Collapse in={isSidePanelOpen} orientation="horizontal" sx={{ width: isSidePanelOpen ? 250 : 0 }}>
        <Paper 
          elevation={3}
          sx={{ 
            width: 250, 
            height: '100%', 
            position: 'fixed', 
            zIndex: 1200,
            overflowY: 'auto',
            borderRight: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {project.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Project ID: {project.id}
            </Typography>
          </Box>
          <List>
            {sidePanelItems.map((item, index) => (
              <ListItem button key={index} onClick={() => navigate(item.path)}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Collapse>

      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: `calc(100% - ${isSidePanelOpen ? 250 : 0}px)`,
          ml: `${isSidePanelOpen ? 250 : 0}px`,
          transition: 'all 0.3s ease',
          overflowY: 'auto'
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
          {/* Project Header */}
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
                <Typography variant="body1" color="text.secondary">
                  Created: {formatDate(project.createdAt)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Updated: {formatDate(project.updatedAt)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={handleSyncProject}
                disabled={syncStatus === 'syncing'}
              >
                {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'synced' ? 'Synced' : 'Sync Project'}
              </Button>
              <Button variant="outlined" startIcon={<ShareIcon />}>
                Share
              </Button>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveProject}>
                Save
              </Button>
            </Box>
          </Box>

          {/* Stats Summary */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {project.totalDataPoints || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Data Points
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                  {project.tools.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tools Used
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {project.progress || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {project.dataSources.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Data Sources
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Project Progress</Typography>
              <Typography variant="subtitle1">{project.progress || 0}%</Typography>
            </Box>
            <Box sx={{ width: '100%', height: 12, backgroundColor: 'grey.300', borderRadius: 5 }}>
              <Box 
                sx={{ 
                  height: '100%', 
                  width: `${project.progress || 0}%`, 
                  backgroundColor: 'primary.main', 
                  borderRadius: 5,
                  transition: 'width 0.3s ease'
                }} 
              />
            </Box>
          </Paper>

          {/* Tabs */}
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
              <Tab label="Overview" />
              <Tab label="Tools" />
              <Tab label="Data Sources" />
              <Tab label="Analysis" />
              <Tab label="Reports" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <Box>
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardHeader 
                      title="Project Details" 
                      sx={{ pb: 1 }}
                    />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                          <Typography variant="body1">{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                          <Typography variant="body1">{formatDate(project.createdAt)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                          <Typography variant="body1">{formatDate(project.updatedAt)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Last Synced</Typography>
                          <Typography variant="body1">{project.lastSynced ? formatDate(project.lastSynced) : 'Never'}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Tools Used</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {project.tools.map((tool, index) => (
                              <Chip key={index} label={tool} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Data Sources</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {project.dataSources.map((source, index) => (
                              <Chip key={index} label={source} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardHeader 
                      title="Recent Activity" 
                      sx={{ pb: 1 }}
                    />
                    <CardContent>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <AlertTitle>Project Created</AlertTitle>
                        <Typography variant="body2">
                          {formatDate(project.createdAt)} - Project initialized
                        </Typography>
                      </Alert>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <AlertTitle>Data Synced</AlertTitle>
                        <Typography variant="body2">
                          {project.lastSynced ? formatDate(project.lastSynced) : formatDate(project.createdAt)} - Field data updated
                        </Typography>
                      </Alert>
                      <Alert severity="warning">
                        <AlertTitle>Analysis Running</AlertTitle>
                        <Typography variant="body2">
                          Species diversity analysis in progress
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={3}>
                {sampleTools.map((tool) => (
                  <Grid item xs={12} sm={6} md={4} key={tool.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {tool.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Category: {tool.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Last used: {formatDate(tool.lastUsed)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Usage count: {tool.usageCount}
                        </Typography>
                      </CardContent>
                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          variant="contained" 
                          size="small"
                          component={RouterLink}
                          to={`/dashboard/ecological-analysis/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          Open Tool
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {activeTab === 2 && (
              <Box>
                {/* Import Status Message */}
                {importStatus !== 'idle' && (
                  <Alert 
                    severity={importStatus === 'success' ? 'success' : importStatus === 'error' ? 'error' : 'info'} 
                    sx={{ mb: 3 }}
                  >
                    {importMessage}
                  </Alert>
                )}
                
                {/* Data Import Section */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Import Data
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Field Data Import
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Import field collection data from CSV files.
                          </Typography>
                          
                          <Box sx={{ mt: 2 }}>
                            <TextField
                              fullWidth
                              label="CSV File Path"
                              value={fieldDataPath}
                              onChange={(e) => setFieldDataPath(e.target.value)}
                              size="small"
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <MuiIconButton onClick={() => setFieldDataPath('/vegetation-plotting/field-data/woody_vegetation.csv')}>
                                      <DownloadIcon />
                                    </MuiIconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Box>
                          
                          <Box sx={{ mt: 2, textAlign: 'right' }}>
                            <Button
                              variant="contained"
                              startIcon={<UploadIcon />}
                              onClick={handleImportFieldData}
                              disabled={importStatus === 'importing'}
                            >
                              Import Field Data
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Canopy Images Import
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Import canopy images from the designated folder.
                          </Typography>
                          
                          <Box sx={{ mt: 2 }}>
                            <TextField
                              fullWidth
                              label="Images Folder Path"
                              value={canopyImagePath}
                              onChange={(e) => setCanopyImagePath(e.target.value)}
                              size="small"
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <MuiIconButton onClick={() => setCanopyImagePath('/vegetation-plotting/capopy_images')}>
                                      <DownloadIcon />
                                    </MuiIconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Box>
                          
                          <Box sx={{ mt: 2, textAlign: 'right' }}>
                            <Button
                              variant="contained"
                              startIcon={<UploadIcon />}
                              onClick={handleImportCanopyImages}
                              disabled={importStatus === 'importing'}
                            >
                              Import Canopy Images
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
                
                {/* Existing Data Sources Display */}
                <Grid container spacing={3}>
                  {sampleDataSources.map((source) => (
                    <Grid item xs={12} sm={6} md={4} key={source.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {source.name}
                            </Typography>
                            <Chip 
                              label={source.status} 
                              size="small"
                              color={
                                source.status === 'connected' ? 'success' : 
                                source.status === 'disconnected' ? 'error' : 'warning'
                              }
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Type: {source.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Size: {source.size}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Last updated: {formatDate(source.lastUpdated)}
                          </Typography>
                        </CardContent>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button variant="outlined" size="small">
                            View Data
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Analysis tools and visualizations for this project will appear here.
                </Alert>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        Species Distribution Chart
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        Canopy Coverage Analysis
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        Biodiversity Index
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        Environmental Correlation
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 4 && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Generated reports for this project will appear here.
                </Alert>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Project Summary Report
                      </Typography>
                      <Typography variant="body1" paragraph>
                        Comprehensive summary of the Urban Forest Analysis project including key findings, data insights, and recommendations.
                      </Typography>
                      <Button variant="outlined">Download Report</Button>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Species Diversity Report
                      </Typography>
                      <Typography variant="body1" paragraph>
                        Detailed analysis of species diversity across different quadrants and environmental conditions.
                      </Typography>
                      <Button variant="outlined">Download Report</Button>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Floating Action Button for Side Panel */}
      <Fab
        color="primary"
        size="small"
        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
        sx={{
          position: 'fixed',
          bottom: 16,
          left: isSidePanelOpen ? 250 + 16 : 16,
          zIndex: 1300,
          transition: 'left 0.3s ease'
        }}
      >
        {isSidePanelOpen ? <ExpandMoreIcon /> : <ExpandLessIcon />}
      </Fab>
    </Box>
  );
};

export default ProjectViewPage;