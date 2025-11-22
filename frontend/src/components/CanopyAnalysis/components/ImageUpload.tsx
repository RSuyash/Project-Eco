import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  LinearProgress,
  Avatar,
  IconButton,
} from '@mui/material';
import { useCanopyAnalysis } from '../context/CanopyAnalysisContext';
import { UploadFile as UploadFileIcon, Close as CloseIcon } from '@mui/icons-material';
import { analyzeCanopyImage } from '../api/canopyAnalysisApi';
import { validateImageFile, handleApiError } from '../utils/helpers';
import { CANOPY_ANALYSIS_CONFIG } from '../config';

const ImageUpload: React.FC = () => {
  const {
    selectedFile,
    selectedPlotId,
    selectedQuadrantId,
    isAnalyzing,
    error,
    uploadProgress,
    dispatch,
  } = useCanopyAnalysis();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Use helper function to validate the file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        dispatch({ type: 'SET_ERROR', payload: validation.message });
        return;
      }

      dispatch({ type: 'SET_SELECTED_FILE', payload: file });
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  };

  const handlePlotIdChange = (event: SelectChangeEvent<string>) => {
    dispatch({ type: 'SET_SELECTED_PLOT_ID', payload: event.target.value as string });
  };

  const handleQuadrantIdChange = (event: SelectChangeEvent<string>) => {
    dispatch({ type: 'SET_SELECTED_QUADRANT_ID', payload: event.target.value as string });
  };

  const handleRemoveFile = () => {
    dispatch({ type: 'SET_SELECTED_FILE', payload: null });
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select an image file' });
      return;
    }

    if (!selectedPlotId) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select a plot ID' });
      return;
    }

    if (!selectedQuadrantId) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select a quadrant ID' });
      return;
    }

    dispatch({ type: 'SET_ANALYZING', payload: true });
    dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: 0 });

    try {
      const response = await analyzeCanopyImage({
        file: selectedFile,
        plot_id: selectedPlotId,
        quadrant_id: selectedQuadrantId
      });

      if (response.success) {
        const result = {
          filename: selectedFile.name,
          results: response.analysis_results,
          images: response.images,
          plot_id: selectedPlotId,
          quadrant_id: selectedQuadrantId,
          timestamp: new Date().toISOString(),
        };

        // Use dispatch to add the result to the state
        dispatch({ type: 'ADD_ANALYSIS_RESULT', payload: result });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message || 'Analysis failed' });
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = handleApiError(err);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  };

  // Mock plot and quadrant options for now
  const plotOptions = ['Plot-1', 'Plot-2', 'Plot-3', 'Plot-4', 'Plot-5'];
  const quadrantOptions = ['A', 'B', 'C', 'D', 'Q1', 'Q2', 'Q3', 'Q4'];

  // Validate selectedPlotId is in the allowed options, otherwise default to first option
  const sanitizedSelectedPlotId = plotOptions.includes(selectedPlotId) ? selectedPlotId : '';

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Canopy Image
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* File Upload */}
        <Box>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="upload-image"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="upload-image">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadFileIcon />}
              fullWidth
              disabled={isAnalyzing}
            >
              {selectedFile ? 'Change Image' : 'Select Image File'}
            </Button>
          </label>
          {selectedFile && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  {selectedFile.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body1">{selectedFile.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleRemoveFile} color="error">
                <CloseIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Plot and Quadrant Selection */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl fullWidth variant="outlined" disabled={isAnalyzing}>
            <InputLabel id="plot-select-label">Plot ID</InputLabel>
            <Select
              labelId="plot-select-label"
              value={sanitizedSelectedPlotId}
              onChange={handlePlotIdChange}
              label="Plot ID"
            >
              {plotOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" disabled={isAnalyzing}>
            <InputLabel id="quadrant-select-label">Quadrant ID</InputLabel>
            <Select
              labelId="quadrant-select-label"
              value={selectedQuadrantId}
              onChange={handleQuadrantIdChange}
              label="Quadrant ID"
            >
              {quadrantOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Upload Progress */}
        {isAnalyzing && (
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" gutterBottom>
              Uploading and analyzing image...
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" align="center" display="block">
              {uploadProgress}%
            </Typography>
          </Box>
        )}

        {/* Submit Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!selectedFile || !selectedPlotId || !selectedQuadrantId || isAnalyzing}
          size="large"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Canopy Image'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ImageUpload;