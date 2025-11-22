import React, { useState, useRef } from 'react';
import { Box, Paper, Typography, alpha, useTheme } from '@mui/material';
import { VisualTreeNode, InteractionMode } from './types';
import { PlotConfiguration } from '../../types/plot';
import NavigationIcon from '@mui/icons-material/Navigation';

import PlotGrid from './PlotGrid';
import PlotSubplots from './PlotSubplots';
import PlotTrees from './PlotTrees';

interface PlotVisualizerProps {
  config: PlotConfiguration;
  trees: VisualTreeNode[];
  interactionMode: InteractionMode;
  highlightedSpecies: string | null;
  selectedTreeIds: string[];
  onTreeSelect: (id: string, multi: boolean) => void;
  onTreeMove: (id: string, x: number, y: number) => void;
  showLabels?: boolean;
  showGrid?: boolean;
  showSubplots?: boolean;
  showTrees?: boolean;
}

const PlotVisualizer: React.FC<PlotVisualizerProps> = ({
  config,
  trees,
  interactionMode,
  highlightedSpecies,
  selectedTreeIds,
  onTreeSelect,
  onTreeMove,
  showLabels = true,
  showGrid = true,
  showSubplots = true,
  showTrees = true
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<VisualTreeNode | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const width = config.dimensions.width;
  const height = config.dimensions.height;
  const viewBox = `-5 -5 ${width + 10} ${height + 10}`;

  // --- Interaction Logic ---
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = (width + 10) / rect.width;
      const scaleY = (height + 10) / rect.height;

      const mouseX = (e.clientX - rect.left) * scaleX - 5;
      const mouseY = (e.clientY - rect.top) * scaleY - 5;

      const x = Math.max(0, Math.min(width, mouseX));
      const y = Math.max(0, Math.min(height, mouseY));
      onTreeMove(draggingId, x, y);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
        backgroundImage: `
          linear-gradient(${alpha(theme.palette.text.secondary, 0.05)} 1px, transparent 1px),
          linear-gradient(90deg, ${alpha(theme.palette.text.secondary, 0.05)} 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        borderRadius: 1,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[2]
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDraggingId(null)}
        onMouseLeave={() => { setDraggingId(null); setHoveredNode(null); }}
        style={{ display: 'block', cursor: interactionMode === 'edit' ? 'crosshair' : 'default' }}
      >
        {/* --- 1. Grid & Layout Layer --- */}
        <PlotGrid
          config={config}
          width={width}
          height={height}
          showGrid={showGrid}
          showQuadrants={true}
        />

        {/* --- 2. Subplots Layer --- */}
        <PlotSubplots
          config={config}
          showSubplots={showSubplots}
        />

        {/* --- 3. Data Layer (Trees) --- */}
        <PlotTrees
          trees={trees}
          selectedTreeIds={selectedTreeIds}
          highlightedSpecies={highlightedSpecies}
          onTreeSelect={onTreeSelect}
          onHover={setHoveredNode}
          showTrees={showTrees}
        />

        {/* --- 4. Axis Labels --- */}
        {showLabels && (
          <g className="axis-labels" pointerEvents="none">
            {/* X Axis */}
            {Array.from({ length: Math.ceil(width / 5) + 1 }).map((_, i) => (
              <text key={`x-${i}`} x={i * 5} y="-0.5" fontSize="0.4" textAnchor="middle" fill={theme.palette.text.secondary}>{i * 5}m</text>
            ))}
            {/* Y Axis */}
            {Array.from({ length: Math.ceil(height / 5) + 1 }).map((_, i) => (
              <text key={`y-${i}`} x="-0.5" y={i * 5} fontSize="0.4" textAnchor="end" dominantBaseline="middle" fill={theme.palette.text.secondary}>{i * 5}m</text>
            ))}
          </g>
        )}

      </svg>

      {/* --- HUD Overlay --- */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, pointerEvents: 'none', opacity: 0.8 }}>
        <Box sx={{ position: 'relative', width: 32, height: 32 }}>
          <NavigationIcon sx={{ transform: 'rotate(0deg)', color: 'text.secondary', fontSize: 32 }} />
          <Typography variant="caption" sx={{ position: 'absolute', top: -8, left: 0, right: 0, textAlign: 'center', fontWeight: 'bold', fontSize: '0.7rem' }}>N</Typography>
        </Box>
      </Box>

      {/* Tooltip */}
      {hoveredNode && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            left: `${(hoveredNode.x / width) * 100}%`,
            top: `${(hoveredNode.y / height) * 100}%`,
            transform: 'translate(-50%, -120%)',
            p: 1.5,
            zIndex: 100,
            pointerEvents: 'none',
            minWidth: 160,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(4px)',
            border: `1px solid ${hoveredNode.color}`,
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" color="primary.main" noWrap>
            {hoveredNode.species}
          </Typography>
          <Box sx={{ mt: 0.5, display: 'grid', gridTemplateColumns: 'auto auto', gap: '2px 12px' }}>
            <Typography variant="caption" color="text.secondary">ID:</Typography>
            <Typography variant="caption" fontWeight="bold">{hoveredNode.id}</Typography>
            <Typography variant="caption" color="text.secondary">Height:</Typography>
            <Typography variant="caption" fontWeight="bold">{hoveredNode.height.toFixed(1)}m</Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default PlotVisualizer;