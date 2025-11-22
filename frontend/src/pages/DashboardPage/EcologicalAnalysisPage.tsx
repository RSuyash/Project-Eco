import { Box, Typography, Grid, Paper, Container, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ForestIcon from '@mui/icons-material/Forest';
import BarChartIcon from '@mui/icons-material/BarChart';
import NatureIcon from '@mui/icons-material/Nature';
import FilterHdrIcon from '@mui/icons-material/FilterHdr';
import GrassIcon from '@mui/icons-material/Grass';
import TimelineIcon from '@mui/icons-material/Timeline';
import PetsIcon from '@mui/icons-material/Pets';
import BugReportIcon from '@mui/icons-material/BugReport';
import MapIcon from '@mui/icons-material/Map';
import GrainIcon from '@mui/icons-material/Grain';
import FunctionsIcon from '@mui/icons-material/Functions';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import Breadcrumb from '../../components/Breadcrumb';

const toolSections = [
  {
    category: 'Flora & Vegetation',
    categoryIcon: ForestIcon,
    tools: [
      { name: 'Vegetation Plotting', icon: GrassIcon, path: '/dashboard/ecological-analysis/vegetation-plotting' },
      { name: 'Species Area Curve', icon: TimelineIcon, path: '/dashboard/ecological-analysis/species-area-curve' },
    ],
  },
  {
    category: 'Fauna & Wildlife',
    categoryIcon: NatureIcon,
    tools: [
      { name: 'Bird Monitoring', icon: PetsIcon, path: '/dashboard/ecological-analysis/bird-monitoring' },
      { name: 'Bat Survey', icon: BugReportIcon, path: '/dashboard/ecological-analysis/bat-survey' },
    ],
  },
  {
    category: 'Landscape Ecology',
    categoryIcon: FilterHdrIcon,
    tools: [
      { name: 'Habitat Analysis', icon: MapIcon, path: '/dashboard/ecological-analysis/landscape' },
      { name: 'Spatial Patterns', icon: GrainIcon, path: '/dashboard/ecological-analysis/landscape' },
    ],
  },
  {
    category: 'Data Analysis',
    categoryIcon: BarChartIcon,
    tools: [
      { name: 'Diversity Indices', icon: FunctionsIcon, path: '/dashboard/ecological-analysis/data-analysis' },
      { name: 'Statistical Modeling', icon: ModelTrainingIcon, path: '/dashboard/ecological-analysis/data-analysis' },
    ],
  },
];

const ToolCard = ({ name, icon: Icon, path }: { name: string; icon: React.ElementType; path: string }) => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <RouterLink to={path} style={{ textDecoration: 'none', width: '100%' }}>
      <Paper
        sx={{
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 140,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
            cursor: 'pointer',
            '& .tool-icon': {
              color: 'primary.main',
            },
          },
        }}
      >
        <Icon className="tool-icon" sx={{ fontSize: 40, mb: 1.5, color: 'text.secondary', transition: 'color 0.2s' }} />
        <Typography variant="subtitle1" align="center" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {name}
        </Typography>
      </Paper>
    </RouterLink>
  </Grid>
);

const EcologicalAnalysisPage = () => {
  return (
    <Box>
      <Breadcrumb />
      <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
        {toolSections.map((section) => {
          const CategoryIcon = section.categoryIcon;
          return (
            <Box
              key={section.category}
              sx={{
                mb: 6,
                p: 3, // Add some padding around the entire section
                backgroundColor: 'background.paper', // Solid background for the section
                borderRadius: '4px', // Subtle curves for the section container
                boxShadow: 1, // Subtle shadow
              }}
            >
              {/* Section Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderLeft: (theme) => `5px solid ${theme.palette.primary.main}`,
                  mb: 3,
                  pl: 2,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? '#333842' : '#f0f0f0', // Slightly different shade
                  borderRadius: '4px', // Match section's border radius
                  boxShadow: 1, // Subtle shadow for the header
                }}
              >
                <CategoryIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {section.category}
                </Typography>
              </Box>

              {/* Existing Grid of Tool Cards */}
              <Grid container spacing={3} justifyContent="flex-start">
                {section.tools.map((tool) => (
                  <ToolCard key={tool.name} {...tool} />
                ))}
              </Grid>
            </Box>
          );
        })}
      </Container>
    </Box>
  );
};

export default EcologicalAnalysisPage;