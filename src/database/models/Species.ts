// src/database/models/Species.ts

export interface Species {
  id: string;
  scientificName: string;
  commonName: string;
  growthForm: string; // Tree, Shrub, Herb, Grass, etc.
  family?: string;
  conservationStatus?: string;
}

export interface SpeciesRecord {
  id: string;
  speciesId: string;
  plotId: string;
  quadrantId: string;
  subplotId?: string; // For herb/floor vegetation
  treeId?: string; // For woody vegetation
  height?: number; // in meters
  gbh?: number; // Girth at Breast Height in cm
  condition?: string; // Live, Dead, Damaged, etc.
  stems?: number; // Number of stems
  totalGbh?: number; // Sum of all stems
  coverPercentage?: number; // For herb/floor vegetation
  avgHeight?: number; // Average height in cm for herb/floor
  notes?: string;
  remarks?: string;
  timestamp: string; // ISO date string
}