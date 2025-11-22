// src/services/imageStorageService.ts

import { CanopyImageStorage } from '../database/models/Plot';

// Define the structure for image metadata
interface ImageMetadata {
  width: number;
  height: number;
}

// A simple service to handle image storage and retrieval
// In a real application, this would interface with a backend API
export class ImageStorageService {
  // Store an image file and return its storage info
  static async storeImage(
    file: File,
    projectId: string,
    plotId: string,
    quadrantId: string,
    uploadedBy: string = 'user'
  ): Promise<CanopyImageStorage> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('plot_id', plotId);
      formData.append('quadrant_id', quadrantId);

      const response = await fetch('http://localhost:8000/api/v1/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Image upload failed: ${response.status} - ${errorData.detail || response.statusText}`);
      }

      const responseData = await response.json();
      const backendFilePath = responseData.file_path; // Path returned by the backend

      // Create a unique ID for the image
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const storageEntry: CanopyImageStorage = {
        id,
        projectId,
        plotId,
        quadrantId,
        fileName: file.name, // Use original file name
        originalFileName: file.name,
        path: backendFilePath, // Use the path from the backend
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy,
        status: 'available',
        metadata: {
          width: 0, // Metadata like width/height would ideally come from backend or be determined on frontend if needed
          height: 0
        }
      };
      
      // Note: Local storage for images is removed as they are now stored on the backend.
      // The frontend will need to fetch image data from the backend when needed.
      return storageEntry;

    } catch (error) {
      console.error('Error storing image:', error);
      throw error; // Re-throw the error for upstream handling
    }
  }

  // Get all images for a specific project
  static getProjectImages(projectId: string): CanopyImageStorage[] {
    try {
      // This function would now need to make an API call to the backend
      // to retrieve images for a project. For now, returning empty array.
      console.warn('getProjectImages not yet implemented for backend integration.');
      return [];
    } catch (error) {
      console.error('Error retrieving project images:', error);
      return [];
    }
  }

  // Get images for a specific plot
  static getPlotImages(projectId: string, plotId: string): CanopyImageStorage[] {
    try {
      // This function would now need to make an API call to the backend
      // to retrieve images for a specific plot. For now, returning empty array.
      console.warn('getPlotImages not yet implemented for backend integration.');
      return [];
    } catch (error) {
      console.error('Error retrieving plot images:', error);
      return [];
    }
  }

  // Get images for a specific quadrant
  static getQuadrantImages(projectId: string, plotId: string, quadrantId: string): CanopyImageStorage[] {
    try {
      // This function would now need to make an API call to the backend
      // to retrieve images for a specific quadrant. For now, returning empty array.
      console.warn('getQuadrantImages not yet implemented for backend integration.');
      return [];
    } catch (error) {
      console.error('Error retrieving quadrant images:', error);
      return [];
    }
  }

  // Delete an image
  static deleteImage(imageId: string): boolean {
    try {
      // This function would now need to make an API call to the backend
      // to delete an image. For now, returning false.
      console.warn('deleteImage not yet implemented for backend integration.');
      return false;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
}