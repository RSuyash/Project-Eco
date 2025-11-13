import React, { useState } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  FormControl, // New import
  FormLabel,   // New import
  // Removed Paper from here, as it's handled by parent sectionContainerStyle
  useTheme,
} from '@mui/material';

interface PlotSettingsProps {
  onPlotSizeChange: (size: number) => void;
  initialPlotSize?: number;
}

const PlotSettings: React.FC<PlotSettingsProps> = ({ onPlotSizeChange, initialPlotSize = 10 }) => {
  const theme = useTheme();
  const [selectedSize, setSelectedSize] = useState<string>(String(initialPlotSize));
  const [customSize, setCustomSize] = useState<string>('');

  const predefinedSizes = [10, 20, 30];

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedSize(value);
    setCustomSize(''); // Clear custom size if a predefined one is selected
    if (value !== 'custom') {
      onPlotSizeChange(Number(value));
    }
  };

  const handleCustomSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCustomSize(value);
    setSelectedSize('custom');
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > 0) {
      onPlotSizeChange(numValue);
    }
  };

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}> {/* Use FormControl */}
      <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}> {/* Use FormLabel */}
        Plot Size (m x m):
      </FormLabel>
      <RadioGroup
        row
        value={selectedSize}
        onChange={handleSizeChange}
        sx={{ mb: 1 }}
      >
        {predefinedSizes.map((size) => (
          <FormControlLabel
            key={size}
            value={String(size)}
            control={<Radio size="small" />}
            label={`${size}x${size}`}
          />
        ))}
        <FormControlLabel
          value="custom"
          control={<Radio size="small" />}
          label="Custom"
        />
      </RadioGroup>
      {selectedSize === 'custom' && (
        <TextField
          label="Custom Size (m)"
          variant="outlined"
          size="small"
          type="number"
          value={customSize}
          onChange={handleCustomSizeChange}
          fullWidth
          sx={{ mt: 1 }}
          inputProps={{ min: 1 }}
        />
      )}
    </FormControl>
  );
};

export default PlotSettings;