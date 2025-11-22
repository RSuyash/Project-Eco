import { WoodyData, HerbData } from './types';

// --- Types ---

export interface PieSliceData {
  label: string;
  value: number;
  color: string;
  meta?: any; // For storing raw values like exact GBH
}

export interface SubplotProcessed {
  id: string;
  position: 'Q1_CORNER' | 'Q2_CORNER' | 'Q3_CORNER' | 'Q4_CORNER';
  data: PieSliceData[];
}

export interface WoodyGlyphProcessed {
  id: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  data: PieSliceData[];
  totalValue: number;
}

export interface PlotVisualizationData {
  woodyGlyphs: WoodyGlyphProcessed[];
  subplots: SubplotProcessed[];
  woodyLegend: Map<string, string>;
  herbLegend: Map<string, string>;
}

// --- Constants ---

// Scientific color palette for vegetation (distinct but cohesive)
const HERB_LEGEND_COLORS = new Map<string, string>([
  ['Herb', '#81c784'],      // Light Green
  ['Grass', '#cddc39'],     // Lime
  ['Litter', '#ffb74d'],    // Orange/Brown
  ['Bare Soil', '#a1887f'], // Brown
  ['Rock', '#90a4ae'],      // Grey
]);

// High-contrast palette for species differentiation
const WOODY_COLOR_PALETTE = [
  '#2e7d32', // Dark Green
  '#00838f', // Cyan
  '#1565c0', // Blue
  '#6a1b9a', // Purple
  '#ad1457', // Pink
  '#c62828', // Red
  '#ef6c00', // Orange
  '#f9a825', // Yellow
  '#455a64', // Blue Grey
  '#558b2f', // Olive
];

// --- Helpers ---

function getWoodyColor(species: string, legendMap: Map<string, string>): string {
  if (!legendMap.has(species)) {
    const nextColor = WOODY_COLOR_PALETTE[legendMap.size % WOODY_COLOR_PALETTE.length];
    legendMap.set(species, nextColor);
  }
  return legendMap.get(species)!;
}

// --- Main Processor ---

export const processPlotData = (
  woodyData: WoodyData[],
  herbData: HerbData[],
  plotId: string
): PlotVisualizationData => {
  // 1. Filter Data for Current Plot
  const plotHerbData = herbData.filter(item => item.Plot_ID === plotId);
  const plotWoodyData = woodyData.filter(item => item.Plot_ID === plotId);

  // 2. Build Legends (Dynamically for Woody, Statically for Herb)
  const woodyLegend = new Map<string, string>();
  
  // Sort species alphabetically for consistent legend ordering
  const uniqueSpecies = [...new Set(plotWoodyData.map(item => item.Species_Scientific))].sort();
  uniqueSpecies.forEach(species => getWoodyColor(species, woodyLegend));

  // 3. Process Subplots (Corner Data)
  const subplots: SubplotProcessed[] = (['SP1', 'SP2', 'SP3', 'SP4'] as const)
    .map(subplotId => {
      const dataForSubplot = plotHerbData.filter(item => item.Subplot_ID === subplotId);
      
      // Explicit mapping of Subplot ID to Visual Position
      let position: 'Q1_CORNER' | 'Q2_CORNER' | 'Q3_CORNER' | 'Q4_CORNER' = 'Q1_CORNER';
      if (subplotId === 'SP2') position = 'Q2_CORNER';
      if (subplotId === 'SP3') position = 'Q3_CORNER';
      if (subplotId === 'SP4') position = 'Q4_CORNER';

      return {
        id: subplotId,
        position,
        data: dataForSubplot.map(item => ({
          label: item.Layer_Type,
          value: item['Count_or_Cover%'],
          color: HERB_LEGEND_COLORS.get(item.Layer_Type) || '#e0e0e0',
        })).sort((a, b) => b.value - a.value), // Sort by cover %
      };
    })
    .filter(subplot => subplot.data.length > 0);

  // 4. Process Woody Glyphs (Trees/Shrubs inside quadrants)
  const woodyGlyphs: WoodyGlyphProcessed[] = (['Q1', 'Q2', 'Q3', 'Q4'] as const)
    .map(quadId => {
      const dataForQuad = plotWoodyData.filter(item => item.Quad_ID === quadId);

      const individualTreeData = dataForQuad.map(item => ({
        label: item.Species_Scientific,
        value: item.Total_GBH_cm, // Used for radius sizing
        color: getWoodyColor(item.Species_Scientific, woodyLegend),
        meta: {
          treeId: item.Tree_ID,
          growthForm: item.Growth_Form
        }
      }));

      return {
        id: quadId,
        data: individualTreeData,
        totalValue: individualTreeData.reduce((sum, item) => sum + item.value, 0),
      };
    });

  return {
    woodyGlyphs,
    subplots,
    woodyLegend,
    herbLegend: HERB_LEGEND_COLORS,
  };
};