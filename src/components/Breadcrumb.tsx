import React from 'react';
import { Typography, Link, Box, Breadcrumbs as MuiBreadcrumbs } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { styled } from '@mui/material/styles';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  homeLabel?: string;
  separator?: string | React.ReactNode;
}

const StyledBreadcrumbs = styled(MuiBreadcrumbs)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  '& .MuiBreadcrumbs-separator': {
    color: theme.palette.text.secondary,
  },
}));

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items = [], 
  homeLabel = 'Home', 
  separator = '/' 
}) => {
  const location = useLocation();
  
  // Generate breadcrumbs automatically if no items are provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs: BreadcrumbItem[] = [{ label: homeLabel, path: '/' }];
    
    // Add dashboard as the next level
    if (pathnames.includes('dashboard')) {
      breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });
    }
    
    // Add ecological analysis if present in path
    if (pathnames.includes('ecological-analysis')) {
      breadcrumbs.push({ label: 'Ecological Analysis', path: '/dashboard/ecological-analysis' });
    }
    
    // Map remaining path segments to labels
    let currentPath = '';
    pathnames.forEach((pathname, index) => {
      currentPath += `/${pathname}`;
      if (pathname !== 'dashboard' && pathname !== 'ecological-analysis') {
        // Convert kebab-case to proper case
        const label = pathname
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        breadcrumbs.push({ label, path: currentPath });
      }
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = items.length > 0 ? items : generateBreadcrumbs();

  return (
    <Box sx={{ px: 3 }}>
      <StyledBreadcrumbs separator={separator} aria-label="breadcrumb">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return isLast ? (
            <Typography 
              key={index} 
              color="text.primary" 
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {item.label}
            </Typography>
          ) : (
            <Link
              key={index}
              component={RouterLink}
              to={item.path || '#'}
              color="inherit"
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {index === 0 ? <HomeIcon fontSize="small" /> : item.label}
            </Link>
          );
        })}
      </StyledBreadcrumbs>
    </Box>
  );
};

export default Breadcrumb;