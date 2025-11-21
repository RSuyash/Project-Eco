import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { addProject, getAllTools, getAllDataSources } from '../../services/dbService';

interface Tool {
  id: string;
  name: string;
  category: string;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
}

const NewProjectPage = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectType, setProjectType] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [openToolSelector, setOpenToolSelector] = useState(false);
  const [openDataSourceSelector, setOpenDataSourceSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [availableDataSources, setAvailableDataSources] = useState<DataSource[]>([]);

  // Load tools and data sources from IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        const tools = await getAllTools();
        const dataSources = await getAllDataSources();
        setAvailableTools(tools);
        setAvailableDataSources(dataSources);
      } catch (err) {
        console.error('Error loading tools/data sources:', err);
        setError('Failed to load tools and data sources');
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create project object
      const project = {
        id: `project_${Date.now()}`, // Generate unique ID
        name: projectName,
        description: projectDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active' as const,
        tools: selectedTools,
        dataSources: selectedDataSources,
        progress: 0,
        totalDataPoints: 0,
        lastSynced: new Date().toISOString()
      };

      // Save project to IndexedDB
      await addProject(project);
      
      // Navigate to the new project dashboard
      navigate(`/dashboard/projects/${project.id}/view`);
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTool = (tool: string) => {
    if (!selectedTools.includes(tool)) {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const removeTool = (tool: string) => {
    setSelectedTools(selectedTools.filter(t => t !== tool));
  };

  const addDataSource = (source: string) => {
    if (!selectedDataSources.includes(source)) {
      setSelectedDataSources([...selectedDataSources, source]);
    }
  };

  const removeDataSource = (source: string) => {
    setSelectedDataSources(selectedDataSources.filter(s => s !== source));
  };

  return (
    <Box>
      <Breadcrumb />
      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Create New Project
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  variant="outlined"
                  size="small"
                  disabled={loading}
                />
              </Grid>
              
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Project Description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  multiline
                  rows={4}
                  variant="outlined"
                  size="small"
                  disabled={loading}
                />
              </Grid>
              
              <Grid xs={12} md={6}>
                <FormControl fullWidth size="small" disabled={loading}>
                  <InputLabel>Project Type</InputLabel>
                  <Select
                    value={projectType}
                    label="Project Type"
                    onChange={(e) => setProjectType(e.target.value)}
                    required
                  >
                    <MenuItem value="ecological">Ecological Analysis</MenuItem>
                    <MenuItem value="conservation">Conservation Study</MenuItem>
                    <MenuItem value="monitoring">Environmental Monitoring</MenuItem>
                    <MenuItem value="research">Research Project</MenuItem>
                    <MenuItem value="restoration">Restoration Project</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Tools
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={() => setOpenToolSelector(true)}
                    disabled={loading}
                  >
                    Add Tools
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, minHeight: 40, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                  {selectedTools.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No tools selected. Click "Add Tools" to select tools for this project.
                    </Typography>
                  ) : (
                    selectedTools.map((tool) => (
                      <Chip
                        key={tool}
                        label={tool}
                        onDelete={() => removeTool(tool)}
                        size="small"
                        disabled={loading}
                      />
                    ))
                  )}
                </Box>
              </Grid>
              
              <Grid xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Data Sources
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDataSourceSelector(true)}
                    disabled={loading}
                  >
                    Add Data Sources
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, minHeight: 40, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                  {selectedDataSources.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No data sources selected. Click "Add Data Sources" to select data sources for this project.
                    </Typography>
                  ) : (
                    selectedDataSources.map((source) => (
                      <Chip
                        key={source}
                        label={source}
                        onDelete={() => removeDataSource(source)}
                        size="small"
                        disabled={loading}
                      />
                    ))
                  )}
                </Box>
              </Grid>
              
              <Grid xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/dashboard/projects')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    type="submit"
                    disabled={!projectName || loading}
                  >
                    {loading ? 'Creating...' : 'Create Project'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        {/* Tool Selector Dialog */}
        <Dialog open={openToolSelector} onClose={() => setOpenToolSelector(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Select Tools
            <IconButton
              aria-label="close"
              onClick={() => setOpenToolSelector(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
              disabled={loading}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {availableTools.length > 0 ? (
              <Grid container spacing={1} sx={{ mt: 1 }}>
                {availableTools.map((tool) => (
                  <Grid xs={6} key={tool.id}>
                    <Button
                      fullWidth
                      variant={selectedTools.includes(tool.name) ? 'contained' : 'outlined'}
                      onClick={() => {
                        if (selectedTools.includes(tool.name)) {
                          removeTool(tool.name);
                        } else {
                          addTool(tool.name);
                        }
                      }}
                      sx={{ mb: 1 }}
                      disabled={loading}
                    >
                      {tool.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 2 }}>
                Loading tools...
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenToolSelector(false)} disabled={loading}>Done</Button>
          </DialogActions>
        </Dialog>
        
        {/* Data Source Selector Dialog */}
        <Dialog open={openDataSourceSelector} onClose={() => setOpenDataSourceSelector(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Select Data Sources
            <IconButton
              aria-label="close"
              onClick={() => setOpenDataSourceSelector(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
              disabled={loading}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {availableDataSources.length > 0 ? (
              <Grid container spacing={1} sx={{ mt: 1 }}>
                {availableDataSources.map((source) => (
                  <Grid xs={6} key={source.id}>
                    <Button
                      fullWidth
                      variant={selectedDataSources.includes(source.name) ? 'contained' : 'outlined'}
                      onClick={() => {
                        if (selectedDataSources.includes(source.name)) {
                          removeDataSource(source.name);
                        } else {
                          addDataSource(source.name);
                        }
                      }}
                      sx={{ mb: 1 }}
                      disabled={loading}
                    >
                      {source.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" align="center" sx={{ py: 2 }}>
                Loading data sources...
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDataSourceSelector(false)} disabled={loading}>Done</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default NewProjectPage;