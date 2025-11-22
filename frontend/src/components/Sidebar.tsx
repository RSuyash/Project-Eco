import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
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
  Badge
} from '@mui/material';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard'; // Home/Overview
import BarChartIcon from '@mui/icons-material/BarChart'; // Analysis
import ForestIcon from '@mui/icons-material/Forest'; // Flora
import PetsIcon from '@mui/icons-material/Pets'; // Fauna
import LandscapeIcon from '@mui/icons-material/Terrain'; // Landscape
import ScienceIcon from '@mui/icons-material/Science'; // Data Analysis
import AccountTreeIcon from '@mui/icons-material/AccountTree'; // Projects
import MapIcon from '@mui/icons-material/Map'; // Plots
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LogoutIcon from '@mui/icons-material/Logout';

// ----------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItemConfig {
  title: string;
  path?: string;
  icon: React.ReactElement;
  children?: NavItemConfig[];
  info?: string; // e.g., notification badge
}

// Menu Structure Definition
const NAV_CONFIG: { subheader: string; items: NavItemConfig[] }[] = [
  {
    subheader: 'Overview',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
      { title: 'Projects', path: '/dashboard/projects', icon: <AccountTreeIcon /> },
      { title: 'Plot Management', path: '/dashboard/plots', icon: <MapIcon /> },
    ],
  },
  {
    subheader: 'Ecological Analysis',
    items: [
      {
        title: 'Analysis Tools',
        icon: <BarChartIcon />,
        children: [
          { title: 'Flora & Vegetation', path: '/dashboard/ecological-analysis/flora', icon: <ForestIcon fontSize="small" /> },
          { title: 'Fauna & Wildlife', path: '/dashboard/ecological-analysis/fauna', icon: <PetsIcon fontSize="small" /> },
          { title: 'Landscape Ecology', path: '/dashboard/ecological-analysis/landscape', icon: <LandscapeIcon fontSize="small" /> },
          { title: 'Data Analysis', path: '/dashboard/ecological-analysis/data-analysis', icon: <ScienceIcon fontSize="small" /> },
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
  isOpen: boolean; // Sidebar expanded state
  currentPath: string;
  onNavigate: (path: string) => void;
}) => {
  const theme = useTheme();
  const hasChildren = !!item.children;
  
  // Check active state (exact match or parent of active route)
  const isActive = item.path ? currentPath === item.path : false;
  const isChildActive = item.children?.some(child => child.path === currentPath);
  
  // Internal state for collapse/expand of submenus
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

  // Styles for "Gold Standard" look
  const activeStyle = {
    color: theme.palette.primary.main,
    bgcolor: alpha(theme.palette.primary.main, 0.08),
    fontWeight: 'bold',
    '& .icon': {
      color: theme.palette.primary.main,
    },
  };

  const baseStyle = {
    height: 48,
    position: 'relative',
    textTransform: 'capitalize',
    paddingLeft: theme.spacing(2 + level * 2), // Indent nested items
    paddingRight: theme.spacing(2.5),
    marginBottom: 0.5,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.secondary,
    '&:hover': {
      bgcolor: theme.palette.action.hover,
      color: theme.palette.text.primary,
      '& .icon': { color: theme.palette.text.primary },
    },
    transition: 'all 0.2s ease-in-out',
  };

  // If sidebar is collapsed (mini mode), we render a Tooltip instead of list item text
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
            mb: 1,
            ...(isActive || isChildActive ? activeStyle : {}),
          }}
        >
          <ListItemIcon
            className="icon"
            sx={{
              minWidth: 0,
              width: 24,
              height: 24,
              color: 'inherit',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
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
        <ListItemIcon
          className="icon"
          sx={{
            width: 24,
            height: 24,
            minWidth: 24,
            mr: 2,
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
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
        bgcolor: theme.palette.mode === 'light' ? '#F9FAFB' : '#1C2531', // Slight contrast from main content
        borderRight: `1px dashed ${theme.palette.divider}`,
      }}
    >
      {/* 1. Logo / Brand Area */}
      <Box sx={{ px: 2.5, py: 3, display: 'flex', alignItems: 'center' }}>
        {isOpen ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
             <Box 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'primary.main', 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.15)'
                }}
             >
               <ForestIcon fontSize="small" />
             </Box>
             <Box>
                <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2} color="text.primary">
                  EcoData
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  v2.0.0
                </Typography>
             </Box>
          </Box>
        ) : (
          <Box 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: 'primary.main', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              mx: 'auto',
              cursor: 'pointer'
            }}
            onClick={onToggle}
          >
            <ForestIcon fontSize="medium" />
          </Box>
        )}
      </Box>

      <Divider sx={{ borderStyle: 'dashed', mb: 1 }} />

      {/* 2. Navigation List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2 }}>
        {NAV_CONFIG.map((group) => (
          <List key={group.subheader} disablePadding sx={{ mb: 2 }}>
            {isOpen && (
              <Typography
                variant="overline"
                sx={{
                  px: 1,
                  mb: 1,
                  display: 'block',
                  color: theme.palette.text.disabled,
                  fontWeight: 700,
                  letterSpacing: 1.1,
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

      <Divider sx={{ borderStyle: 'dashed' }} />

      {/* 3. User / Footer Area */}
      <Box sx={{ p: 2 }}>
        {isOpen ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.2s',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: theme.palette.action.hover,
              },
            }}
          >
            <Avatar 
              src="/static/mock-images/avatars/avatar_default.jpg" 
              alt="User"
              sx={{ width: 36, height: 36, mr: 1.5 }}
            />
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap>
                Researcher Doe
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Lead Ecologist
              </Typography>
            </Box>
            <SettingsIcon fontSize="small" color="action" />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
             <Avatar sx={{ width: 36, height: 36, cursor: 'pointer' }} />
             <IconButton onClick={onToggle} size="small" sx={{ bgcolor: 'action.selected' }}>
                <ChevronLeftIcon sx={{ transform: 'rotate(180deg)' }} />
             </IconButton>
          </Box>
        )}
      </Box>
      
      {/* 4. Desktop Toggle Button (Only visible when open) */}
      {isOpen && !isMobile && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            right: -12, 
            zIndex: 100 
          }}
        >
          <IconButton 
            size="small" 
            onClick={onToggle}
            sx={{ 
              bgcolor: theme.palette.background.paper, 
              border: `1px dashed ${theme.palette.divider}`,
              boxShadow: theme.shadows[2],
              width: 24, 
              height: 24,
              '&:hover': { bgcolor: theme.palette.action.hover }
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
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
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          open={isOpen}
          onClose={onToggle}
          variant="temporary"
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              backgroundImage: 'none', // Remove default gradient if any
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        /* Desktop Drawer */
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
              overflow: 'visible', // Allow Toggle button to overflow
              bgcolor: 'transparent', // We handle bg in content
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