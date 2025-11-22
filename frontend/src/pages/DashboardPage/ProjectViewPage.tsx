import { useState, useEffect, useMemo } from 'react';
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
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  AvatarGroup,
  Stack,
  Divider,
  TextareaAutosize,
  useTheme,
  alpha,
  Fade,
  CircularProgress,
  Tooltip,
  ListItemIcon,
  Breadcrumbs,
  Link
} from '@mui/material';
import { ArrowBack, Edit, Save, Delete, Add, Download, Share, FilterList, Map as MapIcon, BarChart, TableChart, Science, Forest, Landscape, Opacity, GridOn, Layers } from '@mui/icons-material';
import { parseAndProcessPlotData } from '../../services/plotDataService';
import { PlotData } from '../../components/PlotVisualizer/PlotExplorer';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';

// Icons
import SyncIcon from '@mui/icons-material/Sync';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import UploadIcon from '@mui/icons-material/Upload';

// Services & Logic
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectById, updateProject } from '../../services/dbService';
import { readCSVFile, parseCSVData } from '../../services/dataImportService';
import PlotExplorer from '../../components/PlotVisualizer/PlotExplorer';

import { Project } from '../../types';

// --- Components ---

const MetricCard = ({ title, value, subtitle, icon: Icon, color, onClick }: any) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        transition: 'all 0.2s ease-in-out',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
          borderColor: color,
        } : undefined
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(color, 0.1),
          color: color,
          display: 'flex'
        }}>
          <Icon fontSize="medium" />
        </Box>
      </Stack>
      <Typography variant="h4" fontWeight="800" sx={{ color: 'text.primary', mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

const ActionCard = ({ title, description, icon: Icon, actionLabel, onAction, color = 'primary' }: any) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 3,
      transition: 'all 0.2s',
      '&:hover': {
        borderColor: `${color}.main`,
        boxShadow: 2
      }
    }}
  >
    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pt: 4 }}>
      <Box sx={{ mb: 2, color: `${color}.main`, p: 2, borderRadius: '50%', bgcolor: alpha('#000', 0.03) }}>
        <Icon sx={{ fontSize: 40 }} />
      </Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
    </CardContent>
    <Box sx={{ p: 2, pt: 0 }}>
      <Button
        fullWidth
        variant="outlined"
        color={color}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </Box>
  </Card>
);

const FileListItem = ({ name, meta, type, onDownload }: any) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 2,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      transition: 'background-color 0.2s',
      '&:hover': { bgcolor: 'action.hover' }
    }}
  >
    <Box sx={{ mr: 2, color: 'primary.main' }}>
      <InsertDriveFileIcon fontSize="large" />
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="subtitle2" fontWeight="bold">{name}</Typography>
      <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
        <Chip label={type} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
        <Typography variant="caption" color="text.secondary">{meta}</Typography>
      </Stack>
    </Box>
    <Stack direction="row" spacing={1}>
      <Tooltip title="Download">
        <IconButton size="small" onClick={onDownload}><FileDownloadIcon fontSize="small" /></IconButton>
      </Tooltip>
      <Tooltip title="Actions">
        <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
      </Tooltip>
    </Stack>
  </Paper>
);

// --- Main Page Component ---

const ProjectViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Edit Notes State
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [projectNotes, setProjectNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');

  // Mock Data for UI visualization
  const [speciesData, setSpeciesData] = useState<{ name: string; count: number; gbhSum: number }[]>([]);
  const [dominantSpecies, setDominantSpecies] = useState<{ name: string; percentage: number } | null>(null);

  // Queries
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => id ? await getProjectById(id) : null,
    enabled: !!id,
  });

  // Derived Ecological Metrics (Real Data Placeholder)
  // TODO: Fetch actual plot data associated with this project

  // ...

  const { data: plotData, isLoading: isLoadingPlot } = useQuery({
    queryKey: ['plotData', id],
    queryFn: async () => {
      try {
        // Fetch CSVs from public folder
        const [woodyRes, herbRes] = await Promise.all([
          fetch('/vegetation-plotting/field-data/woody_vegetation.csv'),
          fetch('/vegetation-plotting/field-data/herb_floor_vegetation.csv')
        ]);

        const woodyText = await woodyRes.text();
        const herbText = await herbRes.text();

        // Process data for the current plot (e.g., P01)
        // We need to determine which plot ID to show. 
        // For now, let's default to 'P01' or derive from project if possible.
        // Since the project ID might not match CSV Plot IDs directly, 
        // we might need a selector. For this demo, we'll use 'P01'.
        const targetPlotId = 'P01';
        const scaleFactor = 800 / 10; // 800px / 10m

        return await parseAndProcessPlotData(woodyText, herbText, targetPlotId, scaleFactor);
      } catch (error) {
        console.error("Failed to load plot data:", error);
        return { trees: [], subplots: [] };
      }
    },
    enabled: !!id,
  });

  // Update local state when project loads
  useEffect(() => {
    if (project) {
      setProjectNotes(project.description || '');
    }
  }, [project]);

  // Mock calculation effect
  useEffect(() => {
    if (plotData && plotData.trees.length > 0) {
      setSpeciesData(new Array(12).fill(0).map((_, i) => ({ name: `Species ${i}`, count: 10, gbhSum: 100 })));
      setDominantSpecies({ name: 'Acacia sp.', percentage: 42.5 });
    }
  }, [plotData]);

  // Mutations
  const updateProjectMutation = useMutation({
    mutationFn: (updatedProject: Project) => updateProject(updatedProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  // Handlers
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setActiveTab(newValue);

  const handleSaveNotes = () => {
    if (!project) return;
    setSaveStatus('saving');
    updateProjectMutation.mutate({
      ...project,
      description: projectNotes,
      updatedAt: new Date().toISOString()
    });
    setIsEditingNotes(false);
  };

  const handleSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }, 1500);
  };

  // --- Loading / Error States ---
  if (isLoading) return (
    <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );

  if (error || !project) return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>Project Not Found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard/projects')}>
          Back to Projects
        </Button>
      </Paper>
    </Container>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>

      {/* --- Hero Header --- */}
      <Box sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pt: 2,
        pb: 0
      }}>
        <Container maxWidth="xl">

          {/* Integrated Breadcrumbs */}
          <Box sx={{ mb: 2 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
              aria-label="breadcrumb"
            >
              <Link
                component={RouterLink}
                to="/dashboard"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                underline="hover"
              >
                <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
                Dashboard
              </Link>
              <Link
                component={RouterLink}
                to="/dashboard/projects"
                color="inherit"
                underline="hover"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                Projects
              </Link>
              <Typography color="text.primary" fontWeight={500}>
                {project.name}
              </Typography>
            </Breadcrumbs>
          </Box>

          {/* Top Row: Title & Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {project.name}
                </Typography>
                <Chip
                  label={project.status}
                  color={project.status === 'active' ? 'success' : 'default'}
                  size="small"
                  sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                />
              </Stack>

              <Stack direction="row" spacing={3} alignItems="center" color="text.secondary">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon fontSize="small" />
                  <Typography variant="body2">Updated {new Date(project.updatedAt).toLocaleDateString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GroupIcon fontSize="small" />
                  <Typography variant="body2">3 Members</Typography>
                </Box>
              </Stack>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<SyncIcon className={syncStatus === 'syncing' ? 'spin' : ''} />}
                onClick={handleSync}
                disabled={syncStatus === 'syncing'}
              >
                {syncStatus === 'synced' ? 'Synced' : 'Sync Data'}
              </Button>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setIsEditingNotes(true)}
              >
                Edit Project
              </Button>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVertIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Navigation Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 48,
                px: 3
              }
            }}
          >
            <Tab label="Overview" icon={<DescriptionIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Plot Visualizer" icon={<MapIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Analysis Tools" icon={<AnalyticsIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Data Manager" icon={<FolderIcon fontSize="small" />} iconPosition="start" />
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4 }}>

        {/* --- TAB: OVERVIEW --- */}
        {activeTab === 0 && (
          <Fade in={true}>
            <Grid container spacing={3}>
              {/* Metrics Row */}
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Species Identified"
                  value={speciesData.length || 0}
                  icon={Forest}
                  color={theme.palette.success.main}
                  onClick={() => setActiveTab(3)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Total Plots"
                  value={plotData?.subplots?.length || 0}
                  icon={GridOn}
                  color={theme.palette.info.main}
                  onClick={() => setActiveTab(1)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Dominant Species"
                  value={dominantSpecies?.percentage ? `${dominantSpecies.percentage}%` : 'N/A'}
                  subtitle={dominantSpecies?.name || 'No Data'}
                  icon={TrendingUpIcon}
                  color={theme.palette.warning.main}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Overall Progress"
                  value={`${project.progress || 0}%`}
                  subtitle={project.totalDataPoints ? `${project.totalDataPoints} data points` : 'Ready to start'}
                  icon={AnalyticsIcon}
                  color={theme.palette.primary.main}
                />
              </Grid>

              {/* Project Notes & Activity */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }} elevation={0}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">Project Notes</Typography>
                    {isEditingNotes && (
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => setIsEditingNotes(false)}>Cancel</Button>
                        <Button size="small" variant="contained" onClick={handleSaveNotes}>Save</Button>
                      </Stack>
                    )}
                  </Box>

                  {isEditingNotes ? (
                    <TextareaAutosize
                      minRows={8}
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '1rem',
                        fontFamily: theme.typography.fontFamily,
                        borderColor: theme.palette.divider,
                        borderRadius: '8px',
                        backgroundColor: alpha(theme.palette.background.default, 0.5)
                      }}
                      value={projectNotes}
                      onChange={(e) => setProjectNotes(e.target.value)}
                    />
                  ) : (
                    <Box sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.action.hover, 0.05),
                      borderRadius: 2,
                      minHeight: 200
                    }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: projectNotes ? 'text.primary' : 'text.secondary' }}>
                        {projectNotes || "No notes added yet. Click 'Edit Project' to add a description or field notes."}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }} elevation={0}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Team</Typography>
                  <List>
                    {['John Doe', 'Jane Smith', 'Robert Brown'].map((name, i) => (
                      <ListItem key={i} sx={{ px: 0 }}>
                        <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.light }}>{name[0]}</Avatar>
                        <ListItemText
                          primary={name}
                          secondary={i === 0 ? 'Lead Researcher' : 'Field Technician'}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Activity</Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="Updated woody vegetation data" secondary="2 hours ago" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="Synced field notes" secondary="5 hours ago" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="Project created" secondary="2 days ago" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        )}

        {/* --- TAB: PLOT VISUALIZER --- */}
        {activeTab === 1 && (
          <Fade in={true}>
            <Paper sx={{ height: 'calc(100vh - 250px)', overflow: 'hidden', borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
              {isLoadingPlot ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <PlotExplorer data={plotData || { trees: [], subplots: [] }} plotId={id || ''} />
              )}
            </Paper>
          </Fade>
        )}

        {/* --- TAB: ANALYSIS TOOLS --- */}
        {activeTab === 2 && (
          <Fade in={true}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <ActionCard
                  title="Canopy Analysis"
                  description="Analyze canopy cover photos, calculate LAI and Gap Fraction."
                  icon={Forest}
                  actionLabel="Open Tool"
                  onAction={() => navigate(`/dashboard/projects/${id}/canopy-analysis`)}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ActionCard
                  title="Species-Area Curve"
                  description="Generate accumulation curves to estimate species richness."
                  icon={TrendingUpIcon}
                  actionLabel="View Curves"
                  onAction={() => { }}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ActionCard
                  title="Biodiversity Indices"
                  description="Calculate Shannon, Simpson, and Evenness indices for your plots."
                  icon={AnalyticsIcon}
                  actionLabel="Calculate"
                  onAction={() => { }}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ActionCard
                  title="Export Report"
                  description="Generate a comprehensive PDF summary of your project findings."
                  icon={FileDownloadIcon}
                  actionLabel="Generate PDF"
                  onAction={() => { }}
                  color="secondary"
                />
              </Grid>
            </Grid>
          </Fade>
        )}

        {/* --- TAB: DATA MANAGER --- */}
        {activeTab === 3 && (
          <Fade in={true}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">Project Files</Typography>
                    <Button startIcon={<UploadIcon />} variant="contained" size="small">Upload Data</Button>
                  </Box>

                  <FileListItem
                    name="woody_vegetation.csv"
                    type="CSV"
                    meta="62 rows • 16 columns • Updated 2 days ago"
                    onDownload={() => { }}
                  />
                  <FileListItem
                    name="herb_floor_vegetation.csv"
                    type="CSV"
                    meta="45 rows • 8 columns • Updated 2 days ago"
                    onDownload={() => { }}
                  />
                  <FileListItem
                    name="canopy_photos.zip"
                    type="ZIP"
                    meta="150 MB • 45 files • Updated 1 week ago"
                    onDownload={() => { }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }} elevation={0}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Data Summary</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Woody Vegetation" secondary="Validated • 100% Complete" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Herb Layer" secondary="Validated • 100% Complete" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ErrorIcon color="warning" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Soil Samples" secondary="Missing Data" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        )}

      </Container>

      {/* Menu for "More" button */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>Project Settings</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Export Data</MenuItem>
        <Divider />
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>Delete Project</MenuItem>
      </Menu>
    </Box>
  );
};

export default ProjectViewPage;