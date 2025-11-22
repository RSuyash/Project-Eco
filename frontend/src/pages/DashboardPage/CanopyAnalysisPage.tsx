// src/pages/DashboardPage/CanopyAnalysisPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  LinearProgress,
  Button,
  Tabs,
  Tab,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import { getProjectById } from '../../services/dbService';
import { CanopyAnalysisProvider } from '../../components/CanopyAnalysis/context/CanopyAnalysisContext';
import ImageUpload from '../../components/CanopyAnalysis/components/ImageUpload';
import AnalysisDashboard from '../../components/CanopyAnalysis/components/AnalysisDashboard';
import AnalysisResults from '../../components/CanopyAnalysis/components/AnalysisResults';
import {
  PictureAsPdf as PictureAsPdfIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';

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
  lastSynced?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`canopy-analysis-tabpanel-${index}`}
      aria-labelledby={`canopy-analysis-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `canopy-analysis-tab-${index}`,
    'aria-controls': `canopy-analysis-tabpanel-${index}`,
  };
}

const CanopyAnalysisPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Workbench, 1: Results
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  // Load project data from IndexedDB
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const dbProject = await getProjectById(id!);
        if (dbProject) {
          setProject(dbProject);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProject();
    }
  }, [id]);

  // Export handlers
  const handleExportPdf = () => {
    showSnackbar('PDF export started', 'info');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleExportCsv = () => {
    showSnackbar('CSV export started', 'info');
  };

  const handleSaveToProject = () => {
    showSnackbar('Analysis results saved to project', 'success');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Normalize the project ID to make sure it matches expected format
  const normalizedProjectId = id ? (id.startsWith('proj_') ? id.replace('proj_', 'Plot-') : id) : '';

  return (
    <CanopyAnalysisProvider projectId={normalizedProjectId}>
      <Box>
        <Breadcrumb />
        <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
          {loading && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Loading canopy analysis...
              </Typography>
              <LinearProgress />
            </Paper>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {!loading && project && (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 200px)' }}>
              {/* Configuration and Main Content Area */}
              <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Configuration Sidebar */}
                <Box sx={{
                  width: '30%',
                  minWidth: '300px',
                  backgroundColor: '#f9f9f9',
                  borderRight: '1px solid #e0e0e0',
                  overflowY: 'auto',
                  padding: 2,
                  maxHeight: 'calc(100vh - 170px)' // Account for header and other elements
                }}>
                  <Typography variant="h6" gutterBottom>
                    Analysis Configuration
                  </Typography>

                  {/* Data Sources Section */}
                  <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Project Details
                    </Typography>
                    <Typography variant="body2">
                      <strong>Project:</strong> {project.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Description:</strong> {project.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Status:</strong> {project.status}
                    </Typography>
                  </Paper>
                </Box>

                {/* Main Content Area */}
                <Box sx={{
                  width: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  padding: 2
                }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="canopy analysis tabs">
                      <Tab label="Upload & Analyze" {...a11yProps(0)} />
                      <Tab label="Results Dashboard" {...a11yProps(1)} />
                    </Tabs>
                  </Box>

                  <TabPanel value={activeTab} index={0}>
                    <Paper sx={{ p: 2, overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                      <Typography variant="h6" gutterBottom>
                        Canopy Analysis Workbench
                      </Typography>
                      <ImageUpload />
                      <AnalysisDashboard />
                    </Paper>
                  </TabPanel>

                  <TabPanel value={activeTab} index={1}>
                    <AnalysisResults />
                  </TabPanel>
                </Box>
              </Box>
            </Box>
          )}

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <MuiAlert
              onClose={handleCloseSnackbar}
              severity={snackbarSeverity}
              sx={{ width: '100%' }}
            >
              {snackbarMessage}
            </MuiAlert>
          </Snackbar>
        </Container>
      </Box>
    </CanopyAnalysisProvider>
  );
};

export default CanopyAnalysisPage;