import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
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
  ListItemIcon,
  SelectChangeEvent,
  useTheme,
  alpha,
  Fade,
  Skeleton,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SortIcon from '@mui/icons-material/Sort';

// Components & Services
import Breadcrumb from '../../components/Breadcrumb';
import GlassCard from '../../components/common/GlassCard';
import NeonButton from '../../components/common/NeonButton';
import { getAllProjects, addProject, deleteProject } from '../../services/projectService';

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
  team?: string[];
}

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------

const StatusChip = ({ status }: { status: string }) => {
  const theme = useTheme();
  let color = theme.palette.text.secondary;
  let bgcolor = alpha(theme.palette.action.active, 0.1);
  let icon = <AccessTimeIcon sx={{ fontSize: 14 }} />;

  if (status === 'active') {
    color = theme.palette.secondary.main; // Bio Green
    bgcolor = alpha(theme.palette.secondary.main, 0.1);
    icon = <TrendingUpIcon sx={{ fontSize: 14 }} />;
  } else if (status === 'completed') {
    color = theme.palette.primary.main; // Neon Cyan
    bgcolor = alpha(theme.palette.primary.main, 0.1);
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
        borderRadius: '8px',
        border: '1px solid',
        borderColor: alpha(color, 0.3),
        '& .MuiChip-icon': { color: 'inherit', ml: 1 },
        textTransform: 'capitalize',
        backdropFilter: 'blur(4px)'
      }}
    />
  );
};

const StatWidget = ({ title, value, icon: Icon, color, delay }: any) => {
  return (
    <Fade in={true} style={{ transitionDelay: `${delay}ms` }}>
      <Box>
        <GlassCard sx={{ p: 3, height: '100%', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative Glow */}
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(color, 0.3)} 0%, transparent 70%)`,
              filter: 'blur(20px)',
              zIndex: 0,
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: alpha(color, 0.1),
                color: color,
                display: 'flex',
                mr: 2,
                boxShadow: `0 0 10px ${alpha(color, 0.2)}`
              }}>
                <Icon />
              </Box>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                {title}
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary', textShadow: `0 0 20px ${alpha(color, 0.3)}` }}>
              {value}
            </Typography>
          </Box>
        </GlassCard>
      </Box>
    </Fade>
  );
};

const ProjectGridCard = ({ project, onClick, onDelete, onEdit }: any) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <GlassCard onClick={onClick} sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0 }}>
      <Box sx={{ p: 3, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <StatusChip status={project.status} />
          <IconButton size="small" onClick={handleMenuOpen} sx={{ mt: -1, mr: -1, color: 'text.secondary' }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="h5" fontWeight={700} gutterBottom noWrap sx={{ color: 'text.primary' }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">Analysis Progress</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: theme.palette.primary.main }}>{project.progress || 0}%</Typography>
          </Box>
          <Box sx={{ width: '100%', height: 6, bgcolor: alpha(theme.palette.common.white, 0.1), borderRadius: 3 }}>
            <Box
              sx={{
                width: `${project.progress || 0}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                borderRadius: 3,
                boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
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
          </AvatarGroup>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 12 }} />
            {new Date(project.updatedAt).toLocaleDateString()}
          </Typography>
        </Stack>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            minWidth: 140,
            borderRadius: 2,
            background: 'rgba(10, 31, 28, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <MuiMenuItem onClick={() => { onEdit(project.id); handleMenuClose(); }}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} /></ListItemIcon>
          <Typography variant="body2" color="text.primary">Edit</Typography>
        </MuiMenuItem>
        <MuiMenuItem onClick={() => { onClick(); handleMenuClose(); }}>
          <ListItemIcon><VisibilityOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} /></ListItemIcon>
          <Typography variant="body2" color="text.primary">View</Typography>
        </MuiMenuItem>
        <MuiMenuItem onClick={() => { onDelete(project.id); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
          <Typography variant="body2">Delete</Typography>
        </MuiMenuItem>
      </Menu>
    </GlassCard>
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
            <Typography variant="h2" sx={{ mb: 0.5, background: `linear-gradient(90deg, #fff 0%, ${theme.palette.primary.main} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Projects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your research, track progress, and analyze ecological data.
            </Typography>
          </Box>
          <NeonButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/projects/new')}
          >
            New Project
          </NeonButton>
        </Stack>

        {/* Statistics Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget title="Total Projects" value={stats.total} icon={FolderOpenIcon} color={theme.palette.primary.main} delay={0} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget title="Active Research" value={stats.active} icon={ScienceIcon} color={theme.palette.secondary.main} delay={100} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget title="Completed" value={stats.completed} icon={CheckCircleOutlineIcon} color="#00b8ff" delay={200} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget title="Data Points" value={stats.dataPoints} icon={TrendingUpIcon} color="#ff4d00" delay={300} />
          </Grid>
        </Grid>

        {/* Toolbar */}
        <GlassCard
          sx={{
            p: 2,
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Search */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: alpha(theme.palette.common.white, 0.05),
            borderRadius: 2,
            px: 2,
            py: 0.5,
            width: { xs: '100%', md: 320 },
            border: '1px solid transparent',
            '&:focus-within': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.common.white, 0.1) },
            transition: 'all 0.2s'
          }}>
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{ color: 'text.primary' }}
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
        </GlassCard>

        {/* Content Area */}
        {isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((n) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={n}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)' }} />
              </Grid>
            ))}
          </Grid>
        ) : filteredProjects.length === 0 ? (
          <GlassCard
            sx={{
              py: 8,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ mb: 2, color: 'text.secondary', opacity: 0.5 }}>
              <FolderOpenIcon sx={{ fontSize: 64 }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>No projects found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Adjust your filters or create a new project to get started.
            </Typography>
            <NeonButton variant="outlined" onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}>
              Clear Filters
            </NeonButton>
          </GlassCard>
        ) : (
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
        )}
      </Container>
    </Box>
  );
};

export default ProjectsPage;