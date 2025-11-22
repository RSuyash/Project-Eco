// src/database/services/DatabaseService.ts

import { Project } from '../models/Project';
import { Species, SpeciesRecord } from '../models/Species';
import { Plot, Quadrant, Subplot } from '../models/Plot';

export interface IDatabaseService {
  initialize(): Promise<void>;
  getAllProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>): Promise<Project>;
  updateProject(project: Project): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Species Methods
  addSpeciesToProject(projectId: string, species: Omit<Species, 'id'>): Promise<Species>;
  getSpeciesByProject(projectId: string): Promise<Species[]>;
  getSpeciesRecord(projectId: string, speciesId: string, plotId: string): Promise<SpeciesRecord | null>;
  addSpeciesRecord(projectId: string, record: Omit<SpeciesRecord, 'id' | 'timestamp'>): Promise<SpeciesRecord>;
  
  // Plot Methods
  addPlotToProject(projectId: string, plot: Omit<Plot, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plot>;
  getPlotsByProject(projectId: string): Promise<Plot[]>;
  getPlotDetails(projectId: string, plotId: string): Promise<(Plot & { quadrants: Quadrant[]; records: SpeciesRecord[] }) | null>;
  
  // Data import methods
  importWoodyVegetationData(projectId: string, csvData: string[][]): Promise<void>;
  importHerbFloorVegetationData(projectId: string, csvData: string[][]): Promise<void>;
  calculateProjectMetadata(projectId: string): Promise<void>;
}

class DatabaseService implements IDatabaseService {
  private static readonly DB_NAME = 'EcoScienceDB';
  private static readonly DB_VERSION = 1;
  private static readonly STORES = {
    PROJECTS: 'projects',
    SPECIES: 'species',
    PLOTS: 'plots',
    QUADRANTS: 'quadrants',
    SUBPLOTS: 'subplots',
    RECORDS: 'records'
  };
  
