// src/database/index.ts

import DatabaseService from './services/DatabaseService';
import SpeciesAnalysisService from './services/SpeciesAnalysisService';
import SpeciesRepository from './repositories/SpeciesRepository';
import PlotRepository from './repositories/PlotRepository';
import { Project } from './models/Project';
import { Species, SpeciesRecord } from './models/Species';
import { Plot, Quadrant, Subplot } from './models/Plot';

export {
  // Services
  DatabaseService,
  SpeciesAnalysisService,
  
  // Repositories
  SpeciesRepository,
  PlotRepository,
  
  // Models
  Project,
  Species,
  SpeciesRecord,
  Plot,
  Quadrant,
  Subplot
};

export type {
  // Interfaces
  IDatabaseService,
  ISpeciesAnalysisService
} from './services/DatabaseService';
export type { ISpeciesRepository } from './repositories/SpeciesRepository';
export type { IPlotRepository } from './repositories/PlotRepository';

// Initialize the database when the module is loaded
DatabaseService.initialize()
  .then(() => console.log('Database initialized successfully'))
  .catch(error => console.error('Failed to initialize database:', error));