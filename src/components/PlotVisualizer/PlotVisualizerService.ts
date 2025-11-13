// src/components/PlotVisualizer/PlotVisualizerService.ts

import { WoodyData, HerbData } from './types';

// Define the data structures
interface ProcessedSubplot {
  id: string;
  position: 'Q1_CORNER' | 'Q2_CORNER' | 'Q3_CORNER' | 'Q4_CORNER';
  size: number;
  data: {
    label: string;
    value: number;
    color: string;
  }[];
}

interface ProcessedWoodyGlyph {
  id: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  totalValue: number;
}

interface PlotVisualizationData {
  woodyGlyphs: ProcessedWoodyGlyph[];
  subplots: ProcessedSubplot[];
  woodyLegend: Map<string, string>;
  herbLegend: Map<string, string>;
}

const HERB_LEGEND_COLORS = new Map<string, string>([
  ['Herb', '#34d399'], // emerald-400
  ['Grass', '#a3e635'], // lime-500
  ['Litter', '#f59e0b'], // amber-500
  ['Bare Soil', '#92400e'], // amber-900
]);

const WOODY_COLOR_PALETTE = [
  '#2563eb', '#1d4ed8', '#0ea5e9', '#0891b2', '#10b981', '#059669', '#d97706',
  '#b45309', '#ef4444', '#dc2626', '#db2777', '#c026d3', '#7e22ce', '#581c87',
  '#64748b', '#334155', '#3f6c1c', '#f43f5e', '#65a30d', '#6d28d9'
];

function getWoodyColor(species: string, legendMap: Map<string, string>): string {
  if (!legendMap.has(species)) {
    const nextColor = WOODY_COLOR_PALETTE[legendMap.size % WOODY_COLOR_PALETTE.length];
    legendMap.set(species, nextColor);
  }
  return legendMap.get(species)!;
}

export const processPlotData = (
  woodyData: WoodyData[],
  herbData: HerbData[],
  plotId: string
): PlotVisualizationData => {
  // Process Herb Data for this plot
  const plotHerbData = herbData.filter(item => item.Plot_ID === plotId);
  const subplots: ProcessedSubplot[] = (['SP1', 'SP2', 'SP3', 'SP4'] as const)
    .map(subplotId => {
      const dataForSubplot = plotHerbData.filter(item => item.Subplot_ID === subplotId);
      return {
        id: subplotId,
        position: getSubplotPosition(subplotId),
        size: 1, // 1x1m
        data: dataForSubplot.map(item => ({
          label: item.Layer_Type,
          value: item['Count_or_Cover%'],
          color: HERB_LEGEND_COLORS.get(item.Layer_Type)!,
        })),
      };
    })
    .filter(subplot => subplot.data.length > 0); // Only include subplots with data

  // Process Woody Data for this plot - Keep individual trees, don't aggregate
  const plotWoodyData = woodyData.filter(item => item.Plot_ID === plotId);

  // Create legend only for species in this specific plot
  const woodyLegend = new Map<string, string>();
  const uniqueSpeciesInPlot = [...new Set(plotWoodyData.map(item => item.Species_Scientific))];
  uniqueSpeciesInPlot.forEach(species => {
    getWoodyColor(species, woodyLegend);
  });

  // Create woody glyphs where each tree is represented individually
  const woodyGlyphs: ProcessedWoodyGlyph[] = (['Q1', 'Q2', 'Q3', 'Q4'] as const)
    .map(quadId => {
      const dataForQuad = plotWoodyData.filter(item => item.Quad_ID === quadId);

      // Each tree becomes one data point with its actual GBH
      const individualTreeData = dataForQuad.map(item => ({
        label: item.Species_Scientific,
        value: item.Total_GBH_cm, // Use actual individual tree GBH
        color: getWoodyColor(item.Species_Scientific, woodyLegend),
      }));

      return {
        id: quadId as 'Q1' | 'Q2' | 'Q3' | 'Q4',
        data: individualTreeData,
        totalValue: individualTreeData.reduce((sum, item) => sum + item.value, 0),
      };
    });

  return {
    subplots,
    woodyGlyphs,
    woodyLegend,
    herbLegend: HERB_LEGEND_COLORS,
  };
};

export const getSubplotPosition = (subplotId: string): 'Q1_CORNER' | 'Q2_CORNER' | 'Q3_CORNER' | 'Q4_CORNER' => {
  switch (subplotId) {
    case 'SP1': return 'Q1_CORNER';
    case 'SP2': return 'Q2_CORNER';
    case 'SP3': return 'Q3_CORNER';
    case 'SP4': return 'Q4_CORNER';
    default: return 'Q1_CORNER';
  }
};