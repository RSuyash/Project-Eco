import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputBase,
  Avatar,
  AvatarGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
  MenuItem as MuiMenuItem,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Fade,
  Skeleton,
  ListItemIcon,
  SelectChangeEvent,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList'; // Cleaner list icon
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ScienceIcon from '@mui/icons-material/Science';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Components & Services
import Breadcrumb from '../../components/Breadcrumb';
import { getAllProjects, deleteProject } from '../../services/dbService';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

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
  team?: string[]; // Mock team data
}

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------

const StatusChip = ({ status }: { status: string }) => {
  const theme = useTheme();
  let color = theme.palette.text.secondary;
  let bgcolor = theme.palette.action.hover;
  let icon = <AccessTimeIcon sx={{ fontSize: 14 }} />;

  if (status === 'active') {
    color = theme.palette.success.main;
    bgcolor = alpha(theme.palette.success.main, 0.1);
    icon = <TrendingUpIcon sx={{ fontSize: 14 }} />;
  } else if (status === 'completed') {
    color = theme.palette.info.main;
    bgcolor = alpha(theme.palette.info.main, 0.1);
    icon = <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />;
  }

  return (
    <Chip
      icon={icon}
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      sx={{
        bgcolor: bgcolor,
        color: color,
        fontWeight: 700,
        borderRadius: '6px',
        border: '1px solid',
        borderColor: alpha(color, 0.2),
        '& .MuiChip-icon': { color: 'inherit', ml: 1 },
        textTransform: 'capitalize'
      }}
    />
  );
};

const StatWidget = ({ title, value, icon: Icon, color, delay }: any) => {
  const theme = useTheme();
  
  return (
    <Fade in={true} style={{ transitionDelay: `${delay}ms` }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          height: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
            borderColor: color,
          }
        }}
      >
        {/* Decorative Circle Background */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(color, 0.2)} 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: 2, 
              bgcolor: alpha(color, 0.1), 
              color: color, 
              display: 'flex',
              mr: 2 
            }}>
              <Icon />
            </Box>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>
          </Box>
          <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>
            {value}
          </Typography>
        </Box>
      </Paper>
    </Fade>
  );
};

