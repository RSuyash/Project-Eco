// src/components/PlotVisualizer/types.ts

export interface WoodyData {
  Plot_ID: string;
  Location_Name: string;
  Quad_ID: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  Species_Scientific: string;
  Growth_Form: 'Tree' | 'Shrub' | 'Sapling' | 'Climber' | 'Ficus' | string;
  Tree_ID: string;
  Total_GBH_cm: number;
  Height_m?: number;
}

export interface HerbData {
  Plot_ID: string;
  Location_Name: string;
  Subplot_ID: 'SP1' | 'SP2' | 'SP3' | 'SP4';
  Layer_Type: 'Herb' | 'Grass' | 'Litter' | 'Bare Soil';
  'Count_or_Cover%': number;
}

export interface PlotData {
  id: string;
  name: string;
  location: string;
  woodySpeciesCount: number;
  herbSpeciesCount: number;
  dominantWoodySpecies: string;
}

export type InteractionMode = 'view' | 'select' | 'edit';

// --- Visual Nodes for Rendering ---

export interface VisualTreeNode {
  id: string;
  species: string;
  x: number; // 0-100% (Relative to plot container)
  y: number; // 0-100%
  radius: number; // % width of plot
  height: number; // meters (for shadow calculation)
  color: string;
  gbh: number;
  quadrant: string;
}

export interface VisualSubplotNode {
  id: string;
  x: number; // 0-100%
  y: number; // 0-100%
  width: number; // %
  height: number; // %
  data: { label: string; value: number; color: string }[];
}