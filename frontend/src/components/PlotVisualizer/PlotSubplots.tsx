import React from 'react';
import { useTheme } from '@mui/material';
import { PlotConfiguration } from '../../types/plot';

interface PlotSubplotsProps {
    config: PlotConfiguration;
    showSubplots?: boolean;
}

const PlotSubplots: React.FC<PlotSubplotsProps> = ({
    config,
    showSubplots = true
}) => {
    const theme = useTheme();

    if (!showSubplots) return null;

    return (
        <g className="plot-subplots-layer">
            <defs>
                <pattern id="techHatch" patternUnits="userSpaceOnUse" width="2" height="2" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="2" stroke={theme.palette.secondary.main} strokeWidth="0.5" opacity="0.5" />
                </pattern>
            </defs>

            {config.subdivisions.map(sp => (
                <g key={sp.id}>
                    {/* Subplot Area */}
                    <rect
                        x={sp.position_x}
                        y={sp.position_y}
                        width={sp.dimensions.width}
                        height={sp.dimensions.height}
                        fill="url(#techHatch)"
                        stroke={theme.palette.secondary.main}
                        strokeWidth="0.05"
                    />

                    {/* Label Badge */}
                    <rect
                        x={sp.position_x + 0.1}
                        y={sp.position_y + (sp.dimensions.height / 2) - 0.2}
                        width={sp.dimensions.width - 0.2}
                        height={0.4}
                        fill={theme.palette.background.paper}
                        stroke={theme.palette.secondary.light}
                        strokeWidth="0.02"
                        rx="0.05"
                    />
                    <text
                        x={sp.position_x + (sp.dimensions.width / 2)}
                        y={sp.position_y + (sp.dimensions.height / 2)}
                        fontSize="0.25"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={theme.palette.secondary.main}
                    >
                        {sp.id}
                    </text>
                </g>
            ))}
        </g>
    );
};

export default PlotSubplots;