  private db: IDBDatabase | null = null;
  
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DatabaseService.DB_NAME, DatabaseService.DB_VERSION);
      
      request.onerror = () => {
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database initialized successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains(this.STORES.PROJECTS)) {
          const store = db.createObjectStore(this.STORES.PROJECTS, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.SPECIES)) {
          const store = db.createObjectStore(this.STORES.SPECIES, { keyPath: 'id' });
          store.createIndex('scientificName', 'scientificName', { unique: false });
          store.createIndex('projectId', 'projectId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.PLOTS)) {
          const store = db.createObjectStore(this.STORES.PLOTS, { keyPath: 'id' });
          store.createIndex('plotId', 'plotId', { unique: false });
          store.createIndex('projectId', 'projectId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.QUADRANTS)) {
          const store = db.createObjectStore(this.STORES.QUADRANTS, { keyPath: 'id' });
          store.createIndex('plotId', 'plotId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.SUBPLOTS)) {
          const store = db.createObjectStore(this.STORES.SUBPLOTS, { keyPath: 'id' });
          store.createIndex('quadrantId', 'quadrantId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.RECORDS)) {
          const store = db.createObjectStore(this.STORES.RECORDS, { keyPath: 'id' });
          store.createIndex('speciesId', 'speciesId', { unique: false });
          store.createIndex('plotId', 'plotId', { unique: false });
          store.createIndex('quadrantId', 'quadrantId', { unique: false });
        }
      };
    });
  }
  
  private async withTransaction<T>(
    storeName: string, 
    mode: IDBTransactionMode, 
    callback: (store: IDBObjectStore) => Promise<T>
  ): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      
      const result = callback(store);
      
      transaction.oncomplete = () => {
        resolve(result);
      };
      
      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }
  
  async getAllProjects(): Promise<Project[]> {
    return this.withTransaction(this.STORES.PROJECTS, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as Project[]);
        request.onerror = () => reject(request.error);
      });
    });
  }
  
  async getProjectById(id: string): Promise<Project | null> {
    return this.withTransaction(this.STORES.PROJECTS, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result as Project || null);
        request.onerror = () => reject(request.error);
      });
    });
  }
  
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: `proj_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        totalPlots: project.plots.length,
        totalSpecies: project.species.length,
        totalRecords: project.records.length,
        lastUpdated: new Date().toISOString(),
      }
    };
    
    return this.withTransaction(this.STORES.PROJECTS, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.add(newProject);
        request.onsuccess = () => resolve(newProject);
        request.onerror = () => reject(request.error);
      });
    });
  }
  
  async updateProject(project: Project): Promise<Project> {
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString(),
    };
    
    return this.withTransaction(this.STORES.PROJECTS, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.put(updatedProject);
        request.onsuccess = () => resolve(updatedProject);
        request.onerror = () => reject(request.error);
      });
    });
  }
  
  async deleteProject(id: string): Promise<void> {
    return this.withTransaction(this.STORES.PROJECTS, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }
  
  async addSpeciesToProject(projectId: string, species: Omit<Species, 'id'>): Promise<Species> {
    const newSpecies: Species = {
      ...species,
      id: `species_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    return this.withTransaction(this.STORES.SPECIES, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.add(newSpecies);
        request.onsuccess = () => resolve(newSpecies);
        request.onerror = () => reject(request.error);
      });
    });
  }
  
  async getSpeciesByProject(projectId: string): Promise<Species[]> {
    // This is a simplified version - in practice you'd need to filter by projectId
    // which would require adding a projectId field to Species or querying differently
    return this.withTransaction(this.STORES.SPECIES, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as Species[]);
        request.onerror = () => reject(request.error);
      });
    });
  }
  
  async getSpeciesRecord(projectId: string, speciesId: string, plotId: string): Promise<SpeciesRecord | null> {
    return this.withTransaction(this.STORES.RECORDS, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        // This would typically use indexes to filter, simplified for now
        const request = store.getAll();
        request.onsuccess = () => {
          const records = request.result as SpeciesRecord[];
          const found = records.find(r => 
            r.speciesId === speciesId && 
            r.plotId === plotId
          );
          resolve(found || null);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }
  
  async addSpeciesRecord(projectId: string, record: Omit<SpeciesRecord, 'id' | 'timestamp'>): Promise<SpeciesRecord> {
    const newRecord: SpeciesRecord = {
      ...record,
      id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    return this.withTransaction(this.STORES.RECORDS, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.add(newRecord);
        request.onsuccess = () => resolve(newRecord);
        request.onerror = () => reject(request.error);
      });
    });
  }
  
  async addPlotToProject(projectId: string, plot: Omit<Plot, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plot> {
    const newPlot: Plot = {
      ...plot,
      id: `plot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return this.withTransaction(this.STORES.PLOTS, 'readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.add(newPlot);
        request.onsuccess = () => resolve(newPlot);
        request.onerror = () => reject(request.error);
      });
    });
  }
  
  async getPlotsByProject(projectId: string): Promise<Plot[]> {
    return this.withTransaction(this.STORES.PLOTS, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as Plot[]);
        request.onerror = () => reject(request.error);
      });
    });
  }
  
  async getPlotDetails(projectId: string, plotId: string): Promise<(Plot & { quadrants: Quadrant[]; records: SpeciesRecord[] }) | null> {
    // Get the plot
    const plot = await this.withTransaction(this.STORES.PLOTS, 'readonly', (store) => {
      return new Promise<Plot | null>((resolve, reject) => {
        const request = store.get(plotId);
        request.onsuccess = () => resolve(request.result as Plot || null);
        request.onerror = () => reject(request.error);
      });
    });
    
    if (!plot) return null;
    
    // Get quadrants for this plot
    const quadrants = await this.withTransaction(this.STORES.QUADRANTS, 'readonly', (store) => {
      return new Promise<Quadrant[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allQuadrants = request.result as Quadrant[];
          const plotQuadrants = allQuadrants.filter(q => q.plotId === plotId);
          resolve(plotQuadrants);
        };
        request.onerror = () => reject(request.error);
      });
    });
    
    // Get records for this plot
    const records = await this.withTransaction(this.STORES.RECORDS, 'readonly', (store) => {
      return new Promise<SpeciesRecord[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allRecords = request.result as SpeciesRecord[];
          const plotRecords = allRecords.filter(r => r.plotId === plotId);
          resolve(plotRecords);
        };
        request.onerror = () => reject(request.error);
      });
    });
    
    return {
      ...plot,
      quadrants,
      records
    };
  }
  
  async importWoodyVegetationData(projectId: string, csvData: string[][]): Promise<void> {
    // Skip header row
    const headers = csvData[0];
    const rows = csvData.slice(1);
    
    // Process each row
    for (const row of rows) {
      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });
      
      // Create a species record based on the data
      const speciesName = rowData['Species_Scientific'];
      const plotId = rowData['Plot_ID'];
      const quadId = rowData['Quad_ID'];
      const treeId = rowData['Tree_ID'];
      const heightStr = rowData['Height_m'];
      const condition = rowData['Condition'];
      const gbhStem1Str = rowData['GBH_Stem1_cm'];
      
      // Create or get species
      let species: Species;
      const existingSpecies = await this.withTransaction(this.STORES.SPECIES, 'readonly', (store) => {
        return new Promise<Species | undefined>((resolve, reject) => {
          const request = store.index('scientificName').getAll(speciesName);
          request.onsuccess = () => {
            const results = request.result as Species[];
            resolve(results[0]);
          };
          request.onerror = () => reject(request.error);
        });
      });
      
      if (existingSpecies) {
        species = existingSpecies;
      } else {
        species = await this.addSpeciesToProject(projectId, {
          scientificName: speciesName,
          commonName: '', // Would extract from data if available
          growthForm: rowData['Growth_Form'] || 'Tree',
          family: '' // Would extract from data if available
        });
      }
      
      // Add a record for this tree
      await this.addSpeciesRecord(projectId, {
        speciesId: species.id,
        plotId: plotId,
        quadrantId: quadId,
        treeId: treeId,
        height: heightStr ? parseFloat(heightStr) : undefined,
        condition: condition,
        gbh: gbhStem1Str ? parseFloat(gbhStem1Str) : undefined,
        notes: rowData['Remarks'] || '',
      });
    }
    
    // Update project metadata
    await this.calculateProjectMetadata(projectId);
  }
  
  async importHerbFloorVegetationData(projectId: string, csvData: string[][]): Promise<void> {
    // Skip header row
    const headers = csvData[0];
    const rows = csvData.slice(1);
    
    // Process each row
    for (const row of rows) {
      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });
      
      // Create or get species/survey category
      const speciesOrCategory = rowData['Species_or_Category'];
      const plotId = rowData['Plot_ID'];
      const subplotId = rowData['Subplot_ID'];
      const layerType = rowData['Layer_Type'];
      const countOrCoverStr = rowData['Count_or_Cover%'];
      const avgHeightStr = rowData['Avg_Height_cm'];
      const notes = rowData['Notes'];
      
      // Create a generic species entry for non-species categories like "Bare Ground", etc.
      let species: Species;
      const existingSpecies = await this.withTransaction(this.STORES.SPECIES, 'readonly', (store) => {
        return new Promise<Species | undefined>((resolve, reject) => {
          const request = store.index('scientificName').getAll(speciesOrCategory);
          request.onsuccess = () => {
            const results = request.result as Species[];
            resolve(results[0]);
          };
          request.onerror = () => reject(request.error);
        });
      });
      
      if (existingSpecies) {
        species = existingSpecies;
      } else {
        species = await this.addSpeciesToProject(projectId, {
          scientificName: speciesOrCategory,
          commonName: speciesOrCategory,
          growthForm: layerType,
        });
      }
      
      // Add a record for this subplot observation
      await this.addSpeciesRecord(projectId, {
        speciesId: species.id,
        plotId: plotId,
        quadrantId: subplotId.substring(0, 2), // Extract quadrant from subplot ID (SP1 -> Q1)
        subplotId: subplotId,
        coverPercentage: countOrCoverStr ? parseFloat(countOrCoverStr) : undefined,
        avgHeight: avgHeightStr ? parseFloat(avgHeightStr) : undefined,
        notes: notes,
      });
    }
    
    // Update project metadata
    await this.calculateProjectMetadata(projectId);
  }
  
  async calculateProjectMetadata(projectId: string): Promise<void> {
    const project = await this.getProjectById(projectId);
    if (!project) return;
    
    const plots = await this.getPlotsByProject(projectId);
    const species = await this.getSpeciesByProject(projectId);
    
    // Get all records
    const allRecords = await this.withTransaction(this.STORES.RECORDS, 'readonly', (store) => {
      return new Promise<SpeciesRecord[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as SpeciesRecord[]);
        request.onerror = () => reject(request.error);
      });
    });
    
    const filteredRecords = allRecords.filter(r => 
      plots.some(p => p.plotId === r.plotId) ||
      species.some(s => s.scientificName === r.speciesId)
    );
    
    const updatedProject: Project = {
      ...project,
      metadata: {
        ...project.metadata,
        totalPlots: plots.length,
        totalSpecies: species.length,
        totalRecords: filteredRecords.length,
        lastUpdated: new Date().toISOString()
      }
    };
    
    await this.updateProject(updatedProject);
  }
}

export default new DatabaseService();