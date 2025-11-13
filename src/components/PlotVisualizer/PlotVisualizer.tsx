import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Paper,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';

interface PieSliceData {
  label: string;
  value: number;
  color: string;
}

interface SubplotProcessed {
  id: string;
  position: SubplotPosition;
  size: number;
  data: PieSliceData[];
}

interface WoodyGlyphProcessed {
  id: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  data: PieSliceData[];
  totalValue: number;
}

type SubplotPosition = 'Q1_CORNER' | 'Q2_CORNER' | 'Q3_CORNER' | 'Q4_CORNER';

interface PlotVisualizerProps {
  plotSize?: number;
  plotLabel?: string;
  showQuadrants?: boolean;
  subplots: SubplotProcessed[];
  woodyGlyphs: WoodyGlyphProcessed[];
  woodyLegend: Map<string, string>;
  herbLegend: Map<string, string>;
}

const QUADRANT_CONFIG = [
  { id: 'Q1', label: 'Q1' },
  { id: 'Q2', label: 'Q2' },
  { id: 'Q3', label: 'Q3' },
  { id: 'Q4', label: 'Q4' },
];

const SUBPLOT_POSITION_MAP: { [key: string]: SubplotPosition } = {
  'SP1': 'Q1_CORNER',
  'SP2': 'Q2_CORNER',
  'SP3': 'Q3_CORNER',
  'SP4': 'Q4_CORNER',
};

// Circle pack visualization for individual trees based on GBH
const WoodyCirclePack: React.FC<{ data: PieSliceData[]; size: number }> = ({ data, size }) => {
  if (!data.length) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          backgroundColor: 'grey.300',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="No data"
      >
        <Typography variant="caption">No Data</Typography>
      </Box>
    );
  }

  // Calculate max GBH value for scaling circle radii
  const maxGBH = Math.max(...data.map(d => d.value));
  const minRadius = 4; // Minimum circle radius
  const maxRadius = size * 0.15; // Reduced maximum radius to ensure better fit

  // Create circles for each individual tree with proper boundary constraints
  const circles = [];
  let usedPositions = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    // Each item represents one individual tree from the woody data
    const radius = Math.max(minRadius, (item.value / maxGBH) * maxRadius);

    let positionFound = false;
    let attempts = 0;
    let x, y;

    // Try to find a non-overlapping position within boundaries
    while (!positionFound && attempts < 100) {
      // Generate position ensuring the circle fits within bounds (accounting for radius)
      x = Math.random() * (size - radius * 2) + radius;
      y = Math.random() * (size - radius * 2) + radius;

      // Check for collisions with existing circles
      let collision = false;
      for (const pos of usedPositions) {
        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        if (distance < (radius + pos.radius + 3)) { // 3px padding
          collision = true;
          break;
        }
      }

      if (!collision) {
        positionFound = true;
        usedPositions.push({ x, y, radius, species: item.label });
      }

      attempts++;
    }

    // Even if we couldn't find a non-overlapping position, place it within boundaries
    if (!positionFound) {
      // Generate a position within the boundary anyway, prioritizing containment over overlap
      x = Math.random() * (size - radius * 2) + radius;
      y = Math.random() * (size - radius * 2) + radius;
      usedPositions.push({ x, y, radius, species: item.label });
    }

    circles.push(
      <Box
        key={`${i}`}
        title={`${item.label}: GBH ${item.value.toFixed(1)}cm`}
        sx={{
          position: 'absolute',
          left: `${x - radius}px`, // Center the circle at the coordinate
          top: `${y - radius}px`,  // Center the circle at the coordinate
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          backgroundColor: item.color,
          borderRadius: '50%',
          border: '1px solid rgba(0,0,0,0.3)',
          '&:hover': {
            opacity: 0.8,
            cursor: 'pointer',
            transform: 'scale(1.2)',
            zIndex: 10,
            boxShadow: '0 0 5px rgba(0,0,0,0.5)'
          }
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'visible', // Allow elements to be visible outside if needed
        '&:hover': {
          cursor: 'pointer'
        }
      }}
    >
      {circles}
    </Box>
  );
};

