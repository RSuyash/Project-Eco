# Qwen Code Context: Vegetation Analysis Tools

## Project Overview

This is a React-based vegetation analysis application built with TypeScript, Vite, and Material-UI. The application is designed to analyze vegetation data from environmental science research, specifically for woody vegetation and herb/floor vegetation across multiple plots, quadrants, and subplots. The project includes tools for species analysis, structural analysis, spatial analysis, and graphical visualization of vegetation data.

## Project Structure

```
D:\Projects\Env-Sci\Project-V1/
├── docs/                    # Documentation files
├── node_modules/            # Node.js dependencies
├── public/                  # Public assets
│   └── run_canopy_analysis.py  # Python script for canopy image analysis
├── src/                     # Main source code
│   ├── App.tsx              # Main application routing
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles
│   ├── contexts/            # React context providers (e.g., ThemeContext)
│   ├── pages/               # Application pages (HomePage, DashboardPage)
│   └── theme/               # Material-UI theme configuration
├── .gitignore               # Git ignore configuration
├── GEMINI.md                # Alternative context file
├── package.json             # Project configuration and dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
├── index.html               # HTML template
└── Vegetation_Analysis_Tools_Development_Plan.md  # Development plan
```

## Key Technologies

- **Framework**: React (v19.2.0) with TypeScript
- **Build Tool**: Vite (v7.2.2)
- **UI Library**: Material-UI (MUI) with icons and data grid
- **Styling**: CSS with Google Fonts (Inter, Fira Code)
- **Charts**: Recharts for data visualization
- **State Management**: React Context API and Redux
- **Routing**: React Router v7
- **Data Processing**: Papaparse for CSV processing
- **Database**: Dexie.js for IndexedDB access

## Major Features

### 1. Species Analysis Tools
- Species Richness Calculator
- Dominance Index Tool
- Shannon-Wiener Diversity Index
- Species Frequency Analysis

### 2. Structural Analysis Tools
- Tree Height Distribution Mapper
- Diameter Class Distribution
- Basal Area Calculator
- Volume Estimation Tool

### 3. Spatial Analysis Tools
- Plot Comparisons Dashboard
- Quadrant Analysis Tool
- Subplot Comparisons
- Species Mapping Tool

### 4. Graphical Visualization Tools
- Multi-Plot Radar Charts
- Species Composition Pie Charts
- Height vs DBH Scatter Plots
- Heat Maps for spatial visualization

### 5. Statistical Tools
- Correlation Matrix
- ANOVA Comparisons
- Cluster Analysis

## Application Pages

- **Home Page** (`/`): Main landing page
- **Dashboard** (`/dashboard/*`): Main application interface with various analysis tools

## Building and Running

### Prerequisites
- Node.js (version compatible with the dependencies in package.json)
- npm or yarn package manager

### Installation
```bash
npm install
```

### Development
```bash
# Start development server
npm run dev

# The application will be available at http://localhost:5173
```

### Notes on Testing
Current package.json shows no test scripts are configured, with a placeholder test command that simply echoes an error message.

## Python Canopy Analysis Component

The project also includes a Python script (`public/run_canopy_analysis.py`) that performs canopy image analysis:
- Analyzes canopy images to calculate canopy cover percentage
- Estimates Leaf Area Index (LAI)
- Creates visualization overlays for analysis results
- Outputs results in CSV format

## Data Models

The application works with the following data types:
- Woody vegetation data (species, height, DBH, condition, growth form)
- Herb/floor vegetation data (cover percentage, height, ground layer composition)
- Canopy photo analysis data (canopy cover percentage, LAI, gap fraction)

## Development Conventions

- TypeScript is used throughout the application for type safety
- Material-UI components are used for consistent UI elements
- React hooks for state management
- Component-based architecture organized by pages and contexts
- Responsive design for tablet and desktop use

## Project Priorities

Based on the development plan document, the key tools being developed include:
1. Plot-Level Summary Dashboard
2. Species Dominance Ladder
3. Structural Profile Charts
4. Diversity Hotspot Mapper
5. Cover Type Analyzer

## Data Flow

The application supports multiple data sources:
- CSV files for field data (woody vegetation, herb/floor vegetation)
- Image uploads for canopy photo analysis
- Processing through the Python script to calculate canopy metrics
- Visualization of results through various chart types