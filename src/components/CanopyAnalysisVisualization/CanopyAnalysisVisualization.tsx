// src/components/CanopyAnalysisVisualization/CanopyAnalysisVisualization.tsx

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CanopyPhotoAnalysis } from '../../database/models/Plot';
import { calculateCanopyStatistics } from '../../services/canopyAnalysisService';

interface CanopyAnalysisVisualizationProps {
  analyses: CanopyPhotoAnalysis[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CanopyAnalysisVisualization: React.FC<CanopyAnalysisVisualizationProps> = ({ analyses }) => {
  const stats = calculateCanopyStatistics(analyses);

  // Prepare data for charts
  const plotData = analyses.reduce((acc, analysis) => {
    const existingPlot = acc.find(item => item.plotId === analysis.plotId);
    if (existingPlot) {
      existingPlot.canopyCoverValues.push(analysis.canopyCoverPercentage);
      existingPlot.laiValues.push(analysis.estimatedLAI);
    } else {
      acc.push({
        plotId: analysis.plotId,
        canopyCoverValues: [analysis.canopyCoverPercentage],
        laiValues: [analysis.estimatedLAI]
      });
    }
    return acc;
  }, [] as Array<{ plotId: string; canopyCoverValues: number[]; laiValues: number[] }>);

  // Calculate averages for each plot
  const plotAvgData = plotData.map(plot => ({
    plotId: plot.plotId,
    avgCanopyCover: plot.canopyCoverValues.reduce((sum, val) => sum + val, 0) / plot.canopyCoverValues.length,
    avgLAI: plot.laiValues.reduce((sum, val) => sum + val, 0) / plot.laiValues.length,
    totalCount: plot.canopyCoverValues.length
  }));

  // Prepare canopy cover distribution data
  const canopyDistribution = [
    { name: '<20%', count: analyses.filter(a => a.canopyCoverPercentage < 20).length },
    { name: '20-40%', count: analyses.filter(a => a.canopyCoverPercentage >= 20 && a.canopyCoverPercentage < 40).length },
    { name: '40-60%', count: analyses.filter(a => a.canopyCoverPercentage >= 40 && a.canopyCoverPercentage < 60).length },
    { name: '60-80%', count: analyses.filter(a => a.canopyCoverPercentage >= 60 && a.canopyCoverPercentage < 80).length },
    { name: '>80%', count: analyses.filter(a => a.canopyCoverPercentage >= 80).length }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        {/* Statistics Summary */}
        <Grid item xs={12} md={3} component="div">
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Total Analyses</Typography>
            <Typography variant="h4" color="primary">{stats.totalAnalyses}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3} component="div">
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Avg. Canopy Cover</Typography>
            <Typography variant="h4" color="primary">{stats.avgCanopyCover}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3} component="div">
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Avg. LAI</Typography>
            <Typography variant="h4" color="primary">{stats.avgLAI}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3} component="div">
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Range</Typography>
            <Typography variant="h4" color="primary">{stats.minCanopyCover}% - {stats.maxCanopyCover}%</Typography>
          </Paper>
        </Grid>

        {/* Canopy Cover by Plot */}
        <Grid item xs={12} md={6} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Canopy Cover by Plot
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={plotAvgData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plotId" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgCanopyCover" name="Avg Canopy Cover (%)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* LAI by Plot */}
        <Grid item xs={12} md={6} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average LAI by Plot
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={plotAvgData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plotId" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgLAI" name="Avg LAI" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Canopy Cover Distribution */}
        <Grid item xs={12} md={6} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Canopy Cover Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={canopyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {canopyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Canopy Cover vs LAI Scatter */}
        <Grid item xs={12} md={6} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Canopy Cover vs LAI
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="canopyCoverPercentage" name="Canopy Cover" label={{ value: 'Canopy Cover (%)', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis type="number" dataKey="estimatedLAI" name="LAI" label={{ value: 'LAI', angle: -90, position: 'insideLeft' }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="Analysis Points" data={analyses} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Canopy Cover Trend (if we had time-series data) */}
        <Grid item xs={12} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Canopy Analysis Overview
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyses}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="id"
                      tickFormatter={(value) => {
                        // Extract just the plot and quadrant from the ID
                        const analysis = analyses.find(a => a.id === value);
                        return analysis ? `${analysis.plotId}-${analysis.quadrantId}` : '';
                      }}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'canopyCoverPercentage') {
                          return [`${value}%`, 'Canopy Cover'];
                        }
                        return [value, name === 'estimatedLAI' ? 'LAI' : name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="canopyCoverPercentage" name="Canopy Cover (%)" fill="#8884d8" />
                    <Bar dataKey="estimatedLAI" name="LAI" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CanopyAnalysisVisualization;