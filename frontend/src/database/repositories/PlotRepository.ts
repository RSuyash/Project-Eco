// src/database/repositories/PlotRepository.ts

import { Plot, Quadrant, Subplot } from '../models/Plot';

export interface IPlotRepository {
  createPlot(plot: Omit<Plot, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plot>;
  getPlotById(id: string): Promise<Plot | null>;
  getAllPlots(): Promise<Plot[]>;
  updatePlot(plot: Plot): Promise<Plot>;
  deletePlot(id: string): Promise<void>;
  
  createQuadrant(quadrant: Omit<Quadrant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quadrant>;
  getQuadrantById(id: string): Promise<Quadrant | null>;
  getQuadrantsByPlot(plotId: string): Promise<Quadrant[]>;
  updateQuadrant(quadrant: Quadrant): Promise<Quadrant>;
  deleteQuadrant(id: string): Promise<void>;
  
  createSubplot(subplot: Omit<Subplot, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subplot>;
  getSubplotById(id: string): Promise<Subplot | null>;
  getSubplotsByQuadrant(quadrantId: string): Promise<Subplot[]>;
  updateSubplot(subplot: Subplot): Promise<Subplot>;
  deleteSubplot(id: string): Promise<void>;
}

class PlotRepository implements IPlotRepository {
  async createPlot(plot: Omit<Plot, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plot> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getPlotById(id: string): Promise<Plot | null> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getAllPlots(): Promise<Plot[]> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async updatePlot(plot: Plot): Promise<Plot> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async deletePlot(id: string): Promise<void> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async createQuadrant(quadrant: Omit<Quadrant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quadrant> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getQuadrantById(id: string): Promise<Quadrant | null> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getQuadrantsByPlot(plotId: string): Promise<Quadrant[]> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async updateQuadrant(quadrant: Quadrant): Promise<Quadrant> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async deleteQuadrant(id: string): Promise<void> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async createSubplot(subplot: Omit<Subplot, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subplot> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getSubplotById(id: string): Promise<Subplot | null> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async getSubplotsByQuadrant(quadrantId: string): Promise<Subplot[]> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async updateSubplot(subplot: Subplot): Promise<Subplot> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
  
  async deleteSubplot(id: string): Promise<void> {
    // Implementation in service
    throw new Error("Method not implemented.");
  }
}

export default new PlotRepository();