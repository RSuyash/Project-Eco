import React from 'react';
import { useTheme, alpha } from '@mui/material';
import { VisualTreeNode } from './types';

interface PlotTreesProps {
    trees: VisualTreeNode[];
    selectedTreeIds: string[];
    highlightedSpecies: string | null;
    onTreeSelect: (id: string, multi: boolean) => void;
    onHover: (tree: VisualTreeNode | null) => void;
    showTrees?: boolean;
}

const PlotTrees: React.FC<PlotTreesProps> = ({
    trees,
    selectedTreeIds,
    highlightedSpecies,
    onTreeSelect,
    onHover,
    showTrees = true
}) => {
    const theme = useTheme();

    if (!showTrees) return null;

    return (
        <g className="plot-trees-layer">
            {trees.map((tree) => {
                const isSelected = selectedTreeIds.includes(tree.id);
                const isDimmed = highlightedSpecies && tree.species !== highlightedSpecies;
                const shadowOff = tree.height * 0.15;

                return (
                    <g
                        key={tree.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            onTreeSelect(tree.id, e.shiftKey || e.ctrlKey);
                        }}
                        onMouseEnter={() => onHover(tree)}
                        onMouseLeave={() => onHover(null)}
                        style={{
                            opacity: isDimmed ? 0.1 : 1,
                            transition: 'opacity 0.2s ease',
                            cursor: 'pointer'
                        }}
                    >
                        {/* Tree Canopy */}
                        <circle
                            cx={tree.x}
                            cy={tree.y}
                            r={tree.radius}
                            fill={tree.color}
                            stroke="white"
                            strokeWidth={0.15}
                        />

                        {/* Selection Glow Ring */}
                        {isSelected && (
                            <circle
                                cx={tree.x}
                                cy={tree.y}
                                r={tree.radius + 0.5}
                                fill="none"
                                stroke={theme.palette.primary.main}
                                strokeWidth="0.2"
                                strokeDasharray="1,1"
                            />
                        )}

                        {/* Trunk/Stem Center Point */}
                        <circle cx={tree.x} cy={tree.y} r={0.2} fill={theme.palette.common.black} opacity="0.5" />
                    </g>
                );
            })}
        </g>
    );
};

export default PlotTrees;
