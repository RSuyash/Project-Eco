// src/services/plotDataService.ts

import { PlotMetadata } from './imageMetadataService';

// Define data structures for CSV data
export interface WoodyVegetationData {
  Plot_ID: string;
  Location_Name: string;
  Quad_ID: string;
  Species_Scientific: string;
  Growth_Form: string;
  Tree_ID: string;
  Height_m: string;
  Condition: string;
  GBH_Stem1_cm: string;
  GBH_Stem2_cm: string;
  GBH_Stem3_cm: string;
  GBH_Stem4_cm: string;
  GBH_Stem5_cm: string;
  GBH_Stem6_cm: string;
  Remarks: string;
  Total_GBH_cm: string;
}

export interface HerbFloorVegetationData {
  Plot_ID: string;
  Location_Name: string;
  Subplot_ID: string;
  Layer_Type: string;
  Species_or_Category: string;
  Count_or_CoverPercent: string; // Using a valid identifier name
  Avg_Height_cm: string;
  Notes: string;
}

/**
 * Fetch and parse woody vegetation data from CSV
 */
export const fetchWoodyVegetationData = async (): Promise<WoodyVegetationData[]> => {
  try {
    // In a real implementation, this would fetch from the backend API
    // For now, we'll load from public directory using fetch
    console.log('Fetching woody vegetation data...');

    // For now, read from the public directory
    const response = await fetch('/vegetation-plotting/field-data/woody_vegetation.csv');
    const csvText = await response.text();

    // We'll need to parse the CSV manually or use a library like papaparse
    // For this example, I'll use a simple approach, but papaparse would be better for production
    return parseCSV<WoodyVegetationData>(csvText);
  } catch (error) {
    console.error('Error fetching woody vegetation data:', error);
    return [];
  }
};

/**
 * Fetch and parse herb floor vegetation data from CSV
 */
export const fetchHerbFloorVegetationData = async (): Promise<HerbFloorVegetationData[]> => {
  try {
    // In a real implementation, this would fetch from the backend API
    // For now, we'll load from the public directory using fetch
    console.log('Fetching herb floor vegetation data...');

    const response = await fetch('/vegetation-plotting/field-data/herb_floor_vegetation.csv');
    const csvText = await response.text();

    // Parse the CSV
    return parseCSV<HerbFloorVegetationData>(csvText);
  } catch (error) {
    console.error('Error fetching herb floor vegetation data:', error);
    return [];
  }
};

/**
 * Simple CSV parser - in production, use papaparse or similar
 */
function parseCSV<T>(csvText: string): T[] {
  const lines = csvText.split('\n');
  if (lines.length < 2) return []; // Need at least header and one data row

  const headers = lines[0].split(',').map(h => h.trim());
  const result: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);
    const obj: any = {};

    for (let j = 0; j < headers.length; j++) {
      // Handle the special case for the Count_or_Cover% field
      if (headers[j] === 'Count_or_Cover%') {
        obj.Count_or_CoverPercent = values[j] || '';
      } else {
        obj[headers[j]] = values[j] || '';
      }
    }

    result.push(obj as T);
  }

  return result;
}

/**
 * Parse a single CSV line, handling quoted values that might contain commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Double quotes inside quoted field
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Process CSV data to create plot metadata
 */
