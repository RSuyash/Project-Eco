import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, alpha, useTheme } from '@mui/material';
import { VisualTreeNode, VisualSubplotNode, InteractionMode } from './types';
import NavigationIcon from '@mui/icons-material/Navigation';

interface PlotVisualizerProps {
  trees: VisualTreeNode[];
  subplots: VisualSubplotNode[];
  settings: {
    showGrid: boolean;
    showQuadrants: boolean;
    showLabels: boolean;
    showWoody: boolean;
    showHerb: boolean;
  };
  interactionMode: InteractionMode;
  highlightedSpecies: string | null;
  selectedTreeIds: string[];
  onTreeSelect: (id: string, multi: boolean) => void;
  onTreeMove: (id: string, x: number, y: number) => void;
}

const PlotVisualizer: React.FC<PlotVisualizerProps> = ({ 
  trees, 
  subplots, 
  settings,
  interactionMode,
  highlightedSpecies,
  selectedTreeIds,
  onTreeSelect,
  onTreeMove
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<VisualTreeNode | null>(null);

  // --- Interaction Handlers ---
  const handleMouseDown = (e: React.MouseEvent, treeId: string) => {
    e.stopPropagation();
    if (interactionMode === 'edit') {
      setDraggingId(treeId);
    } else {
      onTreeSelect(treeId, e.shiftKey || e.ctrlKey);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      // Calculate new 0-100% position
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      onTreeMove(draggingId, x, y);
    }
  };

  const uniqueSpeciesColors = Array.from(new Set(trees.map(t => t.color)));

  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        bgcolor: '#fcfcfc',
        backgroundImage: 'radial-gradient(#e0e0e0 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.02)'
      }}
    >
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" // Critical: Fits content to container
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDraggingId(null)}
        onMouseLeave={() => { setDraggingId(null); setHoveredNode(null); }}
        style={{ display: 'block', cursor: interactionMode === 'edit' ? 'crosshair' : 'default' }}
      >
        <defs>
          {/* 3D Dome Gradients for Trees */}
          {uniqueSpeciesColors.map((color, i) => (
            <radialGradient id={`grad-${color.replace('#', '')}`} key={i} cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor={alpha(color, 0.8)} />
              <stop offset="100%" stopColor={color} />
            </radialGradient>
          ))}

          {/* Selection Glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Grid --- */}
        {settings.showGrid && (
          <g stroke={alpha(theme.palette.text.secondary, 0.15)} strokeWidth="0.1">
            {Array.from({ length: 11 }).map((_, i) => (
              <React.Fragment key={i}>
                <line x1={i * 10} y1="0" x2={i * 10} y2="100" />
                <line x1="0" y1={i * 10} x2="100" y2={i * 10} />
              </React.Fragment>
            ))}
          </g>
        )}

        {/* --- Quadrants --- */}
        {settings.showQuadrants && (
          <g stroke={theme.palette.primary.main} strokeWidth="0.3" strokeDasharray="2,1" opacity="0.4">
            <line x1="50" y1="0" x2="50" y2="100" />
            <line x1="0" y1="50" x2="100" y2="50" />
          </g>
        )}

        {/* --- Subplots (Fixed Size) --- */}
        {settings.showHerb && subplots.map(sp => (
          <g key={sp.id}>
            <rect 
              x={sp.x} y={sp.y} width={sp.width} height={sp.height} 
              fill={alpha(theme.palette.secondary.main, 0.05)}
              stroke={theme.palette.secondary.main}
              strokeWidth="0.2"
              strokeDasharray="1,1"
            />
            <text x={sp.x + 5} y={sp.y + 5} fontSize="2" textAnchor="middle" fill={theme.palette.secondary.main} opacity="0.7">
              {sp.id}
            </text>
          </g>
        ))}

        {/* --- Trees --- */}
        {settings.showWoody && trees.map((tree) => {
          const isSelected = selectedTreeIds.includes(tree.id);
          const isDimmed = highlightedSpecies && tree.species !== highlightedSpecies;
          // Calculate shadow offset based on height
          const shadowOff = tree.height * 0.1;

          return (
            <g 
              key={tree.id}
              onClick={(e) => handleMouseDown(e, tree.id)}
              onMouseEnter={() => setHoveredNode(tree)}
              style={{ 
                opacity: isDimmed ? 0.1 : 1, 
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              {/* Shadow */}
              <circle 
                cx={tree.x + shadowOff} 
                cy={tree.y + shadowOff} 
                r={tree.radius} 
                fill="black" 
                opacity="0.15"
              />
              {/* Tree Canopy */}
              <circle
                cx={tree.x}
                cy={tree.y}
                r={tree.radius}
                fill={`url(#grad-${tree.color.replace('#', '')})`}
                stroke={isSelected ? theme.palette.primary.main : 'rgba(0,0,0,0.1)'}
                strokeWidth={isSelected ? 0.5 : 0.1}
                filter={isSelected ? 'url(#glow)' : undefined}
              />
              {/* Stem */}
              <circle cx={tree.x} cy={tree.y} r={0.3} fill="rgba(0,0,0,0.3)" />
            </g>
          );
        })}

        {/* --- Labels --- */}
        {settings.showLabels && (
          <g pointerEvents="none">
            <text x="5" y="5" fontSize="3" fontWeight="bold" fill={theme.palette.text.secondary} opacity="0.5">Q1</text>
            <text x="95" y="5" fontSize="3" fontWeight="bold" fill={theme.palette.text.secondary} opacity="0.5" textAnchor="end">Q2</text>
            <text x="5" y="95" fontSize="3" fontWeight="bold" fill={theme.palette.text.secondary} opacity="0.5" dominantBaseline="text-after-edge">Q3</text>
            <text x="95" y="95" fontSize="3" fontWeight="bold" fill={theme.palette.text.secondary} opacity="0.5" textAnchor="end" dominantBaseline="text-after-edge">Q4</text>
          </g>
        )}
      </svg>

      {/* --- Technical Overlay (Compass & Scale) --- */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, pointerEvents: 'none', opacity: 0.6 }}>
        <NavigationIcon sx={{ transform: 'rotate(45deg)', color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', fontWeight: 'bold', mt: -0.5 }}>N</Typography>
      </Box>

      <Box sx={{ position: 'absolute', bottom: 16, left: 16, pointerEvents: 'none' }}>
        <Box sx={{ width: '100px', height: '2px', bgcolor: 'text.primary', mb: 0.5, position: 'relative' }}>
            <Box sx={{ position: 'absolute', left: 0, bottom: 0, width: 1, height: 5, bgcolor: 'text.primary' }} />
            <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: 1, height: 5, bgcolor: 'text.primary' }} />
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>10m Scale</Typography>
      </Box>

      {/* --- Tooltip --- */}
      {hoveredNode && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            left: `${hoveredNode.x}%`,
            top: `${hoveredNode.y}%`,
            transform: 'translate(-50%, -130%)',
            p: 1.5,
            zIndex: 20,
            pointerEvents: 'none',
            minWidth: 140,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            border: `2px solid ${hoveredNode.color}`
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
            {hoveredNode.species}
          </Typography>
          <Box sx={{ mt: 0.5, display: 'grid', gridTemplateColumns: 'auto auto', gap: '4px 12px' }}>
            <Typography variant="caption" color="text.secondary">ID:</Typography>
            <Typography variant="caption" fontWeight="bold">{hoveredNode.id}</Typography>
            <Typography variant="caption" color="text.secondary">Height:</Typography>
            <Typography variant="caption" fontWeight="bold">{hoveredNode.height.toFixed(1)}m</Typography>
            <Typography variant="caption" color="text.secondary">GBH:</Typography>
            <Typography variant="caption" fontWeight="bold">{hoveredNode.gbh}cm</Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default PlotVisualizer;