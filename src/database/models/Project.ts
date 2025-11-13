// src/database/models/Project.ts

import { Species, SpeciesRecord } from './Species';
import { Plot, Quadrant, Subplot } from './Plot';

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  status: 'active' | 'completed' | 'archived';
  objectives: string[];
  methods: string[];
  team: string[];
  location: string;
  plots: Plot[];
  quadrants: Quadrant[];
  subplots: Subplot[];
  species: Species[];
  records: SpeciesRecord[];
  metadata: {
    totalPlots: number;
    totalSpecies: number;
    totalRecords: number;
    lastUpdated: string; // ISO date string
    lastSynced?: string; // ISO date string
    dataQualityScore?: number; // 0-100
  };
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}