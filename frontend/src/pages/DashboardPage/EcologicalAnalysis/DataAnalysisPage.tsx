import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Tab,
  Tabs,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Breadcrumb from '../../../components/Breadcrumb';
import {
  getSpeciesRichness,
  getDiversityIndices,
  getDominanceMetrics,
  getStructuralMetrics,
  SpeciesRichnessData,
  DiversityData,
  DominanceData,
  StructuralData
} from '../../../services/analysisService';

// --- Components ---

const DiversityPanel = ({ plotId }: { plotId: string }) => {
  const [richness, setRichness] = useState<SpeciesRichnessData | null>(null);
  const [diversity, setDiversity] = useState<DiversityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rData, dData] = await Promise.all([
          getSpeciesRichness(plotId),
          getDiversityIndices(plotId)
        ]);
        setRichness(rData);
        setDiversity(dData);
      } catch (error) {
        console.error("Failed to fetch diversity data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [plotId]);

  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h6" color="text.secondary">Species Richness</Typography>
          <Typography variant="h2" color="primary">{richness?.total_richness || 0}</Typography>
          <Typography variant="body2">Total unique species identified</Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h6" color="text.secondary">Shannon Index (H')</Typography>
          <Typography variant="h2" color="secondary">{diversity?.shannon_index || 0}</Typography>
          <Typography variant="body2">Measure of diversity (higher is more diverse)</Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h6" color="text.secondary">Simpson Index (1-D)</Typography>
          <Typography variant="h2" color="success.main">{diversity?.simpson_index || 0}</Typography>
          <Typography variant="body2">Probability that two individuals are different species</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

const DominancePanel = ({ plotId }: { plotId: string }) => {
  const [data, setData] = useState<DominanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getDominanceMetrics(plotId);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch dominance data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [plotId]);

  if (loading) return <CircularProgress />;

  const top10 = data.slice(0, 10);

  return (
    <Paper sx={{ p: 3, height: 500, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>Top 10 Dominant Species</Typography>
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={top10}
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="Species" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="relative_abundance" name="Relative Abundance (%)" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

const StructurePanel = ({ plotId }: { plotId: string }) => {
  const [data, setData] = useState<StructuralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getStructuralMetrics(plotId);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch structural data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [plotId]);

  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>Height Distribution</Typography>
          <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.height_distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>DBH Distribution</Typography>
          <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.dbh_distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

// --- Main Page ---

const DataAnalysisPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedPlot, setSelectedPlot] = useState('P01'); // Default to P01

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePlotChange = (event: SelectChangeEvent) => {
    setSelectedPlot(event.target.value as string);
  };

  // Generate plot options (P01 to P09)
  const plotOptions = Array.from({ length: 9 }, (_, i) => `P0${i + 1}`);

  return (
    <Box>
      <Breadcrumb />
      <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Ecological Data Analysis
          </Typography>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="plot-select-label">Select Plot</InputLabel>
            <Select
              labelId="plot-select-label"
              value={selectedPlot}
              label="Select Plot"
              onChange={handlePlotChange}
            >
              {plotOptions.map((plot) => (
                <MenuItem key={plot} value={plot}>{plot}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Diversity Indices" />
            <Tab label="Species Dominance" />
            <Tab label="Structural Analysis" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && <DiversityPanel plotId={selectedPlot} />}
          {tabValue === 1 && <DominancePanel plotId={selectedPlot} />}
          {tabValue === 2 && <StructurePanel plotId={selectedPlot} />}
        </Box>
      </Container>
    </Box>
  );
};

export default DataAnalysisPage;