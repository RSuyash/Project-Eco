import { Box, Typography, Grid, Paper, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ForestIcon from '@mui/icons-material/Forest';
import BarChartIcon from '@mui/icons-material/BarChart';
import NatureIcon from '@mui/icons-material/Nature';
import FilterHdrIcon from '@mui/icons-material/FilterHdr';
import Breadcrumb from '../../components/Breadcrumb';

// Define the major categories of ecological tools
const categories = [
  {
    id: 'flora',
    title: 'Flora & Vegetation',
    description: 'Tools for plant surveys, vegetation analysis, and botanical studies',
    icon: ForestIcon,
    path: '/dashboard/ecological-analysis/flora',
  },
  {
    id: 'fauna',
    title: 'Fauna & Wildlife',
    description: 'Tools for animal surveys, biodiversity studies, and wildlife monitoring',
    icon: NatureIcon,
    path: '/dashboard/ecological-analysis/fauna',
  },
  {
    id: 'landscape',
    title: 'Landscape Ecology',
    description: 'Analysis tools for land use, habitat connectivity, and spatial patterns',
    icon: FilterHdrIcon,
    path: '/dashboard/ecological-analysis/landscape',
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis',
    description: 'Statistical tools, modeling, and analytical modules for ecological data',
    icon: BarChartIcon,
    path: '/dashboard/ecological-analysis/data-analysis',
  },
];

const EcologicalAnalysisPage = () => {
  return (
    <Box sx={{ 
      backgroundColor: 'background.default',
      minHeight: '100vh',
      pb: 4
    }}>
      <Breadcrumb />
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        {/* Header Area */}
        <Box sx={{ 
          mb: 6,
          textAlign: 'center',
          py: 4
        }}>
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 700,
              mb: 2,
              color: 'primary.main',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Ecological Analysis
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.2rem' },
              lineHeight: 1.6
            }}
          >
            Major categories of ecological analysis tools and modules. Explore our comprehensive suite of tools designed for environmental research and monitoring.
          </Typography>
        </Box>

        {/* Category Grid */}
        <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={6} 
                lg={3} 
                key={category.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <RouterLink 
                  to={category.path} 
                  style={{ 
                    textDecoration: 'none',
                    display: 'block',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <Paper 
                    sx={{ 
                      p: { xs: 2.5, md: 3.5 },
                      height: { xs: '220px', md: '260px' },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        backgroundColor: 'primary.main',
                        transform: 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: 'transform 0.3s ease',
                      },
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                        '&:before': {
                          transform: 'scaleX(1)',
                        },
                      },
                      '&:hover .icon-container': {
                        backgroundColor: 'primary.main',
                        transform: 'scale(1.1)',
                        '& svg': {
                          color: 'primary.contrastText',
                        }
                      },
                      '&:hover .title': {
                        color: 'primary.main',
                      }
                    }}
                  >
                    <Box 
                      className="icon-container"
                      sx={{ 
                        width: { xs: 64, md: 72 }, 
                        height: { xs: 64, md: 72 }, 
                        bgcolor: 'primary.light', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 2,
                        transition: 'all 0.3s ease',
                        mr: 0 // Reset margin since it's centered
                      }}
                    >
                      <IconComponent 
                        sx={{ 
                          fontSize: { xs: 32, md: 36 }, 
                          color: 'primary.main',
                          transition: 'all 0.3s ease'
                        }} 
                      />
                    </Box>
                    <Typography 
                      className="title"
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 1,
                        transition: 'color 0.3s ease',
                        fontSize: { xs: '1.1rem', md: '1.2rem' }
                      }}
                    >
                      {category.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        lineHeight: 1.5
                      }}
                    >
                      {category.description}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="primary" 
                      sx={{ 
                        mt: 1, 
                        fontWeight: 600,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        '&:hover': {
                          opacity: 1,
                        },
                        fontSize: { xs: '0.9rem', md: '1rem' }
                      }}
                    >
                      Explore →
                    </Typography>
                  </Paper>
                </RouterLink>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default EcologicalAnalysisPage;