// src/components/CanopyCoverAnalyzer/CanopyCoverAnalyzer.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Tabs,
  Tab,
  Chip,
  Tooltip
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import { 
  CanopyCoverData, 
  CanopyCoverAnalysisResult 
} from '../../database/models/Plot';
import { 
  aggregateCanopyCoverByType,
  analyzeCanopyCoverAcrossPlots,
  getDominantCoverType,
  generateCanopyCoverSummary,
  formatCoverDataForVisualization,
  createComparativeCoverData,
  analyzeSubplotCover
} from '../../services/canopyCoverService';

interface CanopyCoverAnalyzerProps {
  canopyCoverData: CanopyCoverData[];
  plotIds: string[];
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
      id={`canopy-cover-tabpanel-${index}`}
      aria-labelledby={`canopy-cover-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `canopy-cover-tab-${index}`,
    'aria-controls': `canopy-cover-tabpanel-${index}`,
  };
}

const CanopyCoverAnalyzer: React.FC<CanopyCoverAnalyzerProps> = ({ 
  canopyCoverData, 
  plotIds 
}) => {
  const [selectedPlot, setSelectedPlot] = useState<string>('');
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('all');
  const [selectedSubplot, setSelectedSubplot] = useState<string>('all');
  const [analysisResults, setAnalysisResults] = useState<CanopyCoverAnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<CanopyCoverAnalysisResult | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [tabValue, setTabValue] = React.useState(0);

  // Initialize with first plot if available
  useEffect(() => {
    if (plotIds.length > 0 && !selectedPlot) {
      setSelectedPlot(plotIds[0]);
    }
  }, [plotIds, selectedPlot]);

  // Perform analysis when plot selection changes
  useEffect(() => {
    if (selectedPlot) {
      const results = analyzeCanopyCoverAcrossPlots(canopyCoverData, plotIds);
      setAnalysisResults(results);
      
      // Update summary
      setSummary(generateCanopyCoverSummary(results));
      
      // Update current analysis based on selections
      if (selectedSubplot && selectedSubplot !== 'all') {
        // Subplot analysis
        const subplotAnalyses = analyzeSubplotCover(
          canopyCoverData, 
          selectedPlot, 
          selectedQuadrant === 'all' ? 'Q1' : selectedQuadrant // Default to Q1 if all quadrants
        );
        // For now, take the first subplot result if it exists
        if (subplotAnalyses.length > 0) {
          setCurrentAnalysis(subplotAnalyses[0]);
        }
      } else if (selectedQuadrant && selectedQuadrant !== 'all') {
        // Quadrant analysis
        const quadrantResult = aggregateCanopyCoverByType(
          canopyCoverData, 
          selectedPlot, 
          selectedQuadrant
        );
        setCurrentAnalysis(quadrantResult);
      } else {
        // Plot level analysis
        const plotResult = results.find(r => r.plotId === selectedPlot) || null;
        setCurrentAnalysis(plotResult);
      }
    }
  }, [selectedPlot, selectedQuadrant, selectedSubplot, canopyCoverData, plotIds]);

  // Get available quadrants for the selected plot
  const getAvailableQuadrants = (): string[] => {
    if (!selectedPlot) return [];
    
    const quadrants = Array.from(
      new Set(
        canopyCoverData
          .filter(item => item.plotId === selectedPlot)
          .map(item => item.quadrantId)
      )
    );
    
    return ['all', ...quadrants];
  };

  // Get available subplots for the selected plot and quadrant
  const getAvailableSubplots = (): string[] => {
    if (!selectedPlot || !selectedQuadrant || selectedQuadrant === 'all') return [];
    
    const subplots = Array.from(
      new Set(
        canopyCoverData
          .filter(item => 
            item.plotId === selectedPlot && 
            item.quadrantId === selectedQuadrant
          )
          .map(item => item.subplotId)
      )
    );
    
    return ['all', ...subplots];
  };

  // Format data for visualization
  const formattedCoverData = currentAnalysis 
    ? formatCoverDataForVisualization(currentAnalysis)
    : [];
    
  const comparativeData = createComparativeCoverData(analysisResults);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Define colors for cover types
  const coverTypeColors: Record<string, string> = {
    'Herb': '#8BC34A',
    'Grass': '#4CAF50',
    'Shrub': '#795548',
    'Tree': '#388E3C',
    'Litter': '#5D4037',
    'Bare Soil': '#FFC107',
    'Other': '#9E9E9E'
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="canopy cover analysis tabs">
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Plot Analysis" {...a11yProps(1)} />
          <Tab label="Comparative View" {...a11yProps(2)} />
          <Tab label="Cover Composition" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Canopy Cover Summary
              </Typography>
              {summary ? (
                <Box>
                  <Typography>Total Plots Analyzed: {summary.totalPlots}</Typography>
                  <Typography>Average Total Cover: {summary.avgTotalCover}%</Typography>
                  <Typography>Dominant Cover Type: {summary.dominantCoverType}</Typography>
                  <Typography>Average Diversity Index: {summary.avgDiversityIndex}</Typography>
                  <Typography>Average Evenness: {summary.avgEvenness}</Typography>
                </Box>
              ) : (
                <Typography>No data available</Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Current Analysis
              </Typography>
              {currentAnalysis ? (
                <Box>
                  <Typography>Plot: {currentAnalysis.plotId}</Typography>
                  <Typography>
                    Quadrant: {currentAnalysis.quadrantId || 'All'} | 
                    Subplot: {currentAnalysis.subplotId || 'All'}
                  </Typography>
                  <Typography>Total Cover: {currentAnalysis.totalCoverPercentage}%</Typography>
                  <Typography>Dominant Type: {getDominantCoverType(currentAnalysis).type} ({getDominantCoverType(currentAnalysis).percentage}%)</Typography>
                  <Typography>Diversity Index: {currentAnalysis.diversityIndex?.toFixed(2) || 'N/A'}</Typography>
                  <Typography>Evenness: {currentAnalysis.evenness?.toFixed(2) || 'N/A'}</Typography>
                </Box>
              ) : (
                <Typography>Select a plot to analyze</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Plot</InputLabel>
              <Select
                value={selectedPlot}
                label="Plot"
                onChange={(e) => setSelectedPlot(e.target.value)}
              >
                {plotIds.map(plotId => (
                  <MenuItem key={plotId} value={plotId}>{plotId}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Quadrant</InputLabel>
              <Select
                value={selectedQuadrant}
                label="Quadrant"
                onChange={(e) => {
                  setSelectedQuadrant(e.target.value);
                  // Reset subplot selection when quadrant changes
                  setSelectedSubplot('all');
                }}
              >
                {getAvailableQuadrants().map(q => (
                  <MenuItem key={q} value={q}>
                    {q === 'all' ? 'All Quadrants' : q}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Subplot</InputLabel>
              <Select
                value={selectedSubplot}
                label="Subplot"
                onChange={(e) => setSelectedSubplot(e.target.value)}
                disabled={selectedQuadrant === 'all'}
              >
                {getAvailableSubplots().map(sp => (
                  <MenuItem key={sp} value={sp}>
                    {sp === 'all' ? 'All Subplots' : sp}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {currentAnalysis && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} component="div">
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cover Type Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={formattedCoverData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="value" name="Cover Percentage" fill="#8884d8">
                          {formattedCoverData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={coverTypeColors[entry.name] || '#8884d8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} component="div">
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cover Composition
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={formattedCoverData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {formattedCoverData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={coverTypeColors[entry.name] || '#8884d8'} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} component="div">
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cover Type Details
                  </Typography>
                  <Grid container spacing={2}>
                    {['herbCover', 'grassCover', 'shrubCover', 'treeCover', 'litterCover', 'bareSoilCover', 'otherCover'].map((coverType) => {
                      const coverValue = currentAnalysis[coverType as keyof CanopyCoverAnalysisResult];
                      const coverName = coverType.replace('Cover', '');
                      const coverDisplay = coverName.charAt(0).toUpperCase() + coverName.slice(1).replace(/([A-Z])/g, ' $1');

                      return (
                        <Grid item xs={12} sm={6} md={4} key={coverType} component="div">
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle1">{coverDisplay} Cover</Typography>
                            <Typography variant="h5" color="primary">
                              {typeof coverValue === 'number' ? coverValue.toFixed(2) : '0'}%
                            </Typography>
                            <Tooltip title="Percentage of area covered by this type">
                              <Chip
                                label={`${((coverValue as number) / currentAnalysis.totalCoverPercentage * 100 || 0).toFixed(1)}% of total`}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            </Tooltip>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Comparative Cover Analysis Across Plots
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={comparativeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="herb" name="Herb Cover" fill="#8BC34A" />
                  <Bar dataKey="grass" name="Grass Cover" fill="#4CAF50" />
                  <Bar dataKey="shrub" name="Shrub Cover" fill="#795548" />
                  <Bar dataKey="tree" name="Tree Cover" fill="#388E3C" />
                  <Line type="monotone" dataKey="total" name="Total Cover" stroke="#FF0000" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cover Type Composition
            </Typography>
            {analysisResults.length > 0 ? (
              <Grid container spacing={3}>
                {analysisResults.map((result, index) => {
                  const coverData = formatCoverDataForVisualization(result);
                  const dominant = getDominantCoverType(result);
                  
                  return (
                    <Grid item xs={12} md={6} lg={4} key={`${result.id}-${index}`}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" align="center" gutterBottom>
                          {result.plotId}
                        </Typography>
                        <Typography variant="subtitle2" align="center" color="textSecondary" gutterBottom>
                          Dominant: {dominant.type} ({dominant.percentage}%)
                        </Typography>
                        <Box sx={{ height: 200 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={coverData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {coverData.map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={coverTypeColors[entry.name] || '#8884d8'} />
                                ))}
                              </Pie>
                              <RechartsTooltip formatter={(value) => [`${value}%`, 'Cover']} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            Total Cover: {result.totalCoverPercentage.toFixed(2)}%
                          </Typography>
                          <Typography variant="body2">
                            Diversity: {result.diversityIndex?.toFixed(2) || 'N/A'}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography>No data available for composition analysis</Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default CanopyCoverAnalyzer;