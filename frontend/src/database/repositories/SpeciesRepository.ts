// src/database/repositories/SpeciesRepository.ts

import { Species, SpeciesRecord } from '../models/Species';

export interface ISpeciesRepository {
  createSpecies(species: Omit<Species, 'id'>): Promise<Species>;
  getSpeciesById(id: string): Promise<Species | null>;
  getAllSpecies(): Promise<Species[]>;
  updateSpecies(species: Species): Promise<Species>;
  deleteSpecies(id: string): Promise<void>;
  
  createSpeciesRecord(record: Omit<SpeciesRecord, 'id'>): Promise<SpeciesRecord>;
  getSpeciesRecordById(id: string): Promise<SpeciesRecord | null>;
  getSpeciesRecordsByPlot(plotId: string): Promise<SpeciesRecord[]>;
  getSpeciesRecordsBySpecies(speciesId: string): Promise<SpeciesRecord[]>;
  getSpeciesRecordsByQuadrant(quadrantId: string): Promise<SpeciesRecord[]>;
  getSpeciesRecordsBySubplot(subplotId: string): Promise<SpeciesRecord[]>;
  updateSpeciesRecord(record: SpeciesRecord): Promise<SpeciesRecord>;
  deleteSpeciesRecord(id: string): Promise<void>;
}

class SpeciesRepository implements ISpeciesRepository {
  async createSpecies(species: Omit<Species, 'id'>): Promise<Species> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getSpeciesById(id: string): Promise<Species | null> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getAllSpecies(): Promise<Species[]> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async updateSpecies(species: Species): Promise<Species> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async deleteSpecies(id: string): Promise<void> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async createSpeciesRecord(record: Omit<SpeciesRecord, 'id'>): Promise<SpeciesRecord> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getSpeciesRecordById(id: string): Promise<SpeciesRecord | null> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getSpeciesRecordsByPlot(plotId: string): Promise<SpeciesRecord[]> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getSpeciesRecordsBySpecies(speciesId: string): Promise<SpeciesRecord[]> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getSpeciesRecordsByQuadrant(quadrantId: string): Promise<SpeciesRecord[]> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getSpeciesRecordsBySubplot(subplotId: string): Promise<SpeciesRecord[]> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async updateSpeciesRecord(record: SpeciesRecord): Promise<SpeciesRecord> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async deleteSpeciesRecord(id: string): Promise<void> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
}

export default new SpeciesRepository();