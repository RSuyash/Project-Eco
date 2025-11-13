// src/pages/DashboardPage/CanopyAnalysisPage.tsx

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel
} from '@mui/x-data-grid';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import { getProjectById } from '../../services/dbService';
import { readCSVFile, parseCSVData } from '../../services/dataImportService';
import {
  processHerbFloorVegetationData
} from '../../services/fieldDataService';
import { CanopyPhotoAnalyzer } from '../../components/CanopyPhotoAnalyzer';
import { CanopyCoverAnalyzer } from '../../components/CanopyCoverAnalyzer';
import { CanopyAnalysisVisualization } from '../../components/CanopyAnalysisVisualization';
import { CanopyPhotoAnalysis, CanopyCoverData } from '../../database/models/Plot';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  PictureAsPdf as PictureAsPdfIcon,
  FileDownload as FileDownloadIcon
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
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [woodyData, setWoodyData] = useState<any[]>([]);
  const [herbFloorData, setHerbFloorData] = useState<any[]>([]);
  const [canopyCoverData, setCanopyCoverData] = useState<CanopyCoverData[]>([]);
  const [canopyPhotoAnalyses, setCanopyPhotoAnalyses] = useState<CanopyPhotoAnalysis[]>([]);

  // New state for enhanced workflow
  const [activeStep, setActiveStep] = useState(0);
  const [csvDataUploaded, setCsvDataUploaded] = useState(false);
  const [imageDataUploaded, setImageDataUploaded] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvColumns, setCsvColumns] = useState<GridColDef[]>([]);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [helpPanelOpen, setHelpPanelOpen] = useState(true);
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

  // Load vegetation data when project is loaded
  useEffect(() => {
    const loadVegetationData = async () => {
      if (!project) return;

      try {
        setLoading(true);
        
        const woodyCsvText = await readCSVFile('/vegetation-plotting/field-data/woody_vegetation.csv');
        const herbFloorCsvText = await readCSVFile('/vegetation-plotting/field-data/herb_floor_vegetation.csv');
        
        const { canopyCoverData: processedCanopyData } = await processHerbFloorVegetationData(herbFloorCsvText);
        
        setWoodyData(parseCSVData(woodyCsvText));
        setHerbFloorData(parseCSVData(herbFloorCsvText));
        setCanopyCoverData(processedCanopyData);
      } catch (err) {
        console.error('Error loading vegetation data:', err);
        setError('Failed to load vegetation data');
      } finally {
        setLoading(false);
      }
    };

    if (project) {
      loadVegetationData();
    }
  }, [project]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const plotIds = Array.from(
    new Set([
      ...woodyData.map(row => row.Plot_ID).filter(Boolean),
      ...herbFloorData.map(row => row.Plot_ID).filter(Boolean)
    ])
  );

  const handleNewAnalysis = (analysis: CanopyPhotoAnalysis) => {
    setCanopyPhotoAnalyses(prev => [...prev, analysis]);
  };

  const woodyColumns: GridColDef[] = woodyData.length > 0 ? Object.keys(woodyData[0]).map(key => ({
    field: key,
    headerName: key,
    width: 150,
  })) : [];

  const herbFloorColumns: GridColDef[] = herbFloorData.length > 0 ? Object.keys(herbFloorData[0]).map(key => ({
    field: key,
    headerName: key,
    width: 150,
  })) : [];

  return (
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
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Canopy Analysis - {project.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Analyze canopy coverage and vegetation structure for this project
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/dashboard/projects/${id}/view`)}
              >
                Back to Project
              </Button>
            </Box>

            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 'medium'
                  }
                }}
              >
                <Tab label="Field Data Visualization" {...a11yProps(0)} />
                <Tab label="Photo Analysis" {...a11yProps(1)} />
                <Tab label="Canopy Cover Analysis" {...a11yProps(2)} />
                <Tab label="Results & Visualization" {...a11yProps(3)} />
              </Tabs>
            </Paper>

            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, height: 600, width: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Woody Vegetation Data
                    </Typography>
                    <DataGrid
                      rows={woodyData.map((row, index) => ({ id: index, ...row }))}
                      columns={woodyColumns}
                      initialState={{
                        pagination: {
                          paginationModel: {
                            pageSize: 10,
                          },
                        },
                      }}
                      pageSizeOptions={[10]}
                      checkboxSelection
                      disableRowSelectionOnClick
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, height: 600, width: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Herb/Floor Vegetation Data
                    </Typography>
                    <DataGrid
                      rows={herbFloorData.map((row, index) => ({ id: index, ...row }))}
                      columns={herbFloorColumns}
                      initialState={{
                        pagination: {
                          paginationModel: {
                            pageSize: 10,
                          },
                        },
                      }}
                      pageSizeOptions={[10]}
                      checkboxSelection
                      disableRowSelectionOnClick
                    />
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <CanopyPhotoAnalyzer 
                plotIds={plotIds} 
                onAnalysisComplete={handleNewAnalysis}
                existingAnalyses={canopyPhotoAnalyses}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              {canopyCoverData.length > 0 ? (
                <CanopyCoverAnalyzer 
                  canopyCoverData={canopyCoverData} 
                  plotIds={plotIds} 
                />
              ) : (
                <Alert severity="info">
                  No canopy cover data available. Please import field data first.
                </Alert>
              )}
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              {canopyPhotoAnalyses.length > 0 ? (
                <CanopyAnalysisVisualization analyses={canopyPhotoAnalyses} />
              ) : (
                <Alert severity="info">
                  No canopy analysis results available. Upload and analyze canopy photos to see visualizations.
                </Alert>
              )}
            </TabPanel>
          </>
        )}
      </Container>
    </Box>
  );
};

export default CanopyAnalysisPage;
