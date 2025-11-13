import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Toolbar,
  Box,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ForestIcon from '@mui/icons-material/Forest';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import PetsIcon from '@mui/icons-material/Pets';
import WorkIcon from '@mui/icons-material/Work';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const drawerWidth = 240;

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ecologicalOpen, setEcologicalOpen] = useState(true);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      onToggle();
    }
  };

  const handleEcologicalClick = () => {
    setEcologicalOpen(!ecologicalOpen);
  };

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  // Check if we're on an ecological analysis subpage to highlight the parent
  const isEcologicalSubpage = location.pathname.includes('/dashboard/ecological-analysis');

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Prevent scrollbars
      }}
    >
      <Toolbar />
      <List
        sx={{
          flex: '1', // Take available space
          overflow: 'hidden', // Prevent scrollbars
        }}
      >
        <ListItem button={true} component={Link} to="/dashboard/ecological-analysis">
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Ecological Analysis" />
          <IconButton
            onClick={(e) => {
              e.preventDefault(); // Prevent link navigation when clicking expand icon
              handleEcologicalClick();
            }}
            size="small"
          >
            {ecologicalOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </ListItem>
        <Collapse in={ecologicalOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button={true} component={Link} to="/dashboard/ecological-analysis/flora" sx={{ pl: 4 }}>
              <ListItemIcon>
                <ForestIcon />
              </ListItemIcon>
              <ListItemText primary="Flora & Vegetation" />
            </ListItem>
            <ListItem button={true} component={Link} to="/dashboard/ecological-analysis/fauna" sx={{ pl: 4 }}>
              <ListItemIcon>
                <PetsIcon />
              </ListItemIcon>
              <ListItemText primary="Fauna & Wildlife" />
            </ListItem>
            <ListItem button={true} component={Link} to="/dashboard/ecological-analysis/landscape" sx={{ pl: 4 }}>
              <ListItemIcon>
                <AutoGraphIcon />
              </ListItemIcon>
              <ListItemText primary="Landscape Ecology" />
            </ListItem>
            <ListItem button={true} component={Link} to="/dashboard/ecological-analysis/data-analysis" sx={{ pl: 4 }}>
              <ListItemIcon>
                <AutoGraphIcon />
              </ListItemIcon>
              <ListItemText primary="Data Analysis" />
            </ListItem>
          </List>
        </Collapse>
        
                  <ListItem button={true} component={Link} to="/dashboard/projects">          <ListItemIcon>
            <WorkIcon />
          </ListItemIcon>
          <ListItemText primary="Projects" />
        </ListItem>
        
        <ListItem button={true} component={Link} to="/dashboard/plots">
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Plot Management" />
        </ListItem>
      </List>
      {isOpen && (
        <Box
          sx={{
            mt: 'auto',
            p: 1,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton onClick={onToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        open={isOpen}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isOpen ? drawerWidth : '64px',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden', // Hide any horizontal overflow
          },
        }}
      >
        {drawer}

        {/* Toggle button that appears when sidebar is collapsed */}
        {!isOpen && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: 0,
              zIndex: 1,
              backgroundColor: 'primary.main',
              borderRadius: '8px 0 0 8px',
              transform: 'translateY(-50%)',
              boxShadow: 3, // Add shadow for better visibility
            }}
          >
            <IconButton
              onClick={onToggle}
              sx={{
                color: 'white',
                padding: '8px',
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}
      </Drawer>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            overflowX: 'hidden', // Hide any horizontal overflow
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button={true} component={Link} to="/dashboard/ecological-analysis">
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Ecological Analysis" />
            <IconButton
              onClick={(e) => {
                e.preventDefault(); // Prevent link navigation when clicking expand icon
                handleEcologicalClick();
              }}
              size="small"
            >
              {ecologicalOpen ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </ListItem>
          <Collapse in={ecologicalOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button={true} component={Link} to="/dashboard/ecological-analysis/flora" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <ForestIcon />
                </ListItemIcon>
                <ListItemText primary="Flora & Vegetation" />
              </ListItem>
              <ListItem button={true} component={Link} to="/dashboard/ecological-analysis/fauna" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <PetsIcon />
                </ListItemIcon>
                <ListItemText primary="Fauna & Wildlife" />
              </ListItem>
              <ListItem button={true} component={Link} to="/dashboard/ecological-analysis/landscape" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <AutoGraphIcon />
                </ListItemIcon>
                <ListItemText primary="Landscape Ecology" />
              </ListItem>
              <ListItem button={true} component={Link} to="/dashboard/ecological-analysis/data-analysis" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <AutoGraphIcon />
                </ListItemIcon>
                <ListItemText primary="Data Analysis" />
              </ListItem>
            </List>
          </Collapse>
          
        <ListItem button={true} component={Link} to="/dashboard/projects">
            <ListItemIcon>
              <WorkIcon />
            </ListItemIcon>
            <ListItemText primary="Projects" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;