// src/services/imageMetadataService.ts

import { getPlotMetadataById } from './plotDataService';

export interface ImageMetadata {
  id: string;
  plotId: string;
  locationName?: string;
  quadrantId?: string;
  subplotId?: string;
  imageType: 'canopy' | 'woody' | 'herb' | 'habitat' | 'species' | 'other';
  originalFilename: string;
  storedFilename: string;
  uploadDate: string;
  analysisStatus: 'not_analyzed' | 'analyzing' | 'completed' | 'error';
  analysisResults?: any; // Canopy analysis results
  associatedData?: {
    species?: string;
    height?: number;
    gbh?: number;
    coverPercentage?: number;
    notes?: string;
  };
  tags?: string[];
}

export interface PlotMetadata {
  plotId: string;
  locationName: string;
  quadrants: {
    id: string;
    speciesCount?: number;
    treeCount?: number;
    totalGbh?: number;
    canopyCover?: number;
    images?: string[]; // IDs of associated images
  }[];
  subplots?: {
    id: string;
    speciesCount?: number;
    coverPercentage?: number;
    totalHeight?: number;
    images?: string[]; // IDs of associated images
  }[];
  images?: string[]; // IDs of associated images
}

// In-memory storage for image metadata
// In a real application, this would be stored in a database
let imageMetadataMap: Map<string, ImageMetadata> = new Map();
let plotMetadataMap: Map<string, PlotMetadata> = new Map();

/**
 * Store image metadata
 */
export const storeImageMetadata = (metadata: ImageMetadata): void => {
  imageMetadataMap.set(metadata.id, metadata);
  // Also add to plot metadata
  updatePlotMetadataWithImage(metadata);
};

/**
 * Get image metadata by ID
 */
export const getImageMetadataById = (id: string): ImageMetadata | undefined => {
  return imageMetadataMap.get(id);
};

/**
 * Get image metadata by plot ID
 */
export const getImagesByPlotId = (plotId: string): ImageMetadata[] => {
  const images: ImageMetadata[] = [];
  for (const [_, metadata] of imageMetadataMap) {
    if (metadata.plotId === plotId) {
      images.push(metadata);
    }
  }
  return images;
};

/**
 * Update plot metadata to include image association
 */
const updatePlotMetadataWithImage = (imageMetadata: ImageMetadata) => {
  const plotId = imageMetadata.plotId;

  if (!plotMetadataMap.has(plotId)) {
    // Initialize plot metadata if it doesn't exist
    plotMetadataMap.set(plotId, {
      plotId,
      locationName: imageMetadata.locationName || plotId, // Use location name if available
      quadrants: [],
      subplots: [],
      images: []
    });
  }

  const plotMetadata = plotMetadataMap.get(plotId)!;

  // Add to plot images array
  if (!plotMetadata.images) plotMetadata.images = [];
  if (!plotMetadata.images.includes(imageMetadata.id)) {
    plotMetadata.images.push(imageMetadata.id);
  }

  // If quadrant ID is specified, add to that quadrant's images
  if (imageMetadata.quadrantId) {
    let quadrant = plotMetadata.quadrants.find(q => q.id === imageMetadata.quadrantId);
    if (!quadrant) {
      quadrant = {
        id: imageMetadata.quadrantId,
        images: []
      };
      plotMetadata.quadrants.push(quadrant);
    }

    if (!quadrant.images) quadrant.images = [];
    if (!quadrant.images.includes(imageMetadata.id)) {
      quadrant.images.push(imageMetadata.id);
    }
  }

  // If subplot ID is specified, add to that subplot's images
  if (imageMetadata.subplotId) {
    let subplot = plotMetadata.subplots?.find(s => s.id === imageMetadata.subplotId);
    if (!subplot) {
      if (!plotMetadata.subplots) plotMetadata.subplots = [];
      subplot = {
        id: imageMetadata.subplotId,
        images: []
      };
      plotMetadata.subplots.push(subplot);
    }

    if (!subplot.images) subplot.images = [];
    if (!subplot.images.includes(imageMetadata.id)) {
      subplot.images.push(imageMetadata.id);
    }
  }

  plotMetadataMap.set(plotId, plotMetadata);
};

/**
 * Get plot metadata by plot ID
 */
export const getPlotMetadata = (plotId: string): PlotMetadata | undefined => {
  return plotMetadataMap.get(plotId);
};

/**
 * Get all plot metadata
 */
export const getAllPlotMetadata = (): PlotMetadata[] => {
  return Array.from(plotMetadataMap.values());
};

/**
 * Update analysis status for an image
 */
export const updateImageAnalysisStatus = (id: string, status: ImageMetadata['analysisStatus'], results?: any): void => {
  const metadata = imageMetadataMap.get(id);
  if (metadata) {
    metadata.analysisStatus = status;
    if (results) {
      metadata.analysisResults = results;
    }
    imageMetadataMap.set(id, metadata);
  }
};

/**
 * Initialize image metadata system with data from CSVs
 */
export const initializeImageMetadataWithCSVData = async (): Promise<void> => {
  // Clear existing data
  imageMetadataMap.clear();
  plotMetadataMap.clear();

  // In a real implementation, we would fetch CSV data and create mappings
  // from woody vegetation and herb floor vegetation data
  // This would populate the plotMetadataMap based on the CSV data
  // For now, we'll just return since the actual processing happens in loadExistingCanopyImages
};

/**
 * Generate a descriptive filename based on plot data
 */
export const generateDescriptiveFilename = async (originalFilename: string, plotId: string, quadrantId?: string, subplotId?: string): Promise<string> => {
  // Get the actual plot metadata to create a more descriptive name
  const plotMetadata = await getPlotMetadataById(plotId);

  // Create a descriptive base name
  let baseName = plotId;

  if (quadrantId) {
    baseName += `_${quadrantId}`;
  } else if (subplotId) {
    baseName += `_${subplotId}`;
  }

  if (plotMetadata?.locationName) {
    // Clean the location name for use in filename
    const cleanLocation = plotMetadata.locationName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    baseName += `_${cleanLocation}`;
  }

  // Preserve the original file extension
  const fileExtension = originalFilename.split('.').pop();

  return `${baseName}.${fileExtension}`;
};