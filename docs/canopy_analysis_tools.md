# Vegetation Canopy Analysis Tools

This document describes the canopy analysis tools implemented in the EcoData application.

## Overview

The canopy analysis tools provide comprehensive analysis of vegetation data, including:
- Herb/floor vegetation analysis using field data
- Canopy photo analysis for tree canopy coverage
- Integrated visualization of analysis results
- Project-based management of analysis data

## Components

### 1. Canopy Photo Analyzer
- Upload canopy photos for analysis
- Select plot, quadrant, and subplot for analysis
- View analysis results including canopy cover percentage and Leaf Area Index (LAI)
- Visualize processed images with overlay analysis

### 2. Canopy Cover Analyzer
- Analyze herb/floor vegetation data from field surveys
- Calculate cover percentages by vegetation type
- Perform subplot-level analysis
- Generate comparative visualizations across plots

### 3. Canopy Analysis Visualization
- Visualize canopy analysis results using charts
- Display statistics and trends
- Compare canopy cover across plots
- Analyze relationship between canopy cover and LAI

## Data Models

### CanopyCoverData
- `plotId`: Identifies the plot
- `quadrantId`: Identifies the quadrant
- `subplotId`: Identifies the subplot
- `coverType`: Vegetation type (herb, grass, shrub, tree, litter, bare_soil, other)
- `coverPercentage`: Percentage of area covered
- Additional metadata fields

### CanopyPhotoAnalysis
- `plotId`: Identifies the plot
- `quadrantId`: Identifies the quadrant
- `imageFileName`: Name of the uploaded image
- `canopyCoverPercentage`: Calculated canopy cover percentage
- `estimatedLAI`: Leaf Area Index estimation
- `gapFraction`: Fraction of sky gaps
- Additional metadata fields

## Project Integration

The canopy analysis tools are fully integrated with the project system:
- Access through `/dashboard/projects/:id/canopy-analysis`
- Works with existing field data from CSV files
- Supports 9 plots with quadrants and subplots as described in the development plan
- Visualizes both herb/floor vegetation and tree canopy data

## Usage

1. Navigate to a project in the dashboard
2. Select "Canopy Analysis" from the project tools
3. Import field data if not already loaded
4. Upload canopy photos for analysis
5. View and analyze results using the visualization tools

## Data Sources

The system processes two types of data:

### Field Data (CSV)
- `woody_vegetation.csv`: Tree and woody plant measurements
- `herb_floor_vegetation.csv`: Herb, grass, and ground cover data

### Photo Data
- Canopy photos uploaded through the interface
- Processed to calculate canopy cover percentage and LAI

## Future Enhancements

For complete integration with the Python canopy analysis script:
1. Backend service to execute `run_canopy_analysis.py`
2. Image upload and processing API
3. Results storage and retrieval system
4. Real-time analysis status updates

## Technical Implementation

The canopy analysis tools are built using:
- React with TypeScript
- Material-UI for components
- Recharts for visualizations
- IndexedDB for data persistence
- Papaparse for CSV processing