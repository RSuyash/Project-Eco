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
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { useCanopyAnalysis } from '../context/CanopyAnalysisContext';
import { ExpandMore, FileDownload, PictureAsPdf } from '@mui/icons-material';
import { getCanopyAnalysisResults, runFullPipeline } from '../api/canopyAnalysisApi';
import { resultsToCsv, downloadCsv, generateTimestampedFilename } from '../utils/helpers';
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
      id={`results-tabpanel-${index}`}
      aria-labelledby={`results-tab-${index}`}
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
    id: `results-tab-${index}`,
    'aria-controls': `results-tabpanel-${index}`,
  };
}

const AnalysisResults: React.FC = () => {
  const { analysisResults, selectedPlotId, dispatch } = useCanopyAnalysis();
  const [tabValue, setTabValue] = useState(0);
  const [expandedImage, setExpandedImage] = useState<{ type: string; data: string } | null>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Function to fetch canopy results from the backend
  const fetchCanopyResults = async () => {
    if (!selectedPlotId) return;
    
    setIsLoading(true);
    try {
      const results = await getCanopyAnalysisResults(selectedPlotId);
      setApiResults(results.data || []);
    } catch (error) {
      console.error('Error fetching canopy analysis results:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load canopy analysis results from server' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export format change
  const handleExportFormatChange = (event: SelectChangeEvent<string>) => {
    setExportFormat(event.target.value as string);
  };

  // Handle data export
  const handleExport = async () => {
    if (exportFormat === 'csv') {
      // Combine both local and API results for CSV export
      const allResults = [
        ...analysisResults.map(result => ({
          filename: result.filename,
          plot_id: result.plot_id,
          quadrant_id: result.quadrant_id,
          canopy_cover_percent: result.results.canopy_cover_percent,
          estimated_lai: result.results.estimated_lai,
          gap_fraction: result.results.gap_fraction,
          source: 'Local'
        })),
        ...apiResults.map(result => ({
          filename: result.filename,
          plot_id: result.plot_id,
          quadrant_id: '-',
          canopy_cover_percent: result.canopy_cover_percent,
          estimated_lai: result.estimated_lai,
          gap_fraction: result.gap_fraction,
          source: 'Server'
        }))
      ];

      if (allResults.length === 0) {
        dispatch({ type: 'SET_ERROR', payload: 'No data available for export' });
        return;
      }

      const csvContent = resultsToCsv(allResults);
      const filename = generateTimestampedFilename('canopy_analysis_results', 'csv');
      downloadCsv(csvContent, filename);
    } else if (exportFormat === 'pdf') {
      // In a real implementation, this would generate a PDF report
      console.log('PDF export functionality');
      alert('PDF report generation would be implemented here');
    }
  };

  // Run the full pipeline
  const handleRunFullPipeline = async () => {
    dispatch({ type: 'SET_ANALYZING', payload: true });
    try {
      await runFullPipeline();
      dispatch({ type: 'SET_ERROR', payload: 'Full pipeline initiated. Results will be available shortly.' });
    } catch (error) {
      console.error('Error running full pipeline:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initiate full pipeline' });
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  };

  const handleImageClick = (type: string, imageData: string, index: number) => {
    setExpandedImage({ type, data: `data:image/jpeg;base64,${imageData}` });
    setSelectedResultIndex(index);
  };

  const handleCloseDialog = () => {
    setExpandedImage(null);
    setSelectedResultIndex(null);
  };

  useEffect(() => {
    // Fetch results when component mounts
    fetchCanopyResults();
  }, [selectedPlotId]);

  if (analysisResults.length === 0 && apiResults.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          No analysis results available. Please upload and analyze canopy images first.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Analysis Results
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="results tabs">
          <Tab label="Visual Results" {...a11yProps(0)} />
          <Tab label="Data Export" {...a11yProps(1)} />
        </Tabs>
      </Box>

      {/* Visual Results Tab */}
      <TabPanel value={tabValue} index={0}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Local Analysis Results */}
            {analysisResults.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Local Analysis Results
                </Typography>
                {analysisResults.map((result, index) => (
                  <Accordion key={`local-${index}`} sx={{ mb: 2 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      aria-controls={`local-panel${index}-content`}
                      id={`local-panel${index}-header`}
                    >
                      <Typography variant="h6">
                        {result.filename} - {result.plot_id} ({result.quadrant_id})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Original Image
                              </Typography>
                              <img
                                src={`data:image/jpeg;base64,${result.images.original}`}
                                alt="Original"
                                onClick={() => handleImageClick('Original', result.images.original, index)}
                                style={{ 
                                  cursor: 'pointer',
                                  maxHeight: 300,
                                  width: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Binary Mask
                              </Typography>
                              <img
                                src={`data:image/jpeg;base64,${result.images.binary_mask}`}
                                alt="Binary Mask"
                                onClick={() => handleImageClick('Binary Mask', result.images.binary_mask, index)}
                                style={{ 
                                  cursor: 'pointer',
                                  maxHeight: 300,
                                  width: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Analysis Result
                              </Typography>
                              <img
                                src={`data:image/jpeg;base64,${result.images.analysis_image}`}
                                alt="Analysis Result"
                                onClick={() => handleImageClick('Analysis Result', result.images.analysis_image, index)}
                                style={{ 
                                  cursor: 'pointer',
                                  maxHeight: 300,
                                  width: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Analysis Metrics
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                  <Chip 
                                    label={`Canopy Cover: ${result.results.canopy_cover_percent.toFixed(2)}%`} 
                                    color="primary" 
                                    sx={{ m: 0.5 }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Chip 
                                    label={`Estimated LAI: ${result.results.estimated_lai.toFixed(2)}`} 
                                    color="secondary" 
                                    sx={{ m: 0.5 }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Chip 
                                    label={`Gap Fraction: ${result.results.gap_fraction.toFixed(2)}`} 
                                    color="default" 
                                    sx={{ m: 0.5 }}
                                  />
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}

            {/* API Results */}
            {apiResults.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Server Analysis Results
                </Typography>
                {apiResults.map((result, index) => (
                  <Accordion key={`server-${index}`} sx={{ mb: 2 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      aria-controls={`server-panel${index}-content`}
                      id={`server-panel${index}-header`}
                    >
                      <Typography variant="h6">
                        {result.filename} - {result.plot_id}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Analysis Metrics
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                  <Chip 
                                    label={`Canopy Cover: ${result.canopy_cover_percent.toFixed(2)}%`} 
                                    color="primary" 
                                    sx={{ m: 0.5 }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Chip 
                                    label={`Estimated LAI: ${result.estimated_lai.toFixed(2)}`} 
                                    color="secondary" 
                                    sx={{ m: 0.5 }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Chip 
                                    label={`Gap Fraction: ${result.gap_fraction.toFixed(2)}`} 
                                    color="default" 
                                    sx={{ m: 0.5 }}
                                  />
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </>
        )}
      </TabPanel>

      {/* Data Export Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Export Options
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
            <FormControl fullWidth variant="outlined" sx={{ maxWidth: 200 }}>
              <InputLabel id="export-format-label">Format</InputLabel>
              <Select
                labelId="export-format-label"
                value={exportFormat}
                onChange={handleExportFormatChange}
                label="Format"
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="pdf">PDF Report</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={exportFormat === 'csv' ? <FileDownload /> : <PictureAsPdf />}
              onClick={handleExport}
            >
              Export {exportFormat.toUpperCase()}
            </Button>
            <Button
              variant="outlined"
              onClick={handleRunFullPipeline}
            >
              Run Full Pipeline
            </Button>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom>
          Raw Analysis Data
        </Typography>
        <TableContainer>
          <Table size="small">
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
      </TabPanel>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!expandedImage}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedResultIndex !== null && (
            <>
              {analysisResults[selectedResultIndex].filename} - {expandedImage?.type}
              <Typography variant="body2" color="text.secondary">
                {analysisResults[selectedResultIndex].plot_id} ({analysisResults[selectedResultIndex].quadrant_id})
              </Typography>
            </>
          )}
        </DialogTitle>
        <DialogContent>
          {expandedImage && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={expandedImage.data}
                alt="Expanded view"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              {selectedResultIndex !== null && (
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={`Canopy Cover: ${analysisResults[selectedResultIndex].results.canopy_cover_percent.toFixed(2)}%`} 
                    color="primary" 
                    sx={{ m: 0.5 }}
                  />
                  <Chip 
                    label={`LAI: ${analysisResults[selectedResultIndex].results.estimated_lai.toFixed(2)}`} 
                    color="secondary" 
                    sx={{ m: 0.5 }}
                  />
                  <Chip 
                    label={`Gap Fraction: ${analysisResults[selectedResultIndex].results.gap_fraction.toFixed(2)}`} 
                    color="default" 
                    sx={{ m: 0.5 }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AnalysisResults;