export const processPlotDataForMetadata = async (): Promise<PlotMetadata[]> => {
  // Fetch woody and herb vegetation data
  const woodyData = await fetchWoodyVegetationData();
  const herbData = await fetchHerbFloorVegetationData();
  
  // Group data by plot ID
  const plotMap = new Map<string, PlotMetadata>();
  
  // Process woody vegetation data
  woodyData.forEach(record => {
    const plotId = record.Plot_ID;
    
    if (!plotMap.has(plotId)) {
      plotMap.set(plotId, {
        plotId,
        locationName: record.Location_Name,
        quadrants: [],
        subplots: []
      });
    }
    
    const plotMetadata = plotMap.get(plotId)!;
    
    // Find or create quadrant entry
    let quadrant = plotMetadata.quadrants.find(q => q.id === record.Quad_ID);
    if (!quadrant) {
      quadrant = {
        id: record.Quad_ID,
        speciesCount: 0,
        treeCount: 0,
        totalGbh: 0
      };
      plotMetadata.quadrants.push(quadrant);
    }
    
    // Update quadrant statistics
    quadrant.speciesCount = (quadrant.speciesCount || 0) + 1;
    quadrant.treeCount = (quadrant.treeCount || 0) + 1;
    
    const totalGbh = parseFloat(record.Total_GBH_cm);
    if (!isNaN(totalGbh)) {
      quadrant.totalGbh = (quadrant.totalGbh || 0) + totalGbh;
    }
  });
  
  // Process herb floor vegetation data
  herbData.forEach(record => {
    const plotId = record.Plot_ID;
    
    if (!plotMap.has(plotId)) {
      plotMap.set(plotId, {
        plotId,
        locationName: record.Location_Name,
        quadrants: [],
        subplots: []
      });
    }
    
    const plotMetadata = plotMap.get(plotId)!;
    
    // Find or create subplot entry
    let subplot = plotMetadata.subplots?.find(s => s.id === record.Subplot_ID);
    if (!subplot) {
      if (!plotMetadata.subplots) plotMetadata.subplots = [];
      subplot = {
        id: record.Subplot_ID,
        speciesCount: 0,
        coverPercentage: 0,
        totalHeight: 0
      };
      plotMetadata.subplots.push(subplot);
    }
    
    // Update subplot statistics
    subplot.speciesCount = (subplot.speciesCount || 0) + 1;
    
    const coverPercentage = parseFloat(record.Count_or_CoverPercent);
    if (!isNaN(coverPercentage)) {
      subplot.coverPercentage = (subplot.coverPercentage || 0) + coverPercentage;
    }
    
    const avgHeight = parseFloat(record.Avg_Height_cm);
    if (!isNaN(avgHeight)) {
      subplot.totalHeight = (subplot.totalHeight || 0) + avgHeight;
    }
  });
  
  return Array.from(plotMap.values());
};

/**
 * Get plot metadata by plot ID
 * This would be used to provide context for naming associated images
 */
export const getPlotMetadataById = async (plotId: string): Promise<PlotMetadata | undefined> => {
  const allPlotData = await processPlotDataForMetadata();
  return allPlotData.find(plot => plot.plotId === plotId);
};

/**
 * Get list of all plot IDs
 */
export const getAllPlotIds = async (): Promise<string[]> => {
  const allPlotData = await processPlotDataForMetadata();
  return allPlotData.map(plot => plot.plotId);
};

/**
 * Parse and process plot data for visualization
 */
export const parseAndProcessPlotData = async (
  woodyCSV: string,
  herbCSV: string,
  targetPlotId: string,
  scaleFactor: number
): Promise<any> => {
  // This function would process the CSV data into a format suitable for visualization
  // For now, it returns mock data - in a real implementation it would parse the CSVs
  // and return structured data for the plot visualizer

  // Parse woody and herb data
  const woodyData = parseCSV<WoodyVegetationData>(woodyCSV);
  const herbData = parseCSV<HerbFloorVegetationData>(herbCSV);

  // Filter data for the target plot
  const plotWoodyData = woodyData.filter(record => record.Plot_ID === targetPlotId);
  const plotHerbData = herbData.filter(record => record.Plot_ID === targetPlotId);

  // Convert to visualization format
  const trees = plotWoodyData.map((record, index) => ({
    id: record.Tree_ID,
    species: record.Species_Scientific,
    x: (index * 2) % 20, // Arrange in a grid pattern
    y: Math.floor(index / 10) * 2,
    height: parseFloat(record.Height_m) || 5,
    gbh: parseFloat(record.Total_GBH_cm) || 30,
    quadId: record.Quad_ID
  }));

  const subplots = plotHerbData.map((record, index) => ({
    id: `${record.Subplot_ID}_${index}`,
    x: (index * 3) % 20,
    y: Math.floor(index / 7) * 3 + 15, // Put subplots lower on the map
    coverPercentage: parseFloat(record.Count_or_CoverPercent) || 0,
    avgHeight: parseFloat(record.Avg_Height_cm) || 0,
    layerType: record.Layer_Type
  }));

  return {
    trees,
    subplots
  };
};