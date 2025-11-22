import React from 'react';
import { useTheme, alpha } from '@mui/material';
import { PlotConfiguration } from '../../types/plot';

interface PlotGridProps {
    config: PlotConfiguration;
    width: number;
    height: number;
    showGrid?: boolean;
    showQuadrants?: boolean;
}

const PlotGrid: React.FC<PlotGridProps> = ({
    config,
    width,
    height,
    showGrid = true,
    showQuadrants = true
}) => {
    const theme = useTheme();

    return (
        <g className="plot-grid-layer">
            {/* --- Base Frame --- */}
            <rect
                x="0"
                y="0"
                width={width}
                height={height}
                fill="none"
                stroke={theme.palette.text.primary}
                strokeWidth="0.05"
            />

            {/* --- Dynamic Grid Lines --- */}
            {showGrid && (
                <g stroke={alpha(theme.palette.text.secondary, 0.1)} strokeWidth="0.02">
                    {Array.from({ length: config.grid.cols }).map((_, i) => {
                        const x = (width / config.grid.cols) * (i + 1);
                        return <line key={`v-${i}`} x1={x} y1="0" x2={x} y2={height} />;
                    })}
                    {Array.from({ length: config.grid.rows }).map((_, i) => {
                        const y = (height / config.grid.rows) * (i + 1);
                        return <line key={`h-${i}`} x1="0" y1={y} x2={width} y2={y} />;
                    })}
                </g>
            )}

            {/* --- Quadrant Dividers (Standard 4-way split) --- */}
            {showQuadrants && (
                <g stroke={theme.palette.primary.main} strokeWidth="0.05" strokeDasharray="1,1" opacity="0.5">
                    <line x1={width / 2} y1="0" x2={width / 2} y2={height} />
                    <line x1="0" y1={height / 2} x2={width} y2={height / 2} />

                    {/* Quadrant Labels */}
                    <text x={width * 0.25} y={height * 0.25} fontSize="1.5" fontWeight="bold" fill={theme.palette.primary.main} opacity="0.1" textAnchor="middle" dominantBaseline="middle">Q1</text>
                    <text x={width * 0.75} y={height * 0.25} fontSize="1.5" fontWeight="bold" fill={theme.palette.primary.main} opacity="0.1" textAnchor="middle" dominantBaseline="middle">Q2</text>
                    <text x={width * 0.25} y={height * 0.75} fontSize="1.5" fontWeight="bold" fill={theme.palette.primary.main} opacity="0.1" textAnchor="middle" dominantBaseline="middle">Q3</text>
                    <text x={width * 0.75} y={height * 0.75} fontSize="1.5" fontWeight="bold" fill={theme.palette.primary.main} opacity="0.1" textAnchor="middle" dominantBaseline="middle">Q4</text>
                </g>
            )}
        </g>
    );
};

export default PlotGrid;
