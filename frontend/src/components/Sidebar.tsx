import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  IconButton,
  Avatar,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
  Badge,
  Switch,
  FormControlLabel
} from '@mui/material';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import ForestIcon from '@mui/icons-material/Forest';
import PetsIcon from '@mui/icons-material/Pets';
import LandscapeIcon from '@mui/icons-material/Terrain';
import ScienceIcon from '@mui/icons-material/Science';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MapIcon from '@mui/icons-material/Map';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import { useAppTheme } from '../contexts/ThemeContext';

// ----------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 88;

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItemConfig {
  title: string;
  path?: string;
  icon: React.ReactElement;
  children?: NavItemConfig[];
  info?: string;
}

const NAV_CONFIG: { subheader: string; items: NavItemConfig[] }[] = [
  {
    subheader: 'Workspace',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
      { title: 'Projects', path: '/dashboard/projects', icon: <AccountTreeIcon /> },
      { title: 'Plots', path: '/dashboard/plots', icon: <MapIcon /> },
    ],
  },
  {
    subheader: 'Analysis Tools',
    items: [
      {
        title: 'Ecological Data',
        icon: <BarChartIcon />,
        children: [
          { title: 'Flora & Vegetation', path: '/dashboard/ecological-analysis/flora', icon: <ForestIcon fontSize="small" /> },
          { title: 'Fauna & Wildlife', path: '/dashboard/ecological-analysis/fauna', icon: <PetsIcon fontSize="small" /> },
          { title: 'Landscape', path: '/dashboard/ecological-analysis/landscape', icon: <LandscapeIcon fontSize="small" /> },
          { title: 'Data Lab', path: '/dashboard/ecological-analysis/data-analysis', icon: <ScienceIcon fontSize="small" /> },
        ],
      },
    ],
  },
];

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------

