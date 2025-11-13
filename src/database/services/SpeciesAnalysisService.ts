// src/database/services/SpeciesAnalysisService.ts

import { Species, SpeciesRecord } from '../models/Species';
import DatabaseService from './DatabaseService';

export interface ISpeciesAnalysisService {
  getSpeciesRichnessByPlot(projectId: string, plotId: string): Promise<number>;
  getSpeciesRichnessByQuadrant(projectId: string, plotId: string, quadrantId: string): Promise<number>;
  getSpeciesRichnessBySubplot(projectId: string, plotId: string, quadrantId: string, subplotId: string): Promise<number>;
  getSpeciesAbundanceByPlot(projectId: string, plotId: string): Promise<Array<{species: Species, count: number}>>;
  getCommonSpecies(projectId: string, threshold?: number): Promise<Species[]>;
  getRareSpecies(projectId: string, threshold?: number): Promise<Species[]>;
  getSpeciesCompositionByPlot(projectId: string): Promise<Record<string, {species: Species, plotCounts: Record<string, number>}>>;
}

class SpeciesAnalysisService implements ISpeciesAnalysisService {
  private dbService = DatabaseService;
  
  async getSpeciesRichnessByPlot(projectId: string, plotId: string): Promise<number> {
    const records = await this.dbService.withTransaction('records', 'readonly', (store) => {
      return new Promise<SpeciesRecord[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allRecords = request.result as SpeciesRecord[];
          const filtered = allRecords.filter(r => r.plotId === plotId);
          resolve(filtered);
        };
        request.onerror = () => reject(request.error);
      });
    });
    
    // Count unique species
    const uniqueSpeciesIds = new Set(records.map(r => r.speciesId));
    return uniqueSpeciesIds.size;
  }
  
  async getSpeciesRichnessByQuadrant(projectId: string, plotId: string, quadrantId: string): Promise<number> {
    const records = await this.dbService.withTransaction('records', 'readonly', (store) => {
      return new Promise<SpeciesRecord[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allRecords = request.result as SpeciesRecord[];
          const filtered = allRecords.filter(r => r.plotId === plotId && r.quadrantId === quadrantId);
          resolve(filtered);
        };
        request.onerror = () => reject(request.error);
      });
    });
    
    // Count unique species
    const uniqueSpeciesIds = new Set(records.map(r => r.speciesId));
    return uniqueSpeciesIds.size;
  }
  
  async getSpeciesRichnessBySubplot(projectId: string, plotId: string, quadrantId: string, subplotId: string): Promise<number> {
    const records = await this.dbService.withTransaction('records', 'readonly', (store) => {
      return new Promise<SpeciesRecord[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allRecords = request.result as SpeciesRecord[];
          const filtered = allRecords.filter(r => r.plotId === plotId && r.quadrantId === quadrantId && r.subplotId === subplotId);
          resolve(filtered);
        };
        request.onerror = () => reject(request.error);
      });
    });
    
    // Count unique species
    const uniqueSpeciesIds = new Set(records.map(r => r.speciesId));
    return uniqueSpeciesIds.size;
  }
  
  async getSpeciesAbundanceByPlot(projectId: string, plotId: string): Promise<Array<{species: Species, count: number}>> {
    const records = await this.dbService.withTransaction('records', 'readonly', (store) => {
      return new Promise<SpeciesRecord[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allRecords = request.result as SpeciesRecord[];
          const filtered = allRecords.filter(r => r.plotId === plotId);
          resolve(filtered);
        };
        request.onerror = () => reject(request.error);
      });
    });
    
    // Count occurrences of each species
    const speciesCounts: Record<string, number> = {};
    for (const record of records) {
      speciesCounts[record.speciesId] = (speciesCounts[record.speciesId] || 0) + 1;
    }
    
    // Get species details
    const speciesDetails: Array<{species: Species, count: number}> = [];
    for (const [speciesId, count] of Object.entries(speciesCounts)) {
      const species = await this.dbService.withTransaction('species', 'readonly', (store) => {
        return new Promise<Species | null>((resolve, reject) => {
          const request = store.get(speciesId);
          request.onsuccess = () => resolve(request.result as Species || null);
          request.onerror = () => reject(request.error);
        });
      });
      
      if (species) {
        speciesDetails.push({ species, count });
      }
    }
    
    return speciesDetails;
  }
  
  async getCommonSpecies(projectId: string, threshold: number = 5): Promise<Species[]> {
    // Get all records
    const records = await this.dbService.withTransaction('records', 'readonly', (store) => {
      return new Promise<SpeciesRecord[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allRecords = request.result as SpeciesRecord[];
          resolve(allRecords);
        };
        request.onerror = () => reject(request.error);
      });
    });
    
    // Count occurrences of each species
    const speciesCounts: Record<string, number> = {};
    for (const record of records) {
      speciesCounts[record.speciesId] = (speciesCounts[record.speciesId] || 0) + 1;
    }
    
    // Find species that meet threshold
    const commonSpeciesIds = Object.entries(speciesCounts)
      .filter(([_, count]) => count >= threshold)
      .map(([id, _]) => id);
    
    // Get species details
    const commonSpecies: Species[] = [];
    for (const speciesId of commonSpeciesIds) {
      const species = await this.dbService.withTransaction('species', 'readonly', (store) => {
        return new Promise<Species | null>((resolve, reject) => {
          const request = store.get(speciesId);
          request.onsuccess = () => resolve(request.result as Species || null);
          request.onerror = () => reject(request.error);
        });
      });
      
      if (species) {
        commonSpecies.push(species);
      }
    }
    
    return commonSpecies;
  }
  
  async getRareSpecies(projectId: string, threshold: number = 2): Promise<Species[]> {
    // Get all records
    const records = await this.dbService.withTransaction('records', 'readonly', (store) => {
      return new Promise<SpeciesRecord[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allRecords = request.result as SpeciesRecord[];
          resolve(allRecords);
        };
        request.onerror = () => reject(request.error);
      });
    });
    
    // Count occurrences of each species
    const speciesCounts: Record<string, number> = {};
    for (const record of records) {
      speciesCounts[record.speciesId] = (speciesCounts[record.speciesId] || 0) + 1;
    }
    
    // Find species below threshold
    const rareSpeciesIds = Object.entries(speciesCounts)
      .filter(([_, count]) => count <= threshold)
      .map(([id, _]) => id);
    
    // Get species details
    const rareSpecies: Species[] = [];
    for (const speciesId of rareSpeciesIds) {
      const species = await this.dbService.withTransaction('species', 'readonly', (store) => {
        return new Promise<Species | null>((resolve, reject) => {
          const request = store.get(speciesId);
          request.onsuccess = () => resolve(request.result as Species || null);
          request.onerror = () => reject(request.error);
        });
      });
      
      if (species) {
        rareSpecies.push(species);
      }
    }
    
    return rareSpecies;
  }
  
  async getSpeciesCompositionByPlot(projectId: string): Promise<Record<string, {species: Species, plotCounts: Record<string, number>}>> {
    // Get all records
    const records = await this.dbService.withTransaction('records', 'readonly', (store) => {
      return new Promise<SpeciesRecord[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allRecords = request.result as SpeciesRecord[];
          resolve(allRecords);
        };
        request.onerror = () => reject(request.error);
      });
    });
    
    // Group by species and count occurrences per plot
    const composition: Record<string, {species: Species, plotCounts: Record<string, number>}> = {};
    
    for (const record of records) {
      if (!composition[record.speciesId]) {
        const species = await this.dbService.withTransaction('species', 'readonly', (store) => {
          return new Promise<Species | null>((resolve, reject) => {
            const request = store.get(record.speciesId);
            request.onsuccess = () => resolve(request.result as Species || null);
            request.onerror = () => reject(request.error);
          });
        });
        
        if (species) {
          composition[record.speciesId] = {
            species,
            plotCounts: {}
          };
        }
      }
      
      if (composition[record.speciesId]) {
        composition[record.speciesId].plotCounts[record.plotId] = 
          (composition[record.speciesId].plotCounts[record.plotId] || 0) + 1;
      }
    }
    
    return composition;
  }
}

export default new SpeciesAnalysisService();