// src/services/dataImportService.ts

import { getAllProjects, updateProject } from './dbService';

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

// Function to import field data from CSV
export const importFieldData = async (projectId: string, filePath: string): Promise<boolean> => {
  try {
    const project = await getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with id ${projectId} not found`);
    }

    // Read and process the CSV file
    const csvText = await readCSVFile(filePath);
    const csvData = parseCSVData(csvText);
    const processedData = processFieldData(csvData);

    const alreadyImported = project.dataSources.includes('Field Data');

    // Update the project with the new data
    const updatedProject = {
      ...project,
      dataSources: [...new Set([...project.dataSources, 'Field Data'])], // Avoid duplicates
      totalDataPoints: alreadyImported ? project.totalDataPoints : (project.totalDataPoints || 0) + processedData.totalDataPoints,
      lastSynced: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await updateProject(updatedProject);
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
      throw new Error(`Project with id ${projectId} not found`);
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

// Function to get a project by ID
const getProjectById = async (id: string): Promise<Project | undefined> => {
  const projects = await getAllProjects();
  return projects.find(project => project.id === id);
};

// Utility function to parse CSV data
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

// Function to process field data CSV and extract relevant information
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

// Function to read file content from public directory
export const readCSVFile = async (filePath: string): Promise<string> => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
    }
    return response.text();
  } catch (error) {
    console.error(`Error reading CSV file ${filePath}:`, error);
    throw error;
  }
};