const ProjectGridCard = ({ project, onClick, onDelete, onEdit }: any) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Generate a deterministic gradient based on the project ID/Name
  const gradients = [
    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    `linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)`,
    `linear-gradient(135deg, #FC466B 0%, #3F5EFB 100%)`,
    `linear-gradient(135deg, #FDBB2D 0%, #22C1C3 100%)`
  ];
  const bgGradient = gradients[project.name.length % gradients.length];

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 24px -10px rgba(0,0,0,0.15)',
          borderColor: 'primary.main',
        },
      }}
      onClick={onClick}
    >
      {/* Header Banner */}
      <Box sx={{ height: 8, background: bgGradient }} />

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
             <StatusChip status={project.status} />
          </Box>
          <IconButton size="small" onClick={handleMenuOpen} sx={{ mt: -1, mr: -1 }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
          {project.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 3, 
            minHeight: 40,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.6
          }}
        >
          {project.description || "No description provided."}
        </Typography>

        {/* Progress Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">Analysis Progress</Typography>
            <Typography variant="caption" fontWeight={700} color="primary.main">{project.progress || 0}%</Typography>
          </Box>
          <Box sx={{ width: '100%', height: 6, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3 }}>
            <Box 
              sx={{ 
                width: `${project.progress || 0}%`, 
                height: '100%', 
                bgcolor: 'primary.main', 
                borderRadius: 3,
                transition: 'width 0.5s ease-in-out'
              }} 
            />
          </Box>
        </Box>

        {/* Footer Info */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
           <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 10, border: `2px solid ${theme.palette.background.paper}` } }}>
              <Avatar alt="User 1" src="/" />
              <Avatar alt="User 2" src="/" />
              <Avatar alt="User 3" src="/" />
           </AvatarGroup>
           
           <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 12 }} />
              {new Date(project.updatedAt).toLocaleDateString()}
           </Typography>
        </Stack>
      </CardContent>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{ sx: { minWidth: 140, borderRadius: 2, boxShadow: theme.shadows[3] } }}
      >
        <MuiMenuItem onClick={() => { onEdit(project.id); handleMenuClose(); }}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          <Typography variant="body2">Edit</Typography>
        </MuiMenuItem>
        <MuiMenuItem onClick={() => { onClick(); handleMenuClose(); }}>
           <ListItemIcon><VisibilityOutlinedIcon fontSize="small" /></ListItemIcon>
           <Typography variant="body2">View</Typography>
        </MuiMenuItem>
        <Divider />
        <MuiMenuItem onClick={() => { onDelete(project.id); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
          <Typography variant="body2">Delete</Typography>
        </MuiMenuItem>
      </Menu>
    </Card>
  );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

const ProjectsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Fetch Data
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: getAllProjects,
    staleTime: 1000 * 60 * 2, // 2 mins
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  // Handlers
  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this project permanently?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (id: string) => navigate(`/dashboard/projects/${id}/edit`);

  // Filtering Logic
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
      // Default recent
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });

    return result;
  }, [projects, searchQuery, filterStatus, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    dataPoints: projects.reduce((acc, curr) => acc + (curr.totalDataPoints || 0), 0)
  }), [projects]);

  return (
    <Box sx={{ minHeight: '100vh', pb: 8 }}>
      <Breadcrumb />
      
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        
        {/* Header Section */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} mb={4}>
          <Box>
            <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>
              Projects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your research, track progress, and analyze ecological data.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/projects/new')}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: theme.shadows[4],
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            New Project
          </Button>
        </Stack>

        {/* Statistics Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget title="Total Projects" value={stats.total} icon={FolderOpenIcon} color={theme.palette.primary.main} delay={0} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget title="Active Research" value={stats.active} icon={ScienceIcon} color={theme.palette.success.main} delay={100} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget title="Completed" value={stats.completed} icon={CheckCircleOutlineIcon} color={theme.palette.info.main} delay={200} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget title="Data Points" value={stats.dataPoints} icon={TrendingUpIcon} color={theme.palette.warning.main} delay={300} />
          </Grid>
        </Grid>

        {/* Toolbar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Search */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: alpha(theme.palette.action.active, 0.05), 
            borderRadius: 2, 
            px: 2, 
            py: 0.5, 
            width: { xs: '100%', md: 320 },
            border: '1px solid transparent',
            '&:focus-within': { borderColor: 'primary.main', bgcolor: 'background.paper' },
            transition: 'all 0.2s'
          }}>
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
            {searchQuery && (
              <IconButton size="small" onClick={() => setSearchQuery('')}>
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Controls */}
          <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' }, overflowX: 'auto' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}
                startAdornment={<SortIcon sx={{ mr: 1, fontSize: 20, opacity: 0.7 }} />}
              >
                <MenuItem value="recent">Recently Updated</MenuItem>
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="progress">Progress</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 0.5, display: 'flex' }}>
              <IconButton 
                size="small" 
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
                sx={{ borderRadius: 1.5 }}
              >
                <GridViewIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
                sx={{ borderRadius: 1.5 }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Box>
          </Stack>
        </Paper>

        {/* Content Area */}
        {isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((n) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={n}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : filteredProjects.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              py: 8, 
              textAlign: 'center', 
              bgcolor: 'transparent',
              border: '2px dashed', 
              borderColor: 'divider', 
              borderRadius: 4 
            }}
          >
            <Box sx={{ mb: 2, color: 'text.secondary', opacity: 0.5 }}>
              <FolderOpenIcon sx={{ fontSize: 64 }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>No projects found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Adjust your filters or create a new project to get started.
            </Typography>
            <Button variant="outlined" onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}>
              Clear Filters
            </Button>
          </Paper>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {filteredProjects.map((project, idx) => (
                  <Fade in={true} key={project.id} style={{ transitionDelay: `${idx * 50}ms` }}>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <ProjectGridCard 
                        project={project} 
                        onClick={() => navigate(`/dashboard/projects/${project.id}/view`)}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                      />
                    </Grid>
                  </Fade>
                ))}
              </Grid>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Project Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow 
                        key={project.id}
                        hover
                        sx={{ 
                          cursor: 'pointer', 
                          transition: 'background-color 0.2s',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } 
                        }}
                        onClick={() => navigate(`/dashboard/projects/${project.id}/view`)}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', borderRadius: 2 }}>
                              {project.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700}>{project.name}</Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {project.description?.substring(0, 40) || 'No description'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={project.status} />
                        </TableCell>
                        <TableCell sx={{ width: 200 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ flexGrow: 1, height: 6, bgcolor: 'divider', borderRadius: 3 }}>
                              <Box sx={{ width: `${project.progress || 0}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 3 }} />
                            </Box>
                            <Typography variant="caption" fontWeight={600}>{project.progress || 0}%</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            onClick={(e) => { e.stopPropagation(); handleEdit(project.id); }}
                            sx={{ mr: 1 }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                            color="error"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ProjectsPage;