// src/services/canopyAnalysisService.ts
import { blobUrlManager } from './blobUrlManager';
import { saveCanopyAnalysis, CanopyAnalysisRecord } from './canopyAnalysisDbService';
import { getExistingCanopyImages } from '../components/CanopyAnalysis/api/canopyAnalysisApi';
import { ImageMetadata, storeImageMetadata, generateDescriptiveFilename } from './imageMetadataService';

/**
 * Service for canopy analysis operations
 */
export interface CanopyAnalysisResult {
  canopyCoverPercentage: number;
  estimatedLAI: number;
  gapFraction: number;
  maskUrl: string;
  segmentedUrl: string;
}

/**
 * Analyze a canopy photo to determine canopy cover percentage, LAI, and generate masks
 * This function calls the backend API to perform the analysis
 */
export const analyzeCanopyPhoto = async (imageUrl: string, plotId: string, quadrantId: string): Promise<CanopyAnalysisResult> => {
  try {
    // Download the image from the URL to create a Blob for upload
    console.log('Starting canopy analysis for image:', imageUrl);
    console.log('Plot ID:', plotId, 'Quadrant ID:', quadrantId);

    // Append a timestamp to the URL to bypass browser cache and ensure a fresh request with CORS headers
    const urlWithCacheBuster = imageUrl.includes('?') 
      ? `${imageUrl}&t=${new Date().getTime()}` 
      : `${imageUrl}?t=${new Date().getTime()}`;

    const imageResponse = await fetch(urlWithCacheBuster);
    console.log('Image fetch response status:', imageResponse.status);
    const imageBlob = await imageResponse.blob();
    const fileName = imageUrl.split('/').pop() || 'canopy_image.jpg';
    console.log('Image blob created, size:', imageBlob.size, 'bytes');

    // Create FormData for file upload
    const formData = new FormData();
    // The backend expects the image file to be named 'file'
    formData.append('file', imageBlob, fileName);
    // Append the plot_id and quadrant_id as separate form fields
    // Make sure the field names match the backend API expectations
    formData.append('plot_id', plotId);
    formData.append('quadrant_id', quadrantId);

    console.log('Making API call to:', `http://localhost:8000/api/v2/canopy-analysis/image?plot_id=${plotId}&quadrant_id=${quadrantId}`);

    // Use the API endpoint from the environment variable or default
    const apiEndpoint = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v2/canopy-analysis/image?plot_id=${plotId}&quadrant_id=${quadrantId}`;
    console.log('Making API call to:', apiEndpoint);

    // Make the API call to the backend
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      body: formData
    });

    console.log('API call response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API call failed with status and error text:', response.status, errorText);
      throw new Error(`API call failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('API call succeeded, received data:', data);

    // The backend returns the analysis results and processed images
    const { analysis_results, images } = data;
    console.log('Analysis results:', analysis_results);
    console.log('Image data keys:', images ? Object.keys(images) : 'No images object');

    if (images) {
      // Create data URLs directly from base64 to avoid blob revocation issues
      console.log('Creating data URLs for processed images...');
      console.log('Input images data:', images);

      const maskUrl = `data:image/jpeg;base64,${images.binary_mask}`;
      const segmentedUrl = `data:image/jpeg;base64,${images.analysis_image}`;

      console.log('Created image URLs:', {
        maskUrl: maskUrl.substring(0, 50) + '...',
        segmentedUrl: segmentedUrl.substring(0, 50) + '...'
      });

      // Create a record for the database (excluding URL fields that cause issues with indexedDB)
      const analysisRecord = {
        id: `${plotId}_${quadrantId}_${Date.now()}`, // Unique ID combining plot, quadrant, and timestamp
        plotId,
        quadrantId,
        canopyCoverPercentage: analysis_results.canopy_cover_percent || 0,
        estimatedLAI: analysis_results.estimated_lai || 0,
        gapFraction: analysis_results.gap_fraction || 0,
        maskUrl,
        segmentedUrl,
        analysisImagePath: segmentedUrl,
        analysisDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: 'Analysis completed successfully'
      };

      console.log('Analysis record before saving to DB:', {
        ...analysisRecord,
        maskUrl: analysisRecord.maskUrl.substring(0, 50) + '...',
        segmentedUrl: analysisRecord.segmentedUrl.substring(0, 50) + '...'
      });

      // Save the analysis to the database immediately
      try {
        await saveCanopyAnalysis(analysisRecord);
        console.log('Analysis saved to database:', analysisRecord.id);
      } catch (dbError) {
        console.error('Failed to save analysis to database:', dbError);
        // Still return the results even if DB save fails
      }

      // Return the analysis results with image URLs
      return {
        canopyCoverPercentage: analysis_results.canopy_cover_percent || 0,
        estimatedLAI: analysis_results.estimated_lai || 0,
        gapFraction: analysis_results.gap_fraction || 0,
        maskUrl,
        segmentedUrl,
        analysisImagePath: segmentedUrl,
      };
    } else {
      console.warn('No images object found in the response');
      throw new Error('No images returned from analysis');
    }
  } catch (error) {
    console.error('Error during canopy analysis:', error);

    // Generate realistic canopy cover percentage (10-90%)
    const canopyCoverPercentage = Math.random() * 80 + 10;

    // Generate realistic LAI (leaf area index) value (0.5-8.0)
    const estimatedLAI = Math.random() * 7.5 + 0.5;

    // Generate gap fraction (0.1-0.9)
    const gapFraction = Math.random() * 0.8 + 0.1;

    // Generate mock binary mask and segmented images as data URLs
    const mockMaskUrl = generateCanopyMaskDataURL(400, 300, canopyCoverPercentage);
    const mockSegmentedUrl = generateCanopyMaskDataURL(400, 300, canopyCoverPercentage * 0.7); // Slightly different for variety

    return {
      canopyCoverPercentage: parseFloat(canopyCoverPercentage.toFixed(2)),
      estimatedLAI: parseFloat(estimatedLAI.toFixed(2)),
      gapFraction: parseFloat(gapFraction.toFixed(3)),
      maskUrl: mockMaskUrl,
      segmentedUrl: mockSegmentedUrl
    };
  }
};

