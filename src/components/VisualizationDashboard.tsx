import React from 'react';
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
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell
} from 'recharts';
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
  Paper
} from '@mui/material';

// Define types for our data
interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: number | string;
}

interface VisualizationProps {
  data: ChartDataPoint[];
  type: 'bar' | 'line' | 'area' | 'scatter' | 'pie';
  title: string;
  xAxisKey?: string;
  yAxisKey?: string;
  color?: string;
  height?: number;
}

const ChartVisualization: React.FC<VisualizationProps> = ({
  data,
  type,
  title,
  xAxisKey = 'name',
  yAxisKey = 'value',
  color = '#3f51b5',
  height = 400
}) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yAxisKey} fill={color} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yAxisKey} stroke={color} activeDot={{ r: 8 }} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={yAxisKey} stroke={color} fill={color} fillOpacity={0.3} />
          </AreaChart>
        );
      case 'scatter':
        return (
          <ScatterChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis dataKey={yAxisKey} />
            <Tooltip />
            <Legend />
            <Scatter dataKey={yAxisKey} fill={color} />
          </ScatterChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill={color}
              dataKey={yAxisKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yAxisKey} fill={color} />
          </BarChart>
        );
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: height, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

interface DataGridProps {
  data: any[];
  title: string;
}

const DataGrid: React.FC<DataGridProps> = ({ data, title }) => {
  if (data.length === 0) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      </Paper>
    );
  }

  const keys = Object.keys(data[0]);

  return (
    <Paper sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" sx={{ p: 2 }} gutterBottom>
        {title}
      </Typography>
      <Box sx={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              {keys.map((key) => (
                <th 
                  key={key} 
                  style={{ 
                    padding: '12px', 
                    border: '1px solid #ddd',
                    textAlign: 'left',
                    fontWeight: 'bold'
                  }}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {keys.map((key) => (
                  <td 
                    key={key} 
                    style={{ 
                      padding: '12px', 
                      border: '1px solid #ddd' 
                    }}
                  >
                    {String(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};

interface VisualizationDashboardProps {
  data: any[];
  title: string;
  height?: number;
}

const VisualizationDashboard: React.FC<VisualizationDashboardProps> = ({ 
  data, 
  title,
  height = 400
}) => {
  const [chartType, setChartType] = React.useState<'bar' | 'line' | 'area' | 'scatter' | 'pie'>('bar');
  const [xAxis, setXAxis] = React.useState<string>('name');
  const [yAxis, setYAxis] = React.useState<string>('value');

  // Extract available fields from data
  const availableFields = data.length > 0 ? Object.keys(data[0]) : [];

  React.useEffect(() => {
    if (availableFields.length > 0) {
      setXAxis(availableFields[0]);
      setYAxis(availableFields.length > 1 ? availableFields[1] : availableFields[0]);
    }
  }, [availableFields]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={chartType}
              label="Chart Type"
              onChange={(e) => setChartType(e.target.value as any)}
            >
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="area">Area Chart</MenuItem>
              <MenuItem value="scatter">Scatter Plot</MenuItem>
              <MenuItem value="pie">Pie Chart</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>X-Axis</InputLabel>
            <Select
              value={xAxis}
              label="X-Axis"
              onChange={(e) => setXAxis(e.target.value)}
            >
              {availableFields.map(field => (
                <MenuItem key={field} value={field}>{field}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Y-Axis</InputLabel>
            <Select
              value={yAxis}
              label="Y-Axis"
              onChange={(e) => setYAxis(e.target.value)}
            >
              {availableFields.map(field => (
                <MenuItem key={field} value={field}>{field}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ChartVisualization
            data={data}
            type={chartType}
            title="Data Visualization"
            xAxisKey={xAxis}
            yAxisKey={yAxis}
            height={height}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DataGrid data={data} title="Data Grid" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default VisualizationDashboard;
export { ChartVisualization, DataGrid, type ChartDataPoint };