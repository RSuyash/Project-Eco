import { Box, Typography, Grid, Paper, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import PsychologyIcon from '@mui/icons-material/Psychology';
import NatureIcon from '@mui/icons-material/Nature';
import BugReportIcon from '@mui/icons-material/BugReport'; // Example icon for a tool
import Breadcrumb from '../../../components/Breadcrumb';

// Define the fauna tools
const faunaTools = [
  {
    name: 'Bird Monitoring',
    icon: PetsIcon,
    path: '/dashboard/ecological-analysis/bird-monitoring',
  },
  {
    name: 'Bat Survey',
    icon: BugReportIcon, // Using BugReportIcon for bat survey
    path: '/dashboard/ecological-analysis/bat-survey',
  },
  {
    name: 'Mammal Tracking',
    icon: NatureIcon,
    path: '/dashboard/ecological-analysis/mammal-tracking',
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

const FaunaPage = () => {
  const CategoryIcon = NatureIcon; // Main icon for Fauna & Wildlife

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
              Fauna & Wildlife Tools
            </Typography>
          </Box>

          {/* Grid of Fauna Tools */}
          <Grid container spacing={3} justifyContent="flex-start">
            {faunaTools.map((tool) => (
              <ToolCard key={tool.name} {...tool} />
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default FaunaPage;