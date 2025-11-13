import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface PlotDataDisplayProps {
  plotData?: Array<{
    id: number;
    x: number;
    y: number;
    type: string;
    description: string;
  }>;
}

const PlotDataDisplay = ({ plotData = [] }: PlotDataDisplayProps) => {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Plot Data
      </Typography>
      
      {plotData.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plotData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.x.toFixed(2)}m, {item.y.toFixed(2)}m</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
          No plot data available
        </Typography>
      )}
    </Paper>
  );
};

export default PlotDataDisplay;