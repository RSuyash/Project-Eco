import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  InputBase,
  Avatar,
  AvatarGroup,
  TextField,
  FormControl,
  InputAdornment,
  Select,
  MenuItem,
 InputLabel,
 Menu,
 MenuItem as MuiMenuItem
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import GridViewIcon from '@mui/icons-material/GridView';
import MapIcon from '@mui/icons-material/Map';
import TableViewIcon from '@mui/icons-material/TableView';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ForestIcon from '@mui/icons-material/Forest';
import ScienceIcon from '@mui/icons-material/Science';
import GroupIcon from '@mui/icons-material/Group';
import GridOnIcon from '@mui/icons-material/GridOn';
import PestControlIcon from '@mui/icons-material/PestControl';
import { getAllProjects, deleteProject } from '../../services/dbService';
import { importFieldData } from '../../services/dataImportService';

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

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Load projects from IndexedDB
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const dbProjects = await getAllProjects();
        setProjects(dbProjects);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleSyncData = async () => {
    setSyncStatus('syncing');
    setError(null);

    try {
      const projects = await getAllProjects();
      if (projects.length === 0) {
        setError('No projects found. Create a project first.');
        setSyncStatus('idle');
        return;
      }

      // Assuming we are syncing data for the first project
      const projectId = projects[0].id;

      // Import herb floor vegetation data
      await importFieldData(projectId, '/vegetation-plotting/field-data/herb_floor_vegetation.csv');

      // Import woody vegetation data
      await importFieldData(projectId, '/vegetation-plotting/field-data/woody_vegetation.csv');

      // Refresh projects from the database
      const updatedProjects = await getAllProjects();
      setProjects(updatedProjects);

      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (err) {
      console.error('Error syncing data:', err);
      setError('Failed to sync data');
      setSyncStatus('idle');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await deleteProject(id);
      // Remove the project from the UI
      setProjects(projects.filter(project => project.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Breadcrumb />
      <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Environmental Science Projects
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and analyze your ecological research projects with integrated tools
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* View Toggle */}
              <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <Button
                  variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <GridViewIcon fontSize="small" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setViewMode('map')}
                  title="Map View"
                >
                  <MapIcon fontSize="small" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <TableViewIcon fontSize="small" />
                </Button>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={RouterLink}
                to="/dashboard/projects/new"
              >
                New Project
              </Button>
            </Box>
          </Box>
          {/* Global Search Bar */}
          <Paper
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2
            }}
          >
            <IconButton sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search projects, plots, or species..."
              inputProps={{ 'aria-label': 'search projects' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <IconButton
              sx={{ p: '10px', color: 'text.secondary' }}
              aria-label="clear search"
              onClick={() => setSearchQuery('')}
            >
              <ClearIcon />
            </IconButton>
          </Paper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats Summary */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.05) 100%)',
                borderRadius: 2
              }}
            >
              <GridOnIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {projects.reduce((acc, project) => acc + (project.totalDataPoints || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Plots Surveyed
              </Typography>
            </Paper>
          </Grid>
          <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(255,193,7,0.1) 0%, rgba(255,193,7,0.05) 100%)',
                borderRadius: 2
              }}
            >
              <PestControlIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {projects.reduce((acc, project) => acc + (project.tools.length || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tools Used
              </Typography>
            </Paper>
          </Grid>
          <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.05) 100%)',
                borderRadius: 2
              }}
            >
              <ScienceIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {projects.reduce((acc, project) => acc + (project.totalDataPoints || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data Points
              </Typography>
            </Paper>
          </Grid>
          <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(156,39,176,0.1) 0%, rgba(156,39,176,0.05) 100%)',
                borderRadius: 2
              }}
            >
              <GroupIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                {projects.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projects
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Advanced Filter Bar */}
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
            backgroundColor: 'background.paper',
            borderRadius: 2
          }}
        >
          <TextField
            size="small"
            placeholder="Filter by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value as string)}
            >
              <MenuItem value="name">Name A-Z</MenuItem>
              <MenuItem value="recent">Last Activity</MenuItem>
              <MenuItem value="created">Creation Date</MenuItem>
              <MenuItem value="progress">Progress</MenuItem>
            </Select>
          </FormControl>

          <Chip
            label="Status: All"
            variant={filterStatus === 'all' ? 'filled' : 'outlined'}
            onClick={() => setFilterStatus('all')}
            sx={{ height: '100%' }}
          />
          <Chip
            label="Status: Active"
            variant={filterStatus === 'active' ? 'filled' : 'outlined'}
            onClick={() => setFilterStatus('active')}
            sx={{ height: '100%' }}
          />
          <Chip
            label="Status: Completed"
            variant={filterStatus === 'completed' ? 'filled' : 'outlined'}
            onClick={() => setFilterStatus('completed')}
            sx={{ height: '100%' }}
          />

          <Chip
            label="Type: All"
            variant={filterType === 'all' ? 'filled' : 'outlined'}
            onClick={() => setFilterType('all')}
            sx={{ height: '100%' }}
          />
          <Chip
            label="Type: Forest"
            variant={filterType === 'forest' ? 'filled' : 'outlined'}
            onClick={() => setFilterType('forest')}
            sx={{ height: '100%' }}
          />
          <Chip
            label="Type: Wetland"
            variant={filterType === 'wetland' ? 'filled' : 'outlined'}
            onClick={() => setFilterType('wetland')}
            sx={{ height: '100%' }}
          />
        </Paper>

        {/* Projects Grid */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Project Explorer
            </Typography>
          </Box>

          {loading ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Loading projects...
              </Typography>
            </Paper>
          ) : projects.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No projects yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Create your first environmental science project to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={RouterLink}
                to="/dashboard/projects/new"
              >
                Create Project
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {projects
                .filter(project => {
                  // Filter by search query
                  const matchesSearch =
                    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    project.description.toLowerCase().includes(searchQuery.toLowerCase());

                  // Filter by status
                  const matchesStatus =
                    filterStatus === 'all' ||
                    project.status === filterStatus;

                  // For demo purposes, we'll use a simple filterType implementation
                  const matchesType = filterType === 'all' ||
                    (filterType === 'forest' && project.name.toLowerCase().includes('forest')) ||
                    (filterType === 'wetland' && project.name.toLowerCase().includes('wetland'));

                  return matchesSearch && matchesStatus && matchesType;
                })
                .sort((a, b) => {
                  switch (sortBy) {
                    case 'name':
                      return a.name.localeCompare(b.name);
                    case 'recent':
                      return new Date(b.updatedAt || b.createdAt).getTime() -
                             new Date(a.updatedAt || a.createdAt).getTime();
                    case 'created':
                      return new Date(b.createdAt).getTime() -
                             new Date(a.createdAt).getTime();
                    case 'progress':
                      return (b.progress || 0) - (a.progress || 0);
                    default:
                      return 0;
                  }
                })
                .map((project) => (
                <Grid sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' } }} key={project.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': { boxShadow: 6, cursor: 'pointer' },
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                    onClick={() => navigate(`/dashboard/projects/${project.id}/view`)}
                  >
                    {/* Card Media - Top image section */}
                    <CardMedia
                      component="img"
                      height="140"
                      image="https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                      alt={project.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                          {project.name}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnchorEl(e.currentTarget);
                            setSelectedProjectId(project.id);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedProjectId === project.id}
                          onClose={() => setAnchorEl(null)}
                          onClick={(e) => e.stopPropagation()}
                          PaperProps={{
                            style: {
                              width: '20ch',
                            },
                          }}
                        >
                          <MuiMenuItem onClick={() => {
                            navigate(`/dashboard/projects/${project.id}/view`);
                            setAnchorEl(null);
                          }}>
                            View
                          </MuiMenuItem>
                          <MuiMenuItem onClick={() => {
                            navigate(`/dashboard/projects/${project.id}/edit`);
                            setAnchorEl(null);
                          }}>
                            Edit
                          </MuiMenuItem>
                          <MuiMenuItem onClick={() => {
                            if (window.confirm('Are you sure you want to share this project?')) {
                              setAnchorEl(null);
                            }
                          }}>
                            Share
                          </MuiMenuItem>
                          <MuiMenuItem onClick={() => {
                            if (window.confirm('Are you sure you want to delete this project?')) {
                              handleDeleteProject(project.id);
                              setAnchorEl(null);
                            }
                          }}>
                            Delete
                          </MuiMenuItem>
                        </Menu>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                        {project.description}
                      </Typography>

                      {/* Progress bar */}
                      <Box sx={{ mt: 1, mb: 2 }}>
                        <LinearProgress variant="determinate" value={project.progress || 0} />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {project.progress || 0}% Complete
                        </Typography>
                      </Box>

                      {/* Data-forward metrics */}
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid sx={{ width: '50%' }} display="flex" alignItems="center">
                          <GridOnIcon fontSize="small" sx={{ color: 'primary.main', mr: 0.5 }} />
                          <Typography variant="body2">{project.totalDataPoints || 0} Plots</Typography>
                        </Grid>
                        <Grid sx={{ width: '50%' }} display="flex" alignItems="center">
                          <PestControlIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                          <Typography variant="body2">{project.tools.length} Tools</Typography>
                        </Grid>
                        <Grid sx={{ width: '50%' }} display="flex" alignItems="center">
                          <GroupIcon fontSize="small" sx={{ color: 'info.main', mr: 0.5 }} />
                          <AvatarGroup max={3} sx={{ ml: 0.5 }}>
                            <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>JD</Avatar>
                            <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>SM</Avatar>
                            <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>TK</Avatar>
                          </AvatarGroup>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', pt: 0, px: 2, pb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Updated {formatDate(project.updatedAt || project.createdAt)}
                      </Typography>
                      <Chip
                        label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        color={project.status === 'active' ? 'primary' : project.status === 'completed' ? 'success' : 'default'}
                        size="small"
                      />
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ProjectsPage;