const NavItem = ({
  item,
  level = 0,
  isOpen,
  currentPath,
  onNavigate
}: {
  item: NavItemConfig;
  level?: number;
  isOpen: boolean;
  currentPath: string;
  onNavigate: (path: string) => void;
}) => {
  const theme = useTheme();
  const hasChildren = !!item.children;
  const isActive = item.path ? currentPath === item.path : false;
  const isChildActive = item.children?.some(child => child.path === currentPath);
  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  const handleItemClick = () => {
    if (hasChildren) {
      setOpen(!open);
    } else if (item.path) {
      onNavigate(item.path);
    }
  };

  const activeStyle = {
    color: theme.palette.primary.main,
    bgcolor: alpha(theme.palette.primary.main, 0.08),
    fontWeight: 'bold',
    '& .icon': { color: theme.palette.primary.main },
    borderRight: `3px solid ${theme.palette.primary.main}`,
  };

  const baseStyle = {
    height: 48,
    position: 'relative',
    textTransform: 'capitalize',
    paddingLeft: theme.spacing(2 + level * 2),
    paddingRight: theme.spacing(2.5),
    marginBottom: 0.5,
    borderRadius: '0 24px 24px 0', // Rounded right side only
    color: theme.palette.text.secondary,
    '&:hover': {
      bgcolor: theme.palette.action.hover,
      color: theme.palette.text.primary,
      '& .icon': { color: theme.palette.text.primary },
    },
    transition: 'all 0.2s ease-in-out',
  };

  if (!isOpen && level === 0) {
    return (
      <Tooltip title={item.title} placement="right" arrow>
        <ListItemButton
          onClick={handleItemClick}
          sx={{
            ...baseStyle,
            paddingLeft: 0,
            paddingRight: 0,
            justifyContent: 'center',
            borderRadius: 2,
            mx: 1,
            mb: 1,
            ...(isActive || isChildActive ? { ...activeStyle, borderRight: 'none', bgcolor: alpha(theme.palette.primary.main, 0.1) } : {}),
          }}
        >
          <ListItemIcon className="icon" sx={{ minWidth: 0, width: 24, height: 24, color: 'inherit', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {item.icon}
          </ListItemIcon>
        </ListItemButton>
      </Tooltip>
    );
  }

  return (
    <>
      <ListItemButton
        onClick={handleItemClick}
        sx={{
          ...baseStyle,
          ...(isActive || (hasChildren && open) ? activeStyle : {}),
        }}
      >
        <ListItemIcon className="icon" sx={{ width: 24, height: 24, minWidth: 24, mr: 2, color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.icon}
        </ListItemIcon>

        <ListItemText
          primary={item.title}
          primaryTypographyProps={{
            noWrap: true,
            variant: isActive ? 'subtitle2' : 'body2',
            fontWeight: isActive ? 700 : 500,
          }}
        />

        {item.info && (
          <Box component="span" sx={{ ml: 1, lineHeight: 0 }}>
            <Badge badgeContent={item.info} color="error" variant="dot" />
          </Box>
        )}

        {hasChildren && (
          <Box component="span" sx={{ ml: 1, width: 16, height: 16, display: 'flex', alignItems: 'center' }}>
            {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </Box>
        )}
      </ListItemButton>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child) => (
              <NavItem
                key={child.title}
                item={child}
                level={level + 1}
                isOpen={isOpen}
                currentPath={currentPath}
                onNavigate={onNavigate}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { mode, toggleTheme } = useAppTheme();

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) onToggle();
  };

  const renderContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* 1. Logo / Brand Area */}
      <Box sx={{ px: 3, py: 4, display: 'flex', alignItems: 'center' }}>
        {isOpen ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.primary.contrastText,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
              }}
            >
              <ForestIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} lineHeight={1.1} color="text.primary">
                EcoData
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Research OS
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.primary.contrastText,
              mx: 'auto',
              cursor: 'pointer'
            }}
            onClick={onToggle}
          >
            <ForestIcon />
          </Box>
        )}
      </Box>

      {/* 2. Navigation List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 0 }}>
        {NAV_CONFIG.map((group) => (
          <List key={group.subheader} disablePadding sx={{ mb: 3 }}>
            {isOpen && (
              <Typography
                variant="overline"
                sx={{
                  px: 3,
                  mb: 1,
                  display: 'block',
                  color: theme.palette.text.disabled,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                }}
              >
                {group.subheader}
              </Typography>
            )}

            {group.items.map((item) => (
              <NavItem
                key={item.title}
                item={item}
                isOpen={isOpen}
                currentPath={location.pathname}
                onNavigate={handleNavigate}
              />
            ))}
          </List>
        ))}
      </Box>

      {/* 3. Footer / Settings */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        {isOpen ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Lab Mode Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                {mode === 'dark' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                <Typography variant="body2" fontWeight={600}>
                  {mode === 'dark' ? 'Digital Biosphere' : 'Lab Mode'}
                </Typography>
              </Box>
              <Switch size="small" checked={mode === 'dark'} onChange={toggleTheme} />
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.action.active, 0.05),
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(theme.palette.action.active, 0.1) },
              }}
            >
              <Avatar sx={{ width: 36, height: 36, mr: 1.5 }} />
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography variant="subtitle2" noWrap>Researcher Doe</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>Lead Ecologist</Typography>
              </Box>
              <SettingsIcon fontSize="small" color="action" />
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={toggleTheme} size="small">
              {mode === 'dark' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            </IconButton>
            <Avatar sx={{ width: 36, height: 36, cursor: 'pointer' }} />
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { sm: 0 },
        width: { sm: isOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED },
        transition: theme.transitions.create('width', {
          duration: theme.transitions.duration.standard,
        }),
      }}
    >
      {isMobile ? (
        <Drawer
          open={isOpen}
          onClose={onToggle}
          variant="temporary"
          PaperProps={{ sx: { width: DRAWER_WIDTH } }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={isOpen}
          variant="permanent"
          PaperProps={{
            sx: {
              width: isOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
              borderRight: 'none',
              transition: theme.transitions.create('width', {
                duration: theme.transitions.duration.standard,
              }),
              overflow: 'hidden',
              bgcolor: 'transparent',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;