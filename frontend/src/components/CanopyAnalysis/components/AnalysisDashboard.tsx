import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { useCanopyAnalysis } from '../context/CanopyAnalysisContext';
import { FileDownload, PictureAsPdf, Refresh } from '@mui/icons-material';
import { getCanopyAnalysisResults, runBatchCanopyAnalysis } from '../api/canopyAnalysisApi';
import { handleApiError } from '../utils/helpers';
import { CANOPY_ANALYSIS_CONFIG } from '../config';

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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
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
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const AnalysisDashboard: React.FC = () => {
  const { analysisResults, isAnalyzing, selectedPlotId, dispatch } = useCanopyAnalysis();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResults, setApiResults] = useState<any[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate summary statistics from context results
  const canopyCoverAvg = analysisResults.length > 0
    ? analysisResults.reduce((sum, result) => sum + result.results.canopy_cover_percent, 0) / analysisResults.length
    : 0;

  const laiAvg = analysisResults.length > 0
    ? analysisResults.reduce((sum, result) => sum + result.results.estimated_lai, 0) / analysisResults.length
    : 0;

  // Function to fetch canopy results from the backend
  const fetchCanopyResults = async () => {
    if (!selectedPlotId) return;

    setIsLoading(true);
    try {
      const results = await getCanopyAnalysisResults(selectedPlotId);
      setApiResults(results.data || []);
    } catch (error) {
      console.error('Error fetching canopy analysis results:', error);
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Run batch analysis
  const runBatchAnalysis = async () => {
    if (!selectedPlotId) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select a plot ID first' });
      return;
    }

    dispatch({ type: 'SET_ANALYZING', payload: true });
    try {
      await runBatchCanopyAnalysis({ plot_id: selectedPlotId });
      dispatch({ type: 'SET_ERROR', payload: 'Batch analysis initiated. Results will be available shortly.' });
    } catch (error) {
      console.error('Error running batch analysis:', error);
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  };

  useEffect(() => {
    // Only fetch results if selectedPlotId is valid
    if (selectedPlotId) {
      fetchCanopyResults();
    }
  }, [selectedPlotId]);

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Analysis Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={isLoading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={fetchCanopyResults}
            disabled={isLoading}
            sx={{ mr: 1 }}
          >
            Refresh Results
          </Button>
          <Button
            variant="contained"
            onClick={runBatchAnalysis}
            disabled={isAnalyzing}
          >
            Run Batch Analysis
          </Button>
        </Box>
      </Box>

      {isAnalyzing && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Analysis in progress...
          <LinearProgress sx={{ mt: 1 }} />
        </Alert>
      )}

      {analysisResults.length === 0 && apiResults.length === 0 ? (
        <Alert severity="info">
          No analysis results yet. Upload and analyze canopy images to see results here.
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Images Analyzed
                  </Typography>
                  <Typography variant="h4" component="div">
                    {analysisResults.length + apiResults.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Avg. Canopy Cover
                  </Typography>
                  <Typography variant="h4" component="div">
                    {((canopyCoverAvg * analysisResults.length +
                      (apiResults.length > 0
                        ? apiResults.reduce((sum, result) => sum + result.canopy_cover_percent, 0) / apiResults.length
                        : 0) * apiResults.length) /
                      (analysisResults.length + apiResults.length)).toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Avg. LAI
                  </Typography>
                  <Typography variant="h4" component="div">
                    {((laiAvg * analysisResults.length +
                      (apiResults.length > 0
                        ? apiResults.reduce((sum, result) => sum + result.estimated_lai, 0) / apiResults.length
                        : 0) * apiResults.length) /
                      (analysisResults.length + apiResults.length)).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
              <Tab label="Results Summary" {...a11yProps(0)} />
              <Tab label="Detailed Results" {...a11yProps(1)} />
            </Tabs>
          </Box>

          {/* Results Summary Tab */}
          <TabPanel value={tabValue} index={0}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {/* Context results */}
                {analysisResults.map((result, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`context-${index}`}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {result.filename}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Plot: {result.plot_id} | Quadrant: {result.quadrant_id}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Canopy Cover:</strong> {result.results.canopy_cover_percent}%
                        </Typography>
                        <Typography variant="body2">
                          <strong>LAI:</strong> {result.results.estimated_lai}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Gap Fraction:</strong> {result.results.gap_fraction}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          <Chip
                            label={`CC: ${result.results.canopy_cover_percent.toFixed(1)}%`}
                            size="small"
                            color="primary"
                          />
                          <Chip
                            label={`LAI: ${result.results.estimated_lai.toFixed(1)}`}
                            size="small"
                            color="secondary"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

                {/* API results */}
                {apiResults.map((result, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`api-${index}`}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {result.filename}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Plot: {result.plot_id}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Canopy Cover:</strong> {result.canopy_cover_percent}%
                        </Typography>
                        <Typography variant="body2">
                          <strong>LAI:</strong> {result.estimated_lai}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Gap Fraction:</strong> {result.gap_fraction}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          <Chip
                            label={`CC: ${result.canopy_cover_percent.toFixed(1)}%`}
                            size="small"
                            color="primary"
                          />
                          <Chip
                            label={`LAI: ${result.estimated_lai.toFixed(1)}`}
                            size="small"
                            color="secondary"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* Detailed Results Tab */}
          <TabPanel value={tabValue} index={1}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Filename</TableCell>
                      <TableCell>Plot ID</TableCell>
                      <TableCell>Quadrant ID</TableCell>
                      <TableCell>Canopy Cover (%)</TableCell>
                      <TableCell>LAI</TableCell>
                      <TableCell>Gap Fraction</TableCell>
                      <TableCell>Source</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Context results */}
                    {analysisResults.map((result, index) => (
                      <TableRow key={`context-${index}`}>
                        <TableCell component="th" scope="row">
                          {result.filename}
                        </TableCell>
                        <TableCell>{result.plot_id}</TableCell>
                        <TableCell>{result.quadrant_id}</TableCell>
                        <TableCell>{result.results.canopy_cover_percent.toFixed(2)}%</TableCell>
                        <TableCell>{result.results.estimated_lai.toFixed(2)}</TableCell>
                        <TableCell>{result.results.gap_fraction.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip label="Local" size="small" color="primary" />
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* API results */}
                    {apiResults.map((result, index) => (
                      <TableRow key={`api-${index}`}>
                        <TableCell component="th" scope="row">
                          {result.filename}
                        </TableCell>
                        <TableCell>{result.plot_id}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>{result.canopy_cover_percent.toFixed(2)}%</TableCell>
                        <TableCell>{result.estimated_lai.toFixed(2)}</TableCell>
                        <TableCell>{result.gap_fraction.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip label="Server" size="small" color="secondary" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </>
      )}
    </Paper>
  );
};

export default AnalysisDashboard;