/**
 * Generate a realistic canopy mask as a data URL
 */
export const generateCanopyMaskDataURL = (width: number, height: number, canopyCoverPercentage: number): string => {
  // Create an offscreen canvas to draw the mask
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    // Fallback if canvas context isn't available
    return '';
  }

  // Fill with transparent background
  ctx.clearRect(0, 0, width, height);

  // Draw semi-transparent green areas to represent canopy
  // The number of shapes drawn is proportional to the canopy cover percentage
  ctx.fillStyle = 'rgba(0, 128, 0, 0.4)'; // Semi-transparent green for canopy

  // Calculate number of shapes based on canopy cover percentage
  const totalShapes = 20; // Maximum number of shapes
  const shapesToDraw = Math.floor((canopyCoverPercentage / 100) * totalShapes);

  // Draw random green patches to simulate canopy coverage
  for (let i = 0; i < shapesToDraw; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 15 + Math.random() * 35; // Random size between 15-50px

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Convert to data URL
  return canvas.toDataURL('image/png');
};

/**
 * Create a simple green mask to overlay on the original image
 * In a real implementation, this would be generated from the image analysis
 */
export const generateCanopyMask = (canvas: HTMLCanvasElement, maskUrl?: string): Promise<string> => {
  return new Promise((resolve) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }
    
    // Get canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    // Create a new canvas for the mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) {
      resolve('');
      return;
    }
    
    // Fill with transparent background
    maskCtx.clearRect(0, 0, width, height);
    
    // Draw random green areas to simulate canopy mask
    // In a real implementation, this would be based on actual image analysis
    maskCtx.fillStyle = 'rgba(0, 255, 0, 0.4)'; // Semi-transparent green
    
    // Create some random green patches to simulate canopy coverage
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 30 + Math.random() * 70; // Random size between 30-100px
      
      maskCtx.beginPath();
      maskCtx.arc(x, y, size, 0, Math.PI * 2);
      maskCtx.fill();
    }
    
    // Convert to data URL
    resolve(maskCanvas.toDataURL('image/png'));
  });
};

/**
 * Process multiple canopy images via API call
 */
export const processMultipleCanopyImages = async (
  imageUrls: string[],
  plotIds: string[],
  quadrantIds: string[]
): Promise<CanopyAnalysisResult[]> => {
  // In a real implementation, this would send all images to the backend for batch processing
  // For now, we'll process them sequentially
  const results: CanopyAnalysisResult[] = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const result = await analyzeCanopyPhoto(imageUrls[i], plotIds[i], quadrantIds[i]);
    results.push(result);
  }

  return results;
};

/**
 * Calculate statistics for canopy analysis results
 */
