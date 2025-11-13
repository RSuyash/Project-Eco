import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import { Visibility, Delete, CheckCircle } from '@mui/icons-material';
import { CanopyPhotoAnalysis } from '../../database/models/Plot';

interface CanopyPhotoAnalyzerProps {
  plotIds: string[];
  onAnalysisComplete?: (analysisResult: CanopyPhotoAnalysis) => void;
  existingAnalyses?: CanopyPhotoAnalysis[];
}

const getCanopyImagePaths = (plotId: string): string[] => {
  if (!plotId) return [];
  const plotNumber = plotId.replace('P', '');
  return [
    `/vegetation-plotting/capopy_images/Plot-${plotNumber}/Canopy_Images/center.jpg`,
    `/vegetation-plotting/capopy_images/Plot-${plotNumber}/Canopy_Images/quadrant1.jpg`,
    `/vegetation-plotting/capopy_images/Plot-${plotNumber}/Canopy_Images/quadrant2.jpg`,
    `/vegetation-plotting/capopy_images/Plot-${plotNumber}/Canopy_Images/quadrant3.jpg`,
    `/vegetation-plotting/capopy_images/Plot-${plotNumber}/Canopy_Images/quadrant4.jpg`,
  ];
};

const CanopyPhotoAnalyzer: React.FC<CanopyPhotoAnalyzerProps> = ({
  plotIds,
  onAnalysisComplete,
  existingAnalyses = []
}) => {
  const [selectedPlot, setSelectedPlot] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<CanopyPhotoAnalysis[]>(existingAnalyses);
  const [error, setError] = useState<string | null>(null);
  const [openPreview, setOpenPreview] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [imagePaths, setImagePaths] = useState<string[]>([]);

  useEffect(() => {
    if (selectedPlot) {
      const paths = getCanopyImagePaths(selectedPlot);
      setImagePaths(paths);
      setSelectedImage(null);
    }
  }, [selectedPlot]);

  const handleAnalyze = async () => {
    if (!selectedPlot || !selectedImage) {
      setError('Please select a plot and an image');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult: CanopyPhotoAnalysis = {
        id: `analysis_${Date.now()}`,
        plotId: selectedPlot,
        quadrantId: 'Q' + Math.ceil(Math.random() * 4),
        imageFileName: selectedImage.split('/').pop() || '',
        imageUrl: selectedImage,
        canopyCoverPercentage: Math.random() * 100,
        estimatedLAI: Math.random() * 8,
        gapFraction: Math.random(),
        analysisDate: new Date().toISOString(),
        analysisImagePath: selectedImage,
        notes: 'Preliminary analysis result',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setAnalysisResults([...analysisResults, mockResult]);
      if (onAnalysisComplete) {
        onAnalysisComplete(mockResult);
      }

      setSelectedImage(null);
    } catch (err) {
      setError('Failed to analyze the image. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePreviewImage = (imagePath: string) => {
    setPreviewImage(imagePath);
    setOpenPreview(true);
  };

  const handleDeleteAnalysis = (id: string) => {
    setAnalysisResults(analysisResults.filter(result => result.id !== id));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Canopy Photo Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a plot to view and analyze canopy photos.
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
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

          {selectedPlot && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Images for {selectedPlot}
              </Typography>
              <ImageList cols={5} gap={8}>
                {imagePaths.map((path) => (
                  <ImageListItem key={path} onClick={() => setSelectedImage(path)} sx={{ cursor: 'pointer', border: selectedImage === path ? '2px solid' : 'none', borderColor: 'primary.main' }}>
                    <img src={path} alt={path} loading="lazy" />
                    <ImageListItemBar
                      title={path.split('/').pop()}
                      actionIcon={
                        selectedImage === path && <CheckCircle color="primary" sx={{ mr: 1 }} />
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Paper>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2, width: '100%', textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAnalyze}
              disabled={!selectedPlot || !selectedImage || isAnalyzing}
              startIcon={isAnalyzing ? <CircularProgress size={20} /> : null}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Selected Image'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {analysisResults.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Plot</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Canopy Cover %</TableCell>
                    <TableCell>LAI</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analysisResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.plotId}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handlePreviewImage(result.imageUrl)}
                          color="primary"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        {result.imageFileName}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${result.canopyCoverPercentage.toFixed(2)}%`} 
                          color={result.canopyCoverPercentage > 70 ? "success" : result.canopyCoverPercentage > 40 ? "warning" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{result.estimatedLAI.toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAnalysis(result.id)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <img 
              src={previewImage} 
              alt="Analysis preview" 
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CanopyPhotoAnalyzer;