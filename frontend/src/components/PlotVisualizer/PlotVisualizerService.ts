import { WoodyData, HerbData, VisualTreeNode, VisualSubplotNode } from './types';

// --- Constants ---
export const HERB_LEGEND_COLORS = new Map<string, string>([
  ['Herb', '#a5d6a7'],      // Pastel Green
  ['Grass', '#e6ee9c'],     // Lime
  ['Litter', '#ffcc80'],    // Pale Orange
  ['Bare Soil', '#bcaaa4'], // Brown
  ['Rock', '#b0bec5'],      // Grey
]);

export const WOODY_COLOR_PALETTE = [
  '#2e7d32', '#00695c', '#1565c0', '#6a1b9a', '#c62828', 
  '#ef6c00', '#f9a825', '#455a64', '#558b2f', '#0277bd'
];

export interface PlotVisualizationData {
  trees: VisualTreeNode[];
  subplots: VisualSubplotNode[];
  woodyLegend: Map<string, string>;
  herbLegend: Map<string, string>;
}

// --- Physics Helper ---
// Distributes trees naturally so they don't overlap or look like a grid
export function distributeTreesInQuadrant(
  trees: VisualTreeNode[], 
  quadrant: string
): VisualTreeNode[] {
  // Define bounds (0-100 scale) with padding
  const bounds = {
    Q1: { xMin: 5, xMax: 45, yMin: 5, yMax: 45 },
    Q2: { xMin: 55, xMax: 95, yMin: 5, yMax: 45 },
    Q3: { xMin: 5, xMax: 45, yMin: 55, yMax: 95 },
    Q4: { xMin: 55, xMax: 95, yMin: 55, yMax: 95 },
  }[quadrant] || { xMin: 5, xMax: 95, yMin: 5, yMax: 95 };

  // 1. Randomize initial positions within bounds
  trees.forEach(tree => {
    tree.x = bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin);
    tree.y = bounds.yMin + Math.random() * (bounds.yMax - bounds.yMin);
  });

  // 2. Force Relaxation (Prevent Overlaps)
  const iterations = 15;
  for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < trees.length; j++) {
      for (let k = j + 1; k < trees.length; k++) {
        const a = trees[j];
        const b = trees[k];
        
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Min distance based on radius (visual size)
        const minDist = (a.radius + b.radius) * 1.1; 

        if (dist < minDist && dist > 0) {
          const force = (minDist - dist) / 2;
          const angle = Math.atan2(dy, dx);
          
          // Push apart
          a.x -= Math.cos(angle) * force;
          a.y -= Math.sin(angle) * force;
          b.x += Math.cos(angle) * force;
          b.y += Math.sin(angle) * force;
        }
      }
      // Constrain to bounds
      const t = trees[j];
      t.x = Math.max(bounds.xMin, Math.min(bounds.xMax, t.x));
      t.y = Math.max(bounds.yMin, Math.min(bounds.yMax, t.y));
    }
  }
  return trees;
}

// --- Main Processor ---
export const processPlotData = (
  woodyData: WoodyData[],
  herbData: HerbData[],
  plotId: string
): PlotVisualizationData => {
  const plotHerb = herbData.filter(d => d.Plot_ID === plotId);
  const plotWoody = woodyData.filter(d => d.Plot_ID === plotId);

  // Generate Legend
  const woodyLegend = new Map<string, string>();
  const uniqueSpecies = Array.from(new Set(plotWoody.map(d => d.Species_Scientific))).sort();
  uniqueSpecies.forEach((s, i) => woodyLegend.set(s, WOODY_COLOR_PALETTE[i % WOODY_COLOR_PALETTE.length]));

  // Process Trees
  let allVisualTrees: VisualTreeNode[] = [];
  ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
    const quadData = plotWoody.filter(d => d.Quad_ID === q);
    
    const nodes: VisualTreeNode[] = quadData.map(d => ({
      id: d.Tree_ID,
      species: d.Species_Scientific,
      x: 0, // Placeholder
      y: 0, // Placeholder
      radius: Math.max(1.5, Math.log(d.Total_GBH_cm || 10) * 1.2), // Log scale for realistic size
      height: d.Height_m || (Math.random() * 15 + 2),
      color: woodyLegend.get(d.Species_Scientific) || '#ccc',
      gbh: d.Total_GBH_cm,
      quadrant: q
    }));

    // Distribute naturally
    const distributed = distributeTreesInQuadrant(nodes, q);
    allVisualTrees = [...allVisualTrees, ...distributed];
  });

  // Process Subplots
  const subplots: VisualSubplotNode[] = [];
  ['SP1', 'SP2', 'SP3', 'SP4'].forEach((spId, i) => {
    const spData = plotHerb.filter(d => d.Subplot_ID === spId);
    // Fixed corners for subplots
    const pos = [
        { x: 2, y: 2 }, { x: 88, y: 2 }, { x: 2, y: 88 }, { x: 88, y: 88 }
    ][i];

    if (spData.length > 0 || true) { // Show placeholders even if empty
        subplots.push({
            id: spId,
            x: pos.x,
            y: pos.y,
            width: 10,
            height: 10,
            data: spData.map(d => ({
                label: d.Layer_Type,
                value: d['Count_or_Cover%'],
                color: HERB_LEGEND_COLORS.get(d.Layer_Type) || '#ccc'
            }))
        });
    }
  });

  return {
    trees: allVisualTrees,
    subplots,
    woodyLegend,
    herbLegend: HERB_LEGEND_COLORS
  };
};