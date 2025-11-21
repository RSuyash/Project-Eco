// src/components/CanopyAnalysis/index.ts

// Export main context
export { CanopyAnalysisProvider, useCanopyAnalysis } from './context/CanopyAnalysisContext';

// Export components
export { default as ImageUpload } from './components/ImageUpload';
export { default as AnalysisDashboard } from './components/AnalysisDashboard';
export { default as AnalysisResults } from './components/AnalysisResults';

// Export API functions
export { 
  analyzeCanopyImage, 
  runBatchCanopyAnalysis, 
  getCanopyAnalysisResults,
  uploadCanopyImage,
  runFullPipeline
} from './api/canopyAnalysisApi';

// Export helper functions
export { 
  formatNumber, 
  generateTimestampedFilename, 
  resultsToCsv, 
  downloadCsv,
  handleApiError,
  validateImageFile
} from './utils/helpers';