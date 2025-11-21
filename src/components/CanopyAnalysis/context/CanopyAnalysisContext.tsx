import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface AnalysisResult {
  canopy_cover_percent: number;
  estimated_lai: number;
  gap_fraction: number;
}

interface AnalysisImage {
  original: string;
  binary_mask: string;
  analysis_image: string;
}

interface ImageAnalysis {
  filename: string;
  results: AnalysisResult;
  images: AnalysisImage;
  plot_id: string;
  quadrant_id: string;
  timestamp: string;
}

interface CanopyAnalysisState {
  selectedFile: File | null;
  selectedPlotId: string;
  selectedQuadrantId: string;
  analysisResults: ImageAnalysis[];
  isAnalyzing: boolean;
  error: string | null;
  uploadProgress: number;
}

type CanopyAnalysisAction =
  | { type: 'SET_SELECTED_FILE'; payload: File }
  | { type: 'SET_SELECTED_PLOT_ID'; payload: string }
  | { type: 'SET_SELECTED_QUADRANT_ID'; payload: string }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_UPLOAD_PROGRESS'; payload: number }
  | { type: 'ADD_ANALYSIS_RESULT'; payload: ImageAnalysis }
  | { type: 'RESET_STATE' };

const initialState: CanopyAnalysisState = {
  selectedFile: null,
  selectedPlotId: '',
  selectedQuadrantId: '',
  analysisResults: [],
  isAnalyzing: false,
  error: null,
  uploadProgress: 0,
};

const canopyAnalysisReducer = (
  state: CanopyAnalysisState,
  action: CanopyAnalysisAction
): CanopyAnalysisState => {
  switch (action.type) {
    case 'SET_SELECTED_FILE':
      return {
        ...state,
        selectedFile: action.payload,
        error: null,
      };
    case 'SET_SELECTED_PLOT_ID':
      return {
        ...state,
        selectedPlotId: action.payload,
        error: null,
      };
    case 'SET_SELECTED_QUADRANT_ID':
      return {
        ...state,
        selectedQuadrantId: action.payload,
        error: null,
      };
    case 'SET_ANALYZING':
      return {
        ...state,
        isAnalyzing: action.payload,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isAnalyzing: false,
      };
    case 'SET_UPLOAD_PROGRESS':
      return {
        ...state,
        uploadProgress: action.payload,
      };
    case 'ADD_ANALYSIS_RESULT':
      return {
        ...state,
        analysisResults: [...state.analysisResults, action.payload],
        isAnalyzing: false,
        selectedFile: null,
      };
    case 'RESET_STATE':
      return {
        ...initialState,
        analysisResults: state.analysisResults,
      };
    default:
      return state;
  }
};

interface CanopyAnalysisContextType extends CanopyAnalysisState {
  dispatch: React.Dispatch<CanopyAnalysisAction>;
  addAnalysisResult: (result: ImageAnalysis) => void;
  resetState: () => void;
}

const CanopyAnalysisContext = createContext<CanopyAnalysisContextType | undefined>(undefined);

interface CanopyAnalysisProviderProps {
  projectId: string;
  children: ReactNode;
}

export const CanopyAnalysisProvider: React.FC<CanopyAnalysisProviderProps> = ({ 
  projectId, 
  children 
}) => {
  const [state, dispatch] = useReducer(canopyAnalysisReducer, {
    ...initialState,
    selectedPlotId: projectId, // Use projectId as default plot ID
  });

  const addAnalysisResult = (result: ImageAnalysis) => {
    dispatch({ type: 'ADD_ANALYSIS_RESULT', payload: result });
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  const contextValue: CanopyAnalysisContextType = {
    ...state,
    dispatch,
    addAnalysisResult,
    resetState,
  };

  return (
    <CanopyAnalysisContext.Provider value={contextValue}>
      {children}
    </CanopyAnalysisContext.Provider>
  );
};

export const useCanopyAnalysis = () => {
  const context = useContext(CanopyAnalysisContext);
  if (!context) {
    throw new Error(
      'useCanopyAnalysis must be used within a CanopyAnalysisProvider'
    );
  }
  return context;
};