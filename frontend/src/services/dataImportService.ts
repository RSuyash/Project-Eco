// src/services/dataImportService.ts

import { updateProject, getProjectById } from './projectService';
import Papa from 'papaparse'; // Import PapaParse

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'archived';
  tools: string[];
  dataSources: string[];
  progress?: number;
  totalDataPoints?: number;
  lastSynced?: string;
}

// Define interfaces for the data to be sent to the backend, matching Pydantic models
interface WoodyVegetationData {
  Plot_ID: string;
  Location_Name: string;
  Quad_ID: string;
  Species_Scientific: string;
  Growth_Form: string;
  Tree_ID: string;
  Height_m: number;
  Condition: string;
  GBH_Stem1_cm: number;
  GBH_Stem2_cm: number;
  GBH_Stem3_cm: number;
  GBH_Stem4_cm: number;
  GBH_Stem5_cm: number;
  GBH_Stem6_cm: number;
  Remarks: string;
  Total_GBH_cm: number;
}

interface HerbFloorVegetationData {
  Plot_ID: string;
  Location_Name: string;
  Subplot_ID: string;
  Layer_Type: string;
  Species_or_Category: string;
  Count_or_Cover: number;
  Avg_Height_cm: number;
  Notes: string;
}

// Function to import field data from CSV
export const importFieldData = async (woodyCsvText: string, herbFloorCsvText: string): Promise<boolean> => {
  try {
    // Parse woody vegetation CSV
    const woodyResults = Papa.parse<WoodyVegetationData>(woodyCsvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically convert numbers
    });

    if (woodyResults.errors.length > 0) {
      console.error('Woody CSV parsing errors:', woodyResults.errors);
      throw new Error('Failed to parse woody vegetation CSV.');
    }

    // Parse herb floor vegetation CSV
    const herbFloorResults = Papa.parse<HerbFloorVegetationData>(herbFloorCsvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically convert numbers
      transformHeader: (header) => header.replace('%', '_percent'), // Handle '%' in header
    });

    if (herbFloorResults.errors.length > 0) {
      console.error('Herb Floor CSV parsing errors:', herbFloorResults.errors);
      throw new Error('Failed to parse herb floor vegetation CSV.');
    }

    // Rename 'Count_or_Cover_percent' back to 'Count_or_Cover' for the backend Pydantic model
    const herbDataForBackend = herbFloorResults.data.map(row => {
      const newRow: any = { ...row };
      if (newRow.Count_or_Cover_percent !== undefined) {
        newRow.Count_or_Cover = newRow.Count_or_Cover_percent;
        delete newRow.Count_or_Cover_percent;
      }
      return newRow;
    });

    // Construct the request body for the backend API
    const requestBody = {
      woody_data: woodyResults.data,
      herb_data: herbDataForBackend,
    };

    // Make the API call to the backend
    const response = await fetch('http://localhost:8000/api/v1/import-field-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error('Backend API call failed: ' + response.status + ' - ' + (errorData.detail || response.statusText));
    }

    const responseData = await response.json();
    console.log('Field data import successful:', responseData);
    return true;
  } catch (error) {
    console.error('Error importing field data:', error);
    return false;
  }
};

// Function to import canopy images
export const importCanopyImages = async (projectId: string, imageFolderPath: string): Promise<boolean> => {
  try {
    const project = await getProjectById(projectId);
    if (!project) {
      throw new Error('Project with id ' + projectId + ' not found');
    }

    const alreadyImported = project.dataSources.includes('Canopy Images');

    // In a real app, you'd count the images. For now, let's add a fixed number.
    const imageCount = 50;

    // Update the project to include canopy images
    const updatedProject = {
      ...project,
      dataSources: [...new Set([...project.dataSources, 'Canopy Images'])], // Avoid duplicates
      totalDataPoints: alreadyImported ? project.totalDataPoints : (project.totalDataPoints || 0) + imageCount,
      updatedAt: new Date().toISOString()
    };

    await updateProject(updatedProject);
    return true;
  } catch (error) {
    console.error('Error importing canopy images:', error);
    return false;
  }
};

// Utility function to parse CSV data (no longer used for direct import, but kept for other potential uses)
export const parseCSVData = (csvText: string): Record<string, string>[] => {
  const lines = csvText.split('\n');
  if (lines.length < 2) {
    return []; // Return empty array if there's no content
  }

  const headers = lines[0].split(',').map(header => header.trim());
  const result: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    if (!currentLine) continue; // Skip empty lines

    const values = currentLine.split(',');
    const obj: Record<string, string> = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] ? values[index].trim() : '';
    });

    result.push(obj);
  }

  return result;
};

// Function to process field data CSV and extract relevant information (no longer used for direct import)
export const processFieldData = (csvData: Record<string, string>[]): {
  speciesCount: number;
  totalDataPoints: number;
  uniqueLocations: string[];
  summary: Record<string, any>;
} => {
  // This would process the field data to extract meaningful insights
  // For now, we'll return a basic summary
  const uniqueLocations = Array.from(new Set(
    csvData.map(row => row['Location_Name'] || row['location'] || row['Plot_ID'] || 'Unknown')
  ));

  return {
    speciesCount: 0, // This would be calculated based on actual species data
    totalDataPoints: csvData.length,
    uniqueLocations,
    summary: {
      totalRows: csvData.length,
      headers: Object.keys(csvData[0] || {})
    }
  };
};

// Function to read file content from public directory (still useful for reading local CSVs before sending)
export const readCSVFile = async (filePath: string): Promise<string> => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error('Failed to fetch ' + filePath + ': ' + response.statusText);
    }
    return response.text();
  } catch (error) {
    console.error('Error reading CSV file ' + filePath + ': ', error);
    throw error;
  }
};