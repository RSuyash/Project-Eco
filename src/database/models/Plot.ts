// src/database/models/Plot.ts

export interface Plot {
  id: string;
  plotId: string; // e.g. "P01", "P02"
  locationName: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  size?: string; // e.g. "10x10m", "20x20m"
  elevation?: number; // in meters
  habitatType?: string;
  dominantSpecies?: string;
  samplingDate?: string; // ISO date string
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Quadrant {
  id: string;
  plotId: string;
  quadrantId: string; // e.g. "Q1", "Q2", "Q3", "Q4"
  description?: string; // e.g. "North-East", "South-West"
  area?: string; // area in m²
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Subplot {
  id: string;
  plotId: string;
  quadrantId: string;
  subplotId: string; // e.g. "SP1", "SP2", "SP3", "SP4"
  layerType: string; // Herb, Grass, Litter, Bare Soil, etc.
  speciesCategory?: string;
  count?: number;
  coverPercentage?: number;
  avgHeight?: number; // in cm
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CanopyCoverData {
  id: string;
  plotId: string;
  quadrantId: string;
  subplotId: string;
  coverType: 'herb' | 'grass' | 'shrub' | 'tree' | 'litter' | 'bare_soil' | 'other';
  speciesName?: string;
  coverPercentage: number;
  measurementDate: string; // ISO date string
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CanopyCoverAnalysisResult {
  id: string;
  plotId: string;
  quadrantId?: string;
  subplotId?: string;
  totalCoverPercentage: number;
  herbCover: number;
  grassCover: number;
  shrubCover: number;
  treeCover: number;
  litterCover: number;
  bareSoilCover: number;
  otherCover: number;
  diversityIndex?: number;
  evenness?: number;
  analysisDate: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CanopyPhotoAnalysis {
  id: string;
  plotId: string;
  quadrantId?: string;
  subplotId?: string;
  imageFileName: string;
  imageUrl: string;
  canopyCoverPercentage: number;
  estimatedLAI: number;
  gapFraction: number;
  analysisDate: string; // ISO date string
  analysisImagePath?: string; // Path to the analyzed image with visual output
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}