import { WoodyData, HerbData, VisualTreeNode, VisualSubplotNode } from './types';

// --- Constants ---
export const HERB_LEGEND_COLORS = new Map<string, string>([
  ['Herb', '#a5d6a7'],
  ['Grass', '#e6ee9c'],
  ['Litter', '#ffcc80'],
  ['Bare Soil', '#bcaaa4'],
  ['Rock', '#b0bec5'],
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
export function distributeTreesInQuadrant(
  trees: VisualTreeNode[],
  quadrant: string,
  plotWidth: number = 10,
  plotHeight: number = 10
): VisualTreeNode[] {
  // Calculate quadrant bounds in METERS
  const midX = plotWidth / 2;
  const midY = plotHeight / 2;
  const padding = 0.5; // 0.5m padding from edges

  const bounds = {
    Q1: { xMin: padding, xMax: midX - padding, yMin: padding, yMax: midY - padding },           // Top-Left
    Q2: { xMin: midX + padding, xMax: plotWidth - padding, yMin: padding, yMax: midY - padding }, // Top-Right
    Q3: { xMin: padding, xMax: midX - padding, yMin: midY + padding, yMax: plotHeight - padding }, // Bottom-Left
    Q4: { xMin: midX + padding, xMax: plotWidth - padding, yMin: midY + padding, yMax: plotHeight - padding }, // Bottom-Right
  }[quadrant] || { xMin: 0, xMax: plotWidth, yMin: 0, yMax: plotHeight };

  // Distribute with Subplot Exclusion
  trees.forEach(tree => {
    let validPosition = false;
    let attempts = 0;

    while (!validPosition && attempts < 20) {
      // Generate random position
      const x = bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin);
      const y = bounds.yMin + Math.random() * (bounds.yMax - bounds.yMin);

      // Check Subplot Collision (1x1m corners)
      // SP1 (0,0) to (1,1)
      // SP2 (9,0) to (10,1)
      // SP3 (0,9) to (1,10)
      // SP4 (9,9) to (10,10)
      // We add a small buffer (1.2m) to be safe
      const buffer = 1.2;
      const inSP1 = x < buffer && y < buffer;
      const inSP2 = x > (plotWidth - buffer) && y < buffer;
      const inSP3 = x < buffer && y > (plotHeight - buffer);
      const inSP4 = x > (plotWidth - buffer) && y > (plotHeight - buffer);

      if (!inSP1 && !inSP2 && !inSP3 && !inSP4) {
        tree.x = x;
        tree.y = y;
        validPosition = true;
      }
      attempts++;
    }

    // Fallback if placement failed (should be rare)
    if (!validPosition) {
      tree.x = (bounds.xMin + bounds.xMax) / 2;
      tree.y = (bounds.yMin + bounds.yMax) / 2;
    }
  });

  // Simple collision avoidance between trees
  const iterations = 15;
  for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < trees.length; j++) {
      for (let k = j + 1; k < trees.length; k++) {
        const a = trees[j];
        const b = trees[k];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Scale radius for collision check (visual radius is pixels, map is meters)
        // Approximate: 1m = 50px? Let's just use a small meter value for collision
        const minSep = 0.5; // Minimum 50cm separation

        if (dist < minSep && dist > 0) {
          const force = (minSep - dist) / 2;
          const angle = Math.atan2(dy, dx);
          a.x = Math.max(bounds.xMin, Math.min(bounds.xMax, a.x - Math.cos(angle) * force));
          a.y = Math.max(bounds.yMin, Math.min(bounds.yMax, a.y - Math.sin(angle) * force));
          b.x = Math.max(bounds.xMin, Math.min(bounds.xMax, b.x + Math.cos(angle) * force));
          b.y = Math.max(bounds.yMin, Math.min(bounds.yMax, b.y + Math.sin(angle) * force));
        }
      }
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

  // Legend
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
      x: 0, y: 0,
      radius: Math.max(0.15, Math.log(d.Total_GBH_cm || 10) * 0.05), // Scale radius to meters (approx)
      height: d.Height_m || (Math.random() * 15 + 2),
      color: woodyLegend.get(d.Species_Scientific) || '#ccc',
      gbh: d.Total_GBH_cm,
      quadrant: q
    }));
    allVisualTrees = [...allVisualTrees, ...distributeTreesInQuadrant(nodes, q)];
  });

  // Process Subplots (Exact Corners Logic in Meters)
  // Assuming 10x10m plot, 1x1m subplots
  const subplots: VisualSubplotNode[] = [];

  // Standard Corner Configurations (Meters)
  const subplotCorners = [
    { id: 'SP1', x: 0, y: 0 },   // Top-Left
    { id: 'SP2', x: 9, y: 0 },   // Top-Right (starts at 9m, ends at 10m)
    { id: 'SP3', x: 0, y: 9 },   // Bottom-Left
    { id: 'SP4', x: 9, y: 9 }    // Bottom-Right
  ];

  subplotCorners.forEach((cfg) => {
    // Find matching data
    const spData = plotHerb.filter(d => d.Subplot_ID === cfg.id || d.Subplot_ID.includes(cfg.id));

    subplots.push({
      id: cfg.id,
      x: cfg.x,
      y: cfg.y,
      width: 1, // 1 meter
      height: 1, // 1 meter
      data: spData.map(d => ({
        label: d.Layer_Type,
        value: d['Count_or_Cover%'],
        color: HERB_LEGEND_COLORS.get(d.Layer_Type) || '#ccc'
      }))
    });
  });

  return {
    trees: allVisualTrees,
    subplots,
    woodyLegend,
    herbLegend: HERB_LEGEND_COLORS
  };
};