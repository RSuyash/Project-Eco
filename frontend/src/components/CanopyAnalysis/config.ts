// src/components/CanopyAnalysis/config.ts

// Configuration for canopy analysis component
export const CANOPY_ANALYSIS_CONFIG = {
  // Maximum file size for image uploads in MB
  MAX_FILE_SIZE_MB: 10,
  
  // Supported image types
  SUPPORTED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  
  // API endpoints
  ENDPOINTS: {
    ANALYZE_IMAGE: '/api/v2/canopy-analysis/image',
    BATCH_ANALYSIS: '/api/v1/run-step/analyze-canopy',
    GET_RESULTS: (plotId: string) => `/api/v2/plot-data/canopy_summary/${plotId}`,
    UPLOAD_IMAGE: '/api/images/upload',
    RUN_FULL_PIPELINE: '/api/run-full-pipeline',
    GET_EXISTING_IMAGES: '/api/v1/canopy-images'
  } as const,

  // Default timeout for API requests in milliseconds
  API_TIMEOUT_MS: 30000,
} as const;

export type CanopyAnalysisConfig = typeof CANOPY_ANALYSIS_CONFIG;