// 1x1m subplot representation with visible solid border
const SubplotSquare: React.FC<{ data: PieSliceData[]; size: number }> = ({ data, size }) => {
  if (!data.length) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          backgroundColor: 'rgba(200, 200, 200, 0.2)', // Light grey with more opacity
          border: '2px solid rgba(0,0,0,0.7)', // Solid border to represent 1x1m
          borderRadius: '2px', // Less rounded for scientific look
        }}
        title="No data"
      />
    );
  }

  // For small subplots, just show a representative color based on the first data type
  const representativeColor = data[0]?.color || '#ccc';

  return (
    <Box
      sx={{
        width: size,
        height: size,
        border: '2px solid rgba(0,0,0,0.8)', // Darker solid border for better visibility
        borderRadius: '2px', // Less rounded for scientific look
        backgroundColor: representativeColor,
        opacity: 0.8,
        '&:hover': {
          cursor: 'pointer',
          opacity: 1,
          boxShadow: '0 0 8px rgba(0,0,0,0.4)', // Stronger glow on hover
        }
      }}
      title={`1x1m subplot: ${data.length} cover types - ${data.map(d => `${d.label}(${d.value}%)`).join(', ')}`}
    >
    </Box>
  );
};

const SubplotComponent: React.FC<{ subplot: SubplotProcessed; quadrantSize: number }> = ({ subplot, quadrantSize }) => {
  const { position, data } = subplot;

  // Calculate total value to get percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null; // Don't render empty subplots

  const pieData = data.map(item => ({
    ...item,
    value: item.value, // Keep original values for subplots
  }));

  // Calculate the size of the subplot visualization - make it more substantial
  const subplotSize = Math.max(25, quadrantSize * 0.18); // Larger minimum size and scaling

  let positionSx = {};

  switch (position) {
    case 'Q1_CORNER':
      positionSx = {
        position: 'absolute',
        top: 0,    // Exactly at top edge
        left: 0,   // Exactly at left edge
      };
      break;
    case 'Q2_CORNER':
      positionSx = {
        position: 'absolute',
        top: 0,    // Exactly at top edge
        right: 0,  // Exactly at right edge
      };
      break;
    case 'Q3_CORNER':
      positionSx = {
        position: 'absolute',
        bottom: 0, // Exactly at bottom edge
        left: 0,   // Exactly at left edge
      };
      break;
    case 'Q4_CORNER':
      positionSx = {
        position: 'absolute',
        bottom: 0, // Exactly at bottom edge
        right: 0,  // Exactly at right edge
      };
      break;
  }

  return (
    <Box sx={positionSx}>
      <SubplotSquare data={pieData} size={subplotSize} />
    </Box>
  );
};

const Legend: React.FC<{ woody: Map<string, string>; herb: Map<string, string> }> = ({ woody, herb }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper sx={{ mt: 2, p: 2 }} elevation={2}>
      <Typography variant="h6" gutterBottom>Legend</Typography>
      <Grid container spacing={2}>
        {/* Woody Legend */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>Woody Species (by GBH)</Typography>
          <Box sx={{ maxHeight: 160, overflowY: 'auto' }}>
            {Array.from(woody.entries()).map(([label, color]) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '2px', // Less rounded for scientific look
                    backgroundColor: color,
                    mr: 1,
                  }}
                />
                <Typography variant="caption" sx={{ fontStyle: 'italic', fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Herb/Floor Legend */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>Floor Cover (%)</Typography>
          {Array.from(herb.entries()).map(([label, color]) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '2px', // Less rounded for scientific look
                  backgroundColor: color,
                  mr: 1,
                }}
              />
              <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{label}</Typography>
            </Box>
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};

const PlotVisualizer: React.FC<PlotVisualizerProps> = ({
  plotSize = 10,
  plotLabel = 'Vegetation Plot',
  showQuadrants = true,
  subplots = [],
  woodyGlyphs = [],
  woodyLegend,
  herbLegend,
}) => {
  const quadrantSize = plotSize / 2;

  return (
    <Card>
      <CardContent>
        {/* Header with title and dropdown side by side */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {plotLabel}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
            Size: {plotSize}m x {plotSize}m
          </Typography>
        </Box>

        {/* Main Plot Area */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: { lg: '600px' }, // Max width on large screens, but scale down if needed
            height: 0,
            paddingBottom: '100%', // Maintain 1:1 aspect ratio always
            backgroundColor: 'rgba(144, 238, 144, 0.2)', // lighter green with less transparency
            border: '2.5px solid', // Thinner border
            borderColor: 'grey.700', // Slightly lighter border
            borderRadius: '4px', // Less rounded corners
            overflow: 'hidden',
            mx: 'auto', // Center the plot
          }}
        >
          {/* Grid lines and axis labels */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none', // Allow interaction with content below
            }}
          >
            {/* Horizontal grid lines and labels */}
            {Array.from({ length: 11 }, (_, i) => (
              <React.Fragment key={`h-${i}`}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: `${(i / 10) * 100}%`,
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  }}
                />
                <Typography
                  sx={{
                    position: 'absolute',
                    top: `${(i / 10) * 100}%`,
                    left: '2px',
                    fontSize: '0.6rem',
                    color: 'rgba(0, 0, 0, 0.6)',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {i}m
                </Typography>
              </React.Fragment>
            ))}

            {/* Vertical grid lines and labels */}
            {Array.from({ length: 11 }, (_, i) => (
              <React.Fragment key={`v-${i}`}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${(i / 10) * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  }}
                />
                <Typography
                  sx={{
                    position: 'absolute',
                    left: `${(i / 10) * 100}%`,
                    bottom: '2px',
                    fontSize: '0.6rem',
                    color: 'rgba(0, 0, 0, 0.6)',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {i}m
                </Typography>
              </React.Fragment>
            ))}
          </Box>
          {/* Quadrant Grid */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
            }}
          >
            {QUADRANT_CONFIG.map((quad, index) => {
              const quadrantSubplots = subplots.filter(sp =>
                SUBPLOT_POSITION_MAP[sp.id as keyof typeof SUBPLOT_POSITION_MAP] === `${quad.id}_CORNER`
              );

              const woodyGlyph = woodyGlyphs.find(g => g.id === quad.id as 'Q1' | 'Q2' | 'Q3' | 'Q4');

              // Normalize woody glyph data for visualization
              const woodyData = woodyGlyph ? woodyGlyph.data.map(d => ({
                ...d,
                value: d.value, // Keep actual GBH values for bar chart
              })) : [];

              return (
                <Box
                  key={quad.id}
                  sx={{
                    position: 'relative',
                    borderRight: index === 0 || index === 2 ? '1px solid rgba(0, 0, 0, 0.4)' : 'none', // More visible gridlines
                    borderBottom: index === 0 || index === 1 ? '1px solid rgba(0, 0, 0, 0.4)' : 'none', // More visible gridlines
                  }}
                >
                  {/* Quadrant Label (Watermark) - more opaque */}
                  {showQuadrants && (
                    <Typography
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        color: 'rgba(0, 100, 0, 0.25)', // More opaque (was 0.15)
                        zIndex: 0,
                        userSelect: 'none',
                      }}
                    >
                      {quad.label}
                    </Typography>
                  )}

                  {/* Woody Species Visualization (Circle Pack) - Directly in quadrant */}
                  {woodyGlyph && woodyGlyph.totalValue > 0 && (
                    <WoodyCirclePack data={woodyData} size={quadrantSize * 20} />
                  )}

                  {/* Herb/Floor Subplots (Corners) */}
                  {quadrantSubplots.map(subplot => (
                    <SubplotComponent
                      key={subplot.id}
                      subplot={subplot}
                      quadrantSize={quadrantSize}
                    />
                  ))}
                </Box>
              );
            })}
          </Box>

          {/* Remove the outer dimension labels since we now have internal axis labels */}
        </Box>

      </CardContent>
    </Card>
  );
};

export { PlotVisualizer, Legend };

export default PlotVisualizer;