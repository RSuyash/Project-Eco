# Canopy Analysis Component

## Overview

The Canopy Analysis component provides a complete solution for analyzing canopy images, calculating canopy cover percentage, Leaf Area Index (LAI), and gap fraction. The component allows users to upload images, process them on the backend, and visualize the results.

## Features

- **Image Upload**: Securely upload canopy images with validation
- **Analysis**: Process images to calculate canopy cover percentage, LAI, and gap fraction
- **Visualization**: View original, binary mask, and analyzed images
- **Results Dashboard**: Summary statistics and detailed results
- **Batch Processing**: Run analysis on multiple images
- **Data Export**: Export results as CSV or PDF reports
- **API Integration**: Full integration with backend analysis services

## Components

### 1. ImageUpload Component
- Handles image file selection with validation
- Allows selection of plot and quadrant IDs
- Provides upload progress feedback
- Uses helper functions for validation and error handling

### 2. AnalysisDashboard Component
- Displays summary statistics for all analyzed images
- Provides batch analysis functionality
- Shows both local and server-side analysis results
- Implements error handling with helper functions

### 3. AnalysisResults Component
- Visualizes analysis results with expandable image previews
- Shows original, binary mask, and processed images
- Provides data export functionality (CSV)
- Integrates with backend API for results retrieval

### 4. Context Provider
- Manages application state for canopy analysis
- Tracks uploaded files, analysis results, and errors
- Provides functions for adding results to state

### 5. API Service
- Provides functions for all backend API calls
- Handles single image analysis, batch analysis, and results retrieval
- Properly typed with TypeScript interfaces

### 6. Helper Utilities
- Validation functions for file uploads
- Error handling with user-friendly messages
- CSV export utilities
- Filename generation utilities

## API Endpoints Used

- `POST /api/v2/canopy-analysis/image` - Analyze single canopy image
- `POST /api/run-step/analyze-canopy` - Run batch canopy analysis
- `GET /api/v2/plot-data/canopy_summary/{plotId}` - Get analysis results
- `POST /api/images/upload` - Upload images to server
- `POST /api/run-full-pipeline` - Run complete analysis pipeline

## Usage

1. Select an image file to upload
2. Choose the plot and quadrant IDs
3. Click "Analyze Canopy Image" to process the image
4. View results in the dashboard or results tabs
5. Export results as needed

## Error Handling

The component includes comprehensive error handling:
- File validation with size and type checks
- API error handling with user-friendly messages
- Network error detection and handling
- Context-based error display

## Dependencies

- React (v19.2.0)
- Material-UI components
- Axios for API calls
- TypeScript for type safety