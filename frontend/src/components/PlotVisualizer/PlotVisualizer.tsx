import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { SubplotProcessed, WoodyGlyphProcessed } from './PlotVisualizerService';

// --- Interfaces ---
interface PlotVisualizerProps {
  subplots: SubplotProcessed[];
  woodyGlyphs: WoodyGlyphProcessed[];
  settings: {
    showGrid: boolean;
    showQuadrants: boolean;
    showLabels: boolean;
    showWoody: boolean;
    showHerb: boolean;
  };
}

// --- Constants ---
const QUADRANTS = [
  { id: 'Q1', label: 'Q1', top: 0, left: 0 },
  { id: 'Q2', label: 'Q2', top: 0, left: '50%' },
  { id: 'Q3', label: 'Q3', top: '50%', left: 0 },
  { id: 'Q4', label: 'Q4', top: '50%', left: '50%' },
];

const SUBPLOT_MAP: Record<string, React.CSSProperties> = {
  'Q1_CORNER': { top: 0, left: 0 },
  'Q2_CORNER': { top: 0, right: 0 },
  'Q3_CORNER': { bottom: 0, left: 0 },
  'Q4_CORNER': { bottom: 0, right: 0 },
};

// --- Sub-Components ---

const WoodyLayer: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Data is scaled to GBH. In a real app, we might use d3-scale.
  // Here we map GBH to a % width relative to the quadrant.
  const maxVal = Math.max(...data.map(d => d.value));
  
  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 5 }}>
      {data.map((tree, i) => {
        // Deterministic random positioning based on index to keep trees static but distributed
        const top = 10 + ((i * 23) % 80); 
        const left = 10 + ((i * 47) % 80);
        
        // Scale size: Min 4%, Max 15% of quadrant width
        const size = 4 + ((tree.value / maxVal) * 11);

        return (
          <Tooltip 
            key={i} 
            title={`${tree.label} (GBH: ${tree.value}cm)`} 
            arrow 
            placement="top"
          >
            <Box
              sx={{
                position: 'absolute',
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}%`,
                paddingBottom: `${size}%`, // Maintain aspect ratio of circle
                bgcolor: tree.color,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.8)',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': { 
                  transform: 'translate(-50%, -50%) scale(1.4)', 
                  zIndex: 20,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
                }
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
};

const SubplotLayer: React.FC<{ data: any[] }> = ({ data }) => {
  // Simplified representation: Main color is dominant cover
  if (!data || data.length === 0) return null;
  const dominant = data[0];

  return (
    <Tooltip 
      title={
        <Box>
          <Typography variant="caption" fontWeight="bold">Subplot Data</Typography>
          {data.map((d: any) => (
            <Box key={d.label} display="flex" justifyContent="space-between" minWidth={100}>
              <span>{d.label}:</span> <span>{d.value}%</span>
            </Box>
          ))}
        </Box>
      }
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: dominant.color,
          border: '2px solid rgba(255,255,255,0.9)',
          boxShadow: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s',
          cursor: 'help',
          '&:hover': { transform: 'scale(1.1)', zIndex: 5 }
        }}
      >
        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.6)' }}>
          1m²
        </Typography>
      </Box>
    </Tooltip>
  );
};

// --- Main Component ---

const PlotVisualizer: React.FC<PlotVisualizerProps> = ({ 
  subplots, 
  woodyGlyphs, 
  settings 
}) => {
  
  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      bgcolor: '#f1f8e9', // Base Ecological Green
      position: 'relative',
      overflow: 'hidden',
      // The outer border of the entire plot
      border: '3px solid #33691e' 
    }}>
      
      {/* 1. Grid Layer */}
      {settings.showGrid && (
        <Box sx={{ 
          position: 'absolute', inset: 0, 
          opacity: 0.3,
          // Create a 10x10 grid (10% each)
          backgroundImage: `
            linear-gradient(to right, #33691e 1px, transparent 1px),
            linear-gradient(to bottom, #33691e 1px, transparent 1px)
          `,
          backgroundSize: '10% 10%'
        }} />
      )}

      {/* 2. Quadrant Dividers (Thicker Lines) */}
      {settings.showQuadrants && (
        <>
          <Box sx={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', bgcolor: '#33691e', zIndex: 1 }} />
          <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', bgcolor: '#33691e', zIndex: 1 }} />
        </>
      )}

      {/* 3. Content Container */}
      {QUADRANTS.map((quad) => {
        const glyphData = woodyGlyphs.find(g => g.id === quad.id);
        const quadSubplots = subplots.filter(s => SUBPLOT_MAP[s.position]?.toString().includes(quad.id));
        
        // Find subplot for this quadrant (assuming standard corners)
        // Logic: Map the generic position ID to the current visual quadrant loop
        const relevantSubplot = subplots.find(s => {
           if (quad.id === 'Q1' && s.position === 'Q1_CORNER') return true;
           if (quad.id === 'Q2' && s.position === 'Q2_CORNER') return true;
           if (quad.id === 'Q3' && s.position === 'Q3_CORNER') return true;
           if (quad.id === 'Q4' && s.position === 'Q4_CORNER') return true;
           return false;
        });

        return (
          <Box 
            key={quad.id}
            sx={{
              position: 'absolute',
              top: quad.top,
              left: quad.left,
              width: '50%',
              height: '50%',
              // border: settings.showQuadrants ? '1px dashed rgba(51, 105, 30, 0.3)' : 'none',
              p: 0
            }}
          >
            {/* Watermark */}
            {settings.showLabels && (
              <Typography sx={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 'clamp(2rem, 10cqw, 6rem)', // Responsive font size relative to container
                fontWeight: 900,
                color: '#33691e',
                opacity: 0.1,
                userSelect: 'none',
                pointerEvents: 'none',
                zIndex: 0
              }}>
                {quad.label}
              </Typography>
            )}

            {/* Woody Layer */}
            {settings.showWoody && glyphData && (
              <WoodyLayer data={glyphData.data} />
            )}

            {/* Herb Layer (Fixed Corner) */}
            {settings.showHerb && relevantSubplot && (
              <Box sx={{
                position: 'absolute',
                width: '20%', // Represents a 1x1m subplot in a 5x5m quadrant (1/5 = 0.2)
                height: '20%',
                zIndex: 10,
                ...SUBPLOT_MAP[relevantSubplot.position]
              }}>
                <SubplotLayer data={relevantSubplot.data} />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default PlotVisualizer;