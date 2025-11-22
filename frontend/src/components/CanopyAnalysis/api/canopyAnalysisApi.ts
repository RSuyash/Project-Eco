// src/components/CanopyAnalysis/api/canopyAnalysisApi.ts
import axios from 'axios';
import { CANOPY_ANALYSIS_CONFIG } from '../config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Interfaces for the analysis request and response
interface CanopyAnalysisRequest {
  file: File;
  plot_id: string;
  quadrant_id: string;
}

interface CanopyAnalysisResponse {
  success: boolean;
  message: string;
  analysis_results: {
    canopy_cover_percent: number;
    estimated_lai: number;
    gap_fraction: number;
  };
  images: {
    original: string;
    binary_mask: string;
    analysis_image: string;
  };
}

interface PipelineStatus {
  step: string;
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Analyzes a single canopy image
 * @param request - Object containing file, plot_id, and quadrant_id
 * @returns Promise resolving to analysis results
 */
export const analyzeCanopyImage = async (
  request: CanopyAnalysisRequest
): Promise<CanopyAnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('plot_id', request.plot_id);
  formData.append('quadrant_id', request.quadrant_id);

  const response = await axios.post<CanopyAnalysisResponse>(
    `${API_BASE_URL}${CANOPY_ANALYSIS_CONFIG.ENDPOINTS.ANALYZE_IMAGE}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: CANOPY_ANALYSIS_CONFIG.API_TIMEOUT_MS,
    }
  );

  return response.data;
};

// Interface for batch analysis request
interface BatchAnalysisRequest {
  plot_id: string;
}

/**
 * Runs batch canopy analysis for all images in a plot
 * @param request - Object containing plot_id
 * @returns Promise resolving to batch analysis status
 */
export const runBatchCanopyAnalysis = async (
  request: BatchAnalysisRequest
): Promise<PipelineStatus> => {
  const response = await axios.post<PipelineStatus>(
    `${API_BASE_URL}${CANOPY_ANALYSIS_CONFIG.ENDPOINTS.BATCH_ANALYSIS}`,
    {},
    {
      params: {
        step_name: 'analyze-canopy'
      },
      timeout: CANOPY_ANALYSIS_CONFIG.API_TIMEOUT_MS,
    }
  );

  return response.data;
};

// Interface for retrieving canopy analysis results
interface GetCanopyResultsResponse {
  plot_id: string;
  plot_name: string;
  data: Array<{
    plot_id: string;
    filename: string;
    canopy_cover_percent: number;
    estimated_lai: number;
    gap_fraction: number;
  }>;
}

/**
 * Retrieves canopy analysis results for a specific plot
 * @param plotId - ID of the plot
 * @returns Promise resolving to canopy analysis results
 */
export const getCanopyAnalysisResults = async (
  plotId: string
): Promise<GetCanopyResultsResponse> => {
  try {
    // Sanitize the plotId to match expected backend format (replace dashes with underscores if needed)
    const sanitizedPlotId = plotId.replace(/-/g, '_');

    const url = `${API_BASE_URL}${CANOPY_ANALYSIS_CONFIG.ENDPOINTS.GET_RESULTS(sanitizedPlotId)}`;

    const response = await axios.get<GetCanopyResultsResponse>(url, {
      validateStatus: (status) => {
        return status < 500; // Accept 4xx as valid status to handle gracefully
      }
    });

    // If the response indicates a 404, return a default empty response instead of throwing an error
    if (response.status === 404) {
      console.warn(`Canopy analysis results not found for plotId: ${plotId}. Returning empty results.`);
      return {
        plot_id: plotId,
        plot_name: plotId,
        data: []
      };
    }

    return response.data;
  } catch (error) {
    // Handle the error gracefully by returning an empty result
    console.warn(`Error fetching canopy analysis results for plotId: ${plotId}`, error);

    // Return default empty results instead of throwing the error
    return {
      plot_id: plotId,
      plot_name: plotId,
      data: []
    };
  }
};

/**
 * Uploads an image to the server
 * @param file - The image file to upload
 * @param plotId - The ID of the plot
 * @param quadrantId - The ID of the quadrant
 * @returns Promise resolving to upload status
 */
export const uploadCanopyImage = async (
  file: File,
  plotId: string,
  quadrantId: string
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('plot_id', plotId);
  formData.append('quadrant_id', quadrantId);

  const response = await axios.post(
    `${API_BASE_URL}${CANOPY_ANALYSIS_CONFIG.ENDPOINTS.UPLOAD_IMAGE}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: CANOPY_ANALYSIS_CONFIG.API_TIMEOUT_MS,
    }
  );

  return response.data;
};

/**
 * Runs the full analysis pipeline
 * @returns Promise resolving to pipeline status
 */
export const runFullPipeline = async (): Promise<any> => {
  const response = await axios.post(
    `${API_BASE_URL}${CANOPY_ANALYSIS_CONFIG.ENDPOINTS.RUN_FULL_PIPELINE}`,
    {},
    {
      timeout: CANOPY_ANALYSIS_CONFIG.API_TIMEOUT_MS,
    }
  );

  return response.data;
};

// Interface for existing canopy images
interface ExistingCanopyImage {
  plot_id: string;
  filename: string;
  relative_path: string;
  absolute_path: string;
}

/**
 * Fetches existing canopy images from the project's data directory
 * @returns Promise resolving to an array of existing canopy images
 */
export const getExistingCanopyImages = async (): Promise<ExistingCanopyImage[]> => {
  const response = await axios.get<ExistingCanopyImage[]>(
    `${API_BASE_URL}${CANOPY_ANALYSIS_CONFIG.ENDPOINTS.GET_EXISTING_IMAGES}`,
    {
      timeout: CANOPY_ANALYSIS_CONFIG.API_TIMEOUT_MS,
    }
  );

  return response.data;
};