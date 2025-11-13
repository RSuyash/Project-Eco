import { Box, Typography, Grid, Paper, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import InsightsIcon from '@mui/icons-material/Insights';
import FunctionsIcon from '@mui/icons-material/Functions'; // Example icon for a tool
import ModelTrainingIcon from '@mui/icons-material/ModelTraining'; // Example icon for a tool
import Breadcrumb from '../../../components/Breadcrumb';

// Define the data analysis tools
const dataAnalysisTools = [
  {
    name: 'Statistical Analysis',
    icon: BarChartIcon,
    path: '/dashboard/ecological-analysis/statistical-analysis',
  },
  {
    name: 'Ecological Modeling',
    icon: AutoGraphIcon,
    path: '/dashboard/ecological-analysis/modeling',
  },
  {
    name: 'Data Reporting',
    icon: InsightsIcon,
    path: '/dashboard/ecological-analysis/reporting',
  },
  {
    name: 'Diversity Indices',
    icon: FunctionsIcon,
    path: '/dashboard/ecological-analysis/data-analysis',
  },
  {
    name: 'Statistical Modeling',
    icon: ModelTrainingIcon,
    path: '/dashboard/ecological-analysis/data-analysis',
  },
];

// Re-using the ToolCard component structure
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

const DataAnalysisPage = () => {
  const CategoryIcon = BarChartIcon; // Main icon for Data Analysis

  return (
    <Box>
      <Breadcrumb />
      <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
        <Box
          sx={{
            mb: 6,
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: '4px',
            boxShadow: 1,
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
                theme.palette.mode === 'dark' ? '#333842' : '#f0f0f0',
              borderRadius: '4px',
              boxShadow: 1,
            }}
          >
            <CategoryIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Data Analysis Tools
            </Typography>
          </Box>

          {/* Grid of Data Analysis Tools */}
          <Grid container spacing={3} justifyContent="flex-start">
            {dataAnalysisTools.map((tool) => (
              <ToolCard key={tool.name} {...tool} />
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default DataAnalysisPage;