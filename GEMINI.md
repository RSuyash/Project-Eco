# Directory Overview

This directory contains data for an environmental science project focused on vegetation analysis. The data is organized into two main categories:

1.  **Land Use/Land Cover (LULC):** A KML file for geographic analysis.
2.  **Vegetation Plotting:** Detailed data from nine survey plots, including images and field data.

# Key Files and Directories

*   `public/lulc/Nanded_City_v2.kml`: A Keyhole Markup Language (KML) file for visualizing geographic data related to Nanded City. This is likely used for land use and land cover analysis.

*   `public/vegetation-plotting/`: This directory contains the core dataset, organized by survey plots (`Plot-1` to `Plot-9`). Each plot directory includes:
    *   `Canopy_Images/`: Contains images of the forest canopy, which can be used for analyzing canopy cover and structure.
    *   `Species_Identification/`: A placeholder for species identification data.
    *   `Species_Area_Plots/`: (In some plots) Contains images of individual plants or smaller areas within the plot.

*   `public/vegetation-plotting/field-data/`: This directory contains the raw data collected in the field.
    *   `herb_floor_vegetation.csv`: Contains data on herbaceous vegetation, including species, cover percentage, and height.
    *   `woody_vegetation.csv`: Contains data on woody vegetation (trees), including species, height, girth (GBH), and condition.

# Usage

This directory is a repository for the data collected during the vegetation survey. The data can be used for various ecological analyses, such as:

*   Assessing biodiversity and species composition.
*   Analyzing forest structure and canopy cover.
*   Correlating field data with remote sensing data (from the KML file).
*   Monitoring changes in vegetation over time.

There are no code files in this project, so there are no build or run commands. The data is intended to be used with data analysis software such as R, Python with pandas, or GIS software.
