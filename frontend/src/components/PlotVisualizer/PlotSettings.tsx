import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Stack
} from '@mui/material';

export interface VisualizerSettings {
  showGrid: boolean;
  showQuadrants: boolean;
  showLabels: boolean;
  showWoody: boolean;
  showHerb: boolean;
}

interface PlotSettingsProps {
  settings: VisualizerSettings;
  onSettingChange: (key: keyof VisualizerSettings) => void;
}

const PlotSettings: React.FC<PlotSettingsProps> = ({ settings, onSettingChange }) => {
  return (
    <Box>
      <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom sx={{ letterSpacing: 1 }}>
        LAYERS
      </Typography>
      <Stack spacing={0.5}>
        <FormControlLabel
          control={<Switch size="small" checked={settings.showWoody} onChange={() => onSettingChange('showWoody')} />}
          label={<Typography variant="body2">Woody Individuals (Trees)</Typography>}
        />
        <FormControlLabel
          control={<Switch size="small" checked={settings.showHerb} onChange={() => onSettingChange('showHerb')} />}
          label={<Typography variant="body2">Herbaceous Subplots</Typography>}
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom sx={{ letterSpacing: 1 }}>
        REFERENCE
      </Typography>
      <Stack spacing={0.5}>
        <FormControlLabel
          control={<Switch size="small" checked={settings.showGrid} onChange={() => onSettingChange('showGrid')} />}
          label={<Typography variant="body2">Measurement Grid (1m)</Typography>}
        />
        <FormControlLabel
          control={<Switch size="small" checked={settings.showQuadrants} onChange={() => onSettingChange('showQuadrants')} />}
          label={<Typography variant="body2">Quadrant Dividers</Typography>}
        />
        <FormControlLabel
          control={<Switch size="small" checked={settings.showLabels} onChange={() => onSettingChange('showLabels')} />}
          label={<Typography variant="body2">Quadrant Labels (Q1-4)</Typography>}
        />
      </Stack>
    </Box>
  );
};

export default PlotSettings;