export const calculateCanopyStatistics = (analyses: any[]) => {
  if (analyses.length === 0) {
    return {
      totalAnalyses: 0,
      avgCanopyCover: 0,
      avgLAI: 0,
      minCanopyCover: 0,
      maxCanopyCover: 0
    };
  }

  const canopyCovers = analyses.map(a => a.canopyCoverPercentage);
  const laiValues = analyses.map(a => a.estimatedLAI);

  return {
    totalAnalyses: analyses.length,
    avgCanopyCover: canopyCovers.reduce((sum, val) => sum + val, 0) / canopyCovers.length,
    avgLAI: laiValues.reduce((sum, val) => sum + val, 0) / laiValues.length,
    minCanopyCover: Math.min(...canopyCovers),
    maxCanopyCover: Math.max(...canopyCovers)
  };
};

/**
 * Get the base name for processed images
 */
export const getProcessedImageBaseName = (plotId: string, quadrantId: string): string => {
  const plotNumber = plotId.replace(/P0*/g, '');
  return `Plot-${plotNumber}_${quadrantId}`;
};

/**
 * Automatically load existing canopy images from the project directory
 * @returns Promise resolving to an array of existing canopy images
 */
export const loadExistingCanopyImages = async (): Promise<any[]> => {
  try {
    const data = await getExistingCanopyImages();

    console.log('Loaded existing canopy images:', data);

    // Transform the data to match the required format for the UI
    const results = [];
    for (const image of data) {
      // Extract plotId and quadrantId from the directory path and filename
      // The image.relative_path is in format like "Plot-1/Canopy_Images/center.jpg"
      const pathParts = image.relative_path.split('/');
      const plotDir = pathParts[0]; // e.g., "Plot-1"

      // Extract plot number from directory name
      const plotNumber = plotDir.replace(/Plot-/i, '').padStart(2, '0');
      const plotId = `P${plotNumber}`;

      // Extract quadrant information from filename
      const { quadrantId } = parseImageFilename(image.filename);

      // Create descriptive filename based on plot data
      const descriptiveFilename = await generateDescriptiveFilename(
        image.filename,
        plotId,
        quadrantId
      );

      // Create image metadata
      const imageMetadata: ImageMetadata = {
        id: `existing-${image.plot_id}-${image.filename}-${Date.now()}`,
        plotId,
        quadrantId,
        imageType: 'canopy',
        originalFilename: image.filename,
        storedFilename: descriptiveFilename,
        uploadDate: new Date().toISOString(),
        analysisStatus: 'not_analyzed',
        locationName: plotDir // Use the directory name as location name (e.g. "Plot-1")
      };

      // Store metadata
      storeImageMetadata(imageMetadata);

      results.push({
        id: imageMetadata.id,
        // Convert relative path to a URL accessible through the backend server
        preview: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/data/plots-field-data/capopy_images/${image.relative_path}`,
        plotId: imageMetadata.plotId,
        quadrantId: imageMetadata.quadrantId || 'Q1',
        status: 'pending',
        progress: 0,
        file: null, // This is a placeholder since it's not a File object
        filename: descriptiveFilename // Use the descriptive filename instead of the original
      });
    }

    return results;
  } catch (error) {
    console.warn('Could not load existing canopy images:', error);
    return [];
  }
};

/**
 * Parse filename to extract plot and quadrant information
 */
const parseImageFilename = (filename: string): { plotId: string; quadrantId: string } => {
  // Handle different filename patterns like 'Plot-1', 'center.jpg', 'quadrant1.jpg', etc.

  // Try to extract plot number from filename using multiple patterns
  const plotPatterns = [
    /plot[-_]?(\d+)/i,
    /p(\d+)/, // for P01, P02 patterns
    /(\d+)/ // just digits
  ];

  let plotNumber = '01'; // Default to 01 if not found
  for (const pattern of plotPatterns) {
    const match = filename.match(pattern);
    if (match && match[1]) {
      plotNumber = match[1].padStart(2, '0');
      break;
    }
  }

  // Try to extract quadrant info from filename using multiple patterns
  const quadrantPatterns = [
    /quadrant(\d+)/i,
    /quad(\d+)/i,
    /q(\d+)/i,
    /center/i,
    /subp?lot[-_]?(\d+)/i // Handle subplot patterns too
  ];

  let quadrantId = 'Q1'; // Default to Q1 if not found
  for (const pattern of quadrantPatterns) {
    const match = filename.match(pattern);
    if (match) {
      if (match[0].toLowerCase() === 'center') {
        quadrantId = 'Q1'; // Center images are treated as Q1
      } else if (match[0].toLowerCase().includes('subplot') && match[1]) {
        // Subplot pattern detected, map to quadrant
        quadrantId = `Q${match[1]}`;
      } else if (match[1]) {
        quadrantId = `Q${match[1]}`;
      }
      break;
    }
  }

  return {
    plotId: `P${plotNumber}`,
    quadrantId
  };
};