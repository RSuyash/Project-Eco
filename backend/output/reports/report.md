
# Vegetation Analysis Report

## 1. Introduction

This report presents a comprehensive analysis of vegetation data collected from multiple plots. The primary objectives of this study were to:

- Assess the vegetation composition and structure within each plot.
- Quantify the canopy cover and Leaf Area Index (LAI) using hemispherical photography.
- Estimate the Aboveground Biomass (AGB) and sequestered CO₂ for the tree species identified.
- Provide a detailed, plot-by-plot summary of the findings.

The results of this analysis can be used to understand the ecological characteristics of the study area and to inform land management and conservation strategies.

## 2. Methodology

The analysis pipeline consists of three main stages: data processing, canopy analysis, and ecological analysis.

### 2.1. Data Processing

The raw vegetation survey data was cleaned and preprocessed to ensure consistency and accuracy. The key steps in this process include:

- Renaming columns for clarity.
- Filling missing values for quadrant IDs.
- Standardizing plant type descriptions (e.g., 'Saplings' to 'Sapling').
- Assigning a unique ID to each plant entry.
- Converting relevant columns to numeric types.
- Calculating the effective Diameter at Breast Height (DBH) for multi-stemmed trees.

```python
import pandas as pd
import numpy as np
import os
import logging
from app.core.config import (
    RAW_WOODY_DATA,
    RAW_HERB_DATA,
    CLEANED_VEG_FULL_PATH,
    CLEANED_VEG_TREES_PATH,
)

logger = logging.getLogger(__name__)

def clean_vegetation_data():
    """
    Cleans and preprocesses vegetation survey data from separate woody and herb files,
    using paths from the central config.
    """
    logging.info(f"Starting data cleaning process for woody: {RAW_WOODY_DATA}, herb: {RAW_HERB_DATA}")

    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(CLEANED_VEG_FULL_PATH), exist_ok=True)
    os.makedirs(os.path.dirname(CLEANED_VEG_TREES_PATH), exist_ok=True)

    # Load woody vegetation data
    woody_df = pd.read_csv(RAW_WOODY_DATA)
    woody_df.rename(columns={
        'Quad_ID': 'Quadrant',
        'Species_Scientific': 'Species',
        'Growth_Form': 'Type',
        'GBH_Stem1_cm': 'Girth_cm_Stem1',
        'GBH_Stem2_cm': 'Girth_cm_Stem2',
        'Height_m': 'Height_m',
        'Tree_ID': 'ID',
        'Plot_ID': 'Plot'
    }, inplace=True)
    woody_df['Number'] = 1 # Each row represents one individual
    woody_df['ID'] = woody_df['ID'].astype(str) # Ensure ID is string
    # Add placeholder for Girth_cm_Stem3 if it doesn't exist (for consistency)
    if 'Girth_cm_Stem3' not in woody_df.columns:
        woody_df['Girth_cm_Stem3'] = np.nan

    # Load herb floor vegetation data
    herb_df = pd.read_csv(RAW_HERB_DATA)
    herb_df.rename(columns={
        'Layer_Type': 'Type',
        'Species_or_Category': 'Species',
        'Count_or_Cover%': 'Number', # Note: This is a percentage, not a count
        'Avg_Height_cm': 'Height_m',
        'Plot_ID': 'Plot'
    }, inplace=True)
    # Map Subplot_ID to Quadrant
    subplot_to_quadrant_map = {
        'SP1': 'Q1',
        'SP2': 'Q2',
        'SP3': 'Q3',
        'SP4': 'Q4'
    }
    herb_df['Quadrant'] = herb_df['Subplot_ID'].map(subplot_to_quadrant_map)
    herb_df['Height_m'] = herb_df['Height_m'] / 100 # Convert cm to meters
    herb_df['Girth_cm_Stem1'] = np.nan # No girth for herbs
    herb_df['Girth_cm_Stem2'] = np.nan # No girth for herbs
    herb_df['Girth_cm_Stem3'] = np.nan # No girth for herbs
    herb_df['ID'] = herb_df['Type'] + '_' + herb_df['Subplot_ID'].astype(str) # Create a unique ID
    herb_df['ID'] = herb_df['ID'].astype(str) # Ensure ID is string

    # Combine the dataframes
    df = pd.concat([woody_df, herb_df], ignore_index=True)
    df['Plot'] = 'Plot-' + df['Plot'].astype(str) # Standardize plot names to 'Plot-P01', 'Plot-P02', etc.

    # Ensure all expected columns are present, filling missing ones with NaN
    expected_cols = [
        'Plot', 'Quadrant', 'ID', 'Type', 'Number', 'Species', 'Girth_cm_Stem1',
        'Girth_cm_Stem2', 'Girth_cm_Stem3', 'Height_m'
    ]
    for col in expected_cols:
        if col not in df.columns:
            df[col] = np.nan

    # Reorder columns to match the original script's expected structure as much as possible
    df = df[expected_cols + [col for col in df.columns if col not in expected_cols]]

    # The rest of the cleaning logic remains largely the same, operating on the combined 'df'
    # Rename columns for consistency (some already done above, but keeping for robustness)
    df.rename(columns={
        'Quadrant ID': 'Quadrant', # This might be from original data, ensure it's handled
        'GBH (Girth at Breast Height) - First Branch': 'Girth_cm_Stem1',
        'GBH (Girth at Breast Height) - Second Branch': 'Girth_cm_Stem2',
        'GBH (Girth at Breast Height) - Third Branch': 'Girth_cm_Stem3',
        'Height (m)': 'Height_m'
    }, inplace=True)

    df_cleaned = df.copy()
    df_cleaned.loc[:, 'Quadrant'] = df_cleaned['Quadrant'].ffill()
    df_cleaned['Type'] = df_cleaned['Type'].str.strip().replace('Saplings', 'Sapling')
    
    numeric_cols = ['Number', 'Girth_cm_Stem1', 'Girth_cm_Stem2', 'Girth_cm_Stem3', 'Height_m']
    for col in numeric_cols:
        df_cleaned[col] = pd.to_numeric(df_cleaned[col], errors='coerce')

    # --- Data Cleaning for Species ---
    df_cleaned['Species'] = df_cleaned['Species'].str.strip()
    df_cleaned['Species'] = df_cleaned['Species'].replace('', np.nan)
    
    # Save the full cleaned data
    df_cleaned.to_csv(CLEANED_VEG_FULL_PATH, index=False)
    logging.info(f"Full cleaned data saved to {CLEANED_VEG_FULL_PATH}")

    df_trees = df_cleaned[df_cleaned['Type'] == 'Tree'].copy()
    df_trees.dropna(subset=['Girth_cm_Stem1'], inplace=True)
    
    # Calculate DBH for each stem
    df_trees['DBH1_cm'] = df_trees['Girth_cm_Stem1'] / np.pi
    df_trees['DBH2_cm'] = df_trees['Girth_cm_Stem2'] / np.pi
    df_trees['DBH3_cm'] = df_trees['Girth_cm_Stem3'] / np.pi
    
    # Calculate effective DBH
    df_trees['Effective_DBH_cm'] = np.sqrt(
        df_trees['DBH1_cm'].fillna(0)**2 + 
        df_trees['DBH2_cm'].fillna(0)**2 + 
        df_trees['DBH3_cm'].fillna(0)**2
    )
    
    df_trees.dropna(subset=['Height_m'], inplace=True)

    # Save the cleaned trees data
    df_trees.to_csv(CLEANED_VEG_TREES_PATH, index=False)
    logging.info(f"Cleaned tree data saved to {CLEANED_VEG_TREES_PATH}")
    
    return df_cleaned, df_trees

```

### 2.2. Canopy Analysis

Canopy cover and LAI were estimated from hemispherical photographs using the following procedure:

- Each image was converted to grayscale.
- Otsu's thresholding method was applied to create a binary image, separating sky from canopy.
- Canopy cover was calculated as the percentage of canopy pixels.
- Gap fraction (the proportion of sky pixels) was used to estimate the LAI.
- A visual representation of the analysis was generated for each image.

```python
import cv2
import numpy as np
import os
import math
import csv
import logging
from app.core.config import (
    CANOPY_IMAGES_DIR,
    CANOPY_RESULTS_PATH,
    CANOPY_IMAGE_DIR,
)

logger = logging.getLogger(__name__)

def analyze_canopy_image(image_path, plot_id, csv_writer):
    """Analyzes a single canopy image and writes the results to a CSV."""
    base_filename = os.path.basename(image_path)
    
    gray_image = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
    if gray_image is None:
        logging.error(f"Could not read image {image_path}")
        return

    _, binary_image = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    total_pixels = binary_image.size
    sky_pixels = np.sum(binary_image == 255)
    canopy_pixels = total_pixels - sky_pixels
    canopy_cover_percent = (canopy_pixels / total_pixels) * 100
    gap_fraction = sky_pixels / total_pixels

    if gap_fraction > 0:
        estimated_lai = -2 * 0.537 * math.log(gap_fraction)
    else:
        estimated_lai = float('inf')

    # --- Create new visualization ---

    # 1. Create the base color mask
    gray_bgr = cv2.cvtColor(gray_image, cv2.COLOR_GRAY2BGR)
    color_mask = np.zeros_like(gray_bgr)
    color_mask[binary_image == 0] = [0, 180, 0]  # Green for canopy
    color_mask[binary_image == 255] = [200, 50, 50] # Blue for sky

    # 2. Create the semi-transparent overlay
    alpha = 0.6 # Transparency factor
    blended_image = cv2.addWeighted(gray_bgr, 1 - alpha, color_mask, alpha, 0)

    # 3. Add contour lines for sky gaps
    contours, _ = cv2.findContours(binary_image, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(blended_image, contours, -1, (50, 255, 255), 1) # Bright yellow contours

    # 4. Add footer with results
    footer_height = 60
    footer = np.zeros((footer_height, blended_image.shape[1], 3), dtype=np.uint8)
    text = f"Plot: {plot_id} | Canopy Cover: {canopy_cover_percent:.2f}%  |  Estimated LAI: {estimated_lai:.2f}"
    cv2.putText(footer, text, (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    # 5. Combine the blended image and the footer
    final_image = cv2.vconcat([blended_image, footer])
    
    # Save the final visual analysis image
    plot_output_dir = os.path.join(CANOPY_IMAGE_DIR, plot_id)
    os.makedirs(plot_output_dir, exist_ok=True)
    output_image_path = os.path.join(plot_output_dir, f"analysis_{base_filename}")
    cv2.imwrite(str(output_image_path), final_image)

    csv_writer.writerow([plot_id, base_filename, canopy_cover_percent, estimated_lai, gap_fraction])
    logging.info(f"Canopy analysis complete for {os.path.join(plot_id, base_filename)}")

    # Explicitly delete large image objects to free up memory
    del gray_image, binary_image, gray_bgr, color_mask, blended_image, footer, final_image

def run_canopy_analysis():
    """
    Runs the canopy analysis for all images in a directory, 
    processing subdirectories as separate plots.
    """
    logging.info("Starting canopy analysis with subdirectory processing.")
    os.makedirs(os.path.dirname(CANOPY_RESULTS_PATH), exist_ok=True)
    os.makedirs(CANOPY_IMAGE_DIR, exist_ok=True)

    with open(CANOPY_RESULTS_PATH, 'w', newline='') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(['plot_id', 'filename', 'canopy_cover_percent', 'estimated_lai', 'gap_fraction'])

        # Iterate through plot directories (e.g., 'Plot-1', 'Plot-2')
        for plot_dir_name in sorted(os.listdir(CANOPY_IMAGES_DIR)):
            plot_path = os.path.join(CANOPY_IMAGES_DIR, plot_dir_name)
            # Check for both 'Plot-' and 'plot-' prefixes (case-insensitive)
            if os.path.isdir(plot_path) and plot_dir_name.lower().startswith('plot-'):
                # Standardize plot_id to 'Plot-PXX' format
                try:
                    # Extract number, assuming format like 'plot-1' or 'Plot-01'
                    plot_number_str = plot_dir_name.split('-')[1]
                    plot_number = int(plot_number_str)
                    standardized_plot_id = f"Plot-P{plot_number:02d}"
                except (IndexError, ValueError):
                    logging.warning(f"Could not parse plot number from directory name: {plot_dir_name}. Skipping.")
                    continue
                
                canopy_images_path = os.path.join(plot_path, 'Canopy_Images')
                if os.path.isdir(canopy_images_path):
                    for filename in sorted(os.listdir(canopy_images_path)):
                        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                            image_path = os.path.join(canopy_images_path, filename)
                            analyze_canopy_image(image_path, standardized_plot_id, csv_writer)
                else:
                    logging.warning(f"Canopy_Images directory not found in {plot_path}. Skipping.")
            else:
                logging.warning(f"Skipping non-plot directory or file: {plot_path}")

    logging.info(f"Canopy analysis finished. Results saved to {CANOPY_RESULTS_PATH}")

```

### 2.3. Ecological Analysis

Aboveground Biomass (AGB) and CO₂ equivalent were calculated for each tree using established allometric equations:

- Wood density values were assigned to each tree species based on a predefined map.
- Two different allometric equations were used to estimate AGB:
    1.  A height-inclusive model.
    2.  A height-exclusive (DBH-only) model.
- The estimated AGB was then used to calculate the carbon stock and the corresponding CO₂ equivalent.

```python
import pandas as pd
import numpy as np
import os
import logging
from app.core.config import CLEANED_VEG_TREES_PATH, ECO_RESULTS_PATH

logger = logging.getLogger(__name__)

def calculate_biomass_and_carbon():
    """
    Calculates biomass and carbon stock for trees, using paths from the central config.
    """
    logging.info(f"Starting ecological calculations for {CLEANED_VEG_TREES_PATH}")
    
    os.makedirs(os.path.dirname(ECO_RESULTS_PATH), exist_ok=True)
    
    df_trees = pd.read_csv(CLEANED_VEG_TREES_PATH)

    # --- Ecological Calculations ---
    wood_density_map = {
        'Ficus racemosa': 0.48, 
        'Pongamia pinnata': 0.65, 
        'Indian drumstick': 0.45,
        'Azadirachta indica': 0.58,
        'Caesalpinia pulcherrima': 0.6, # Using a generic value for ornamental tree
        'Hibiscus rosa-sinensis': 0.5, # Using a generic value for large shrub/small tree
        'Neem': 0.58, # Synonym for Azadirachta indica
        'default': 0.62
    }
    df_trees['Wood_Density_g_cm3'] = df_trees['Species'].map(wood_density_map).fillna(wood_density_map['default'])

    # Method 1 (Height-Inclusive)
    df_trees['AGB_M1_kg'] = 0.0673 * (df_trees['Wood_Density_g_cm3'] * df_trees['Effective_DBH_cm']**2 * df_trees['Height_m'])**0.976
    df_trees['Carbon_Stock_M1_kg'] = (df_trees['AGB_M1_kg'] * 1.26) * 0.47
    df_trees['CO2_Eq_M1_kg'] = df_trees['Carbon_Stock_M1_kg'] * (44/12)

    # Method 2 (Height-Exclusive)
    D = df_trees['Effective_DBH_cm']
    rho = df_trees['Wood_Density_g_cm3']
    # Ensure no log(0) or negative logs
    D_safe = D.replace(0, np.nan).dropna()
    rho_safe = rho.replace(0, np.nan).dropna()

    df_trees['AGB_M2_kg'] = np.exp(-1.803 - 0.976 * np.log(rho_safe) + 2.673 * np.log(D_safe) - 0.0299 * (np.log(D_safe))**2)
    df_trees['Carbon_Stock_M2_kg'] = (df_trees['AGB_M2_kg'] * 1.26) * 0.47
    df_trees['CO2_Eq_M2_kg'] = df_trees['Carbon_Stock_M2_kg'] * (44/12)
    
    df_trees.to_csv(ECO_RESULTS_PATH, index=False)
    logging.info(f"Ecological calculations complete. Results saved to {ECO_RESULTS_PATH}")
    
    return df_trees
```

## 3. Results and Discussion

### Plot-P01

**Summary Statistics**
| Quadrant   | Type      |   Number | Species                             |
|:-----------|:----------|---------:|:------------------------------------|
| Q1         | Tree      |        1 | Pongamia pinnata (Karanj)           |
| Q2         | Tree      |        1 | Ficus racemosa                      |
| Q2         | Tree      |        1 | Pongamia pinnata (Karanj)           |
| Q2         | Tree      |        1 | Ficus racemosa                      |
| Q2         | Tree      |        1 | Pongamia pinnata (Karanj)           |
| Q3         | Tree      |        1 | Moringa oleifera (Indian drumstick) |
| Q4         | Tree      |        1 | Pongamia pinnata (Karanj)           |
| Q1         | Herb      |       28 | Mixed Herbs                         |
| Q1         | Grass     |       28 | Mixed Grasses                       |
| Q1         | Litter    |       21 | Decomposing Matter                  |
| Q1         | Bare Soil |       35 | Bare Ground                         |
| Q2         | Herb      |       25 | Mixed Herbs                         |
| Q2         | Grass     |       18 | Mixed Grasses                       |
| Q2         | Litter    |       18 | Decomposing Matter                  |
| Q2         | Bare Soil |       45 | Bare Ground                         |
| Q3         | Herb      |       15 | Mixed Herbs                         |
| Q3         | Grass     |       21 | Mixed Grasses                       |
| Q3         | Litter    |       14 | Decomposing Matter                  |
| Q3         | Bare Soil |       55 | Bare Ground                         |
| Q4         | Herb      |       41 | Mixed Herbs                         |
| Q4         | Grass     |       15 | Mixed Grasses                       |
| Q4         | Litter    |       46 | Decomposing Matter                  |
| Q4         | Bare Soil |       -4 | Bare Ground                         |

![figure_2_plant_composition_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P01\01_general\figure_2_plant_composition_by_quadrant.png)
*Figure: figure 2 plant composition by quadrant*

![figure_3_schematic_plant_distribution.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P01\01_general\figure_3_schematic_plant_distribution.png)
*Figure: figure 3 schematic plant distribution*

![figure_4_distribution_of_identified_plant_species.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P01\01_general\figure_4_distribution_of_identified_plant_species.png)
*Figure: figure 4 distribution of identified plant species*

![figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P01\02_carbon_analysis\figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png)
*Figure: figure 10 comparison of biomass estimates vs tree diameter*

![figure_5_co2_sequestered_by_quadrant_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P01\02_carbon_analysis\figure_5_co2_sequestered_by_quadrant_m1.png)
*Figure: figure 5 co2 sequestered by quadrant m1*

![figure_6_tree_contribution_to_carbon_stock_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P01\02_carbon_analysis\figure_6_tree_contribution_to_carbon_stock_m1.png)
*Figure: figure 6 tree contribution to carbon stock m1*

![figure_7_co2_sequestered_by_quadrant_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P01\02_carbon_analysis\figure_7_co2_sequestered_by_quadrant_m2.png)
*Figure: figure 7 co2 sequestered by quadrant m2*

![figure_8_tree_contribution_to_carbon_stock_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P01\02_carbon_analysis\figure_8_tree_contribution_to_carbon_stock_m2.png)
*Figure: figure 8 tree contribution to carbon stock m2*

![figure_9_comparison_of_co2_sequestered_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P01\02_carbon_analysis\figure_9_comparison_of_co2_sequestered_by_quadrant.png)
*Figure: figure 9 comparison of co2 sequestered by quadrant*

![figure_11_summary_of_canopy_cover.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P01\03_canopy_analysis\figure_11_summary_of_canopy_cover.png)
*Figure: figure 11 summary of canopy cover*

![figure_12_summary_of_estimated_lai.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P01\03_canopy_analysis\figure_12_summary_of_estimated_lai.png)
*Figure: figure 12 summary of estimated lai*


### Plot-P02

**Summary Statistics**
| Quadrant   | Type      |   Number | Species                   |
|:-----------|:----------|---------:|:--------------------------|
| Q1         | Tree      |        1 | Azadirachta indica (Neem) |
| Q1         | Tree      |        1 | Caesalpinia pulcherrima   |
| Q2         | Tree      |        1 | Hibiscus rosa-sinensis    |
| Q2         | Tree      |        1 | Hibiscus rosa-sinensis    |
| Q2         | Tree      |        1 | Hibiscus rosa-sinensis    |
| Q2         | Tree      |        1 | Hibiscus rosa-sinensis    |
| Q3         | Tree      |        1 | Hibiscus rosa-sinensis    |
| Q3         | Tree      |        1 | Hibiscus rosa-sinensis    |
| Q3         | Tree      |        1 | Hibiscus rosa-sinensis    |
| Q3         | Tree      |        1 | Azadirachta indica (Neem) |
| Q3         | Tree      |        1 | Hibiscus rosa-sinensis    |
| Q3         | Tree      |        1 | Hibiscus rosa-sinensis    |
| Q3         | Tree      |        1 | Hibiscus rosa-sinensis    |
| Q3         | Tree      |        1 | Hibiscus rosa-sinensis    |
| Q3         | Tree      |        1 | Hibiscus rosa-sinensis    |
| Q4         | Tree      |        1 | Caesalpinia pulcherrima   |
| Q4         | Tree      |        1 | Caesalpinia pulcherrima   |
| Q4         | Tree      |        1 | Caesalpinia pulcherrima   |
| Q1         | Herb      |       13 | Mixed Herbs               |
| Q1         | Grass     |       32 | Mixed Grasses             |
| Q1         | Litter    |       17 | Decomposing Matter        |
| Q1         | Bare Soil |       46 | Bare Ground               |
| Q2         | Herb      |       19 | Mixed Herbs               |
| Q2         | Grass     |       26 | Mixed Grasses             |
| Q2         | Litter    |       40 | Decomposing Matter        |
| Q2         | Bare Soil |       14 | Bare Ground               |
| Q3         | Herb      |       22 | Mixed Herbs               |
| Q3         | Grass     |       14 | Mixed Grasses             |
| Q3         | Litter    |       44 | Decomposing Matter        |
| Q3         | Bare Soil |       35 | Bare Ground               |
| Q4         | Herb      |       27 | Mixed Herbs               |
| Q4         | Grass     |       22 | Mixed Grasses             |
| Q4         | Litter    |       40 | Decomposing Matter        |
| Q4         | Bare Soil |       21 | Bare Ground               |

![figure_2_plant_composition_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P02\01_general\figure_2_plant_composition_by_quadrant.png)
*Figure: figure 2 plant composition by quadrant*

![figure_3_schematic_plant_distribution.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P02\01_general\figure_3_schematic_plant_distribution.png)
*Figure: figure 3 schematic plant distribution*

![figure_4_distribution_of_identified_plant_species.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P02\01_general\figure_4_distribution_of_identified_plant_species.png)
*Figure: figure 4 distribution of identified plant species*

![figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P02\02_carbon_analysis\figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png)
*Figure: figure 10 comparison of biomass estimates vs tree diameter*

![figure_5_co2_sequestered_by_quadrant_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P02\02_carbon_analysis\figure_5_co2_sequestered_by_quadrant_m1.png)
*Figure: figure 5 co2 sequestered by quadrant m1*

![figure_6_tree_contribution_to_carbon_stock_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P02\02_carbon_analysis\figure_6_tree_contribution_to_carbon_stock_m1.png)
*Figure: figure 6 tree contribution to carbon stock m1*

![figure_7_co2_sequestered_by_quadrant_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P02\02_carbon_analysis\figure_7_co2_sequestered_by_quadrant_m2.png)
*Figure: figure 7 co2 sequestered by quadrant m2*

![figure_8_tree_contribution_to_carbon_stock_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P02\02_carbon_analysis\figure_8_tree_contribution_to_carbon_stock_m2.png)
*Figure: figure 8 tree contribution to carbon stock m2*

![figure_9_comparison_of_co2_sequestered_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P02\02_carbon_analysis\figure_9_comparison_of_co2_sequestered_by_quadrant.png)
*Figure: figure 9 comparison of co2 sequestered by quadrant*

![figure_11_summary_of_canopy_cover.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P02\03_canopy_analysis\figure_11_summary_of_canopy_cover.png)
*Figure: figure 11 summary of canopy cover*

![figure_12_summary_of_estimated_lai.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P02\03_canopy_analysis\figure_12_summary_of_estimated_lai.png)
*Figure: figure 12 summary of estimated lai*


### Plot-P03

**Summary Statistics**
| Quadrant   | Type      |   Number | Species                    |
|:-----------|:----------|---------:|:---------------------------|
| Q1         | Tree      |        1 | Gliricidia sepium          |
| Q2         | Tree      |        1 | Gliricidia sepium          |
| Q2         | Tree      |        1 | Boswellia serrata          |
| Q3         | Tree      |        1 | Terminalia elliptica (Ain) |
| Q4         | Tree      |        1 | Anogeissus latifolia       |
| Q1         | Herb      |       24 | Mixed Herbs                |
| Q1         | Grass     |       14 | Mixed Grasses              |
| Q1         | Litter    |       50 | Decomposing Matter         |
| Q1         | Bare Soil |       10 | Bare Ground                |
| Q2         | Herb      |       12 | Mixed Herbs                |
| Q2         | Grass     |       19 | Mixed Grasses              |
| Q2         | Litter    |       23 | Decomposing Matter         |
| Q2         | Bare Soil |       45 | Bare Ground                |
| Q3         | Herb      |       12 | Mixed Herbs                |
| Q3         | Grass     |       13 | Mixed Grasses              |
| Q3         | Litter    |       19 | Decomposing Matter         |
| Q3         | Bare Soil |       51 | Bare Ground                |
| Q4         | Herb      |       36 | Mixed Herbs                |
| Q4         | Grass     |       23 | Mixed Grasses              |
| Q4         | Litter    |       42 | Decomposing Matter         |
| Q4         | Bare Soil |       11 | Bare Ground                |

![figure_2_plant_composition_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P03\01_general\figure_2_plant_composition_by_quadrant.png)
*Figure: figure 2 plant composition by quadrant*

![figure_3_schematic_plant_distribution.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P03\01_general\figure_3_schematic_plant_distribution.png)
*Figure: figure 3 schematic plant distribution*

![figure_4_distribution_of_identified_plant_species.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P03\01_general\figure_4_distribution_of_identified_plant_species.png)
*Figure: figure 4 distribution of identified plant species*

![figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P03\02_carbon_analysis\figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png)
*Figure: figure 10 comparison of biomass estimates vs tree diameter*

![figure_5_co2_sequestered_by_quadrant_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P03\02_carbon_analysis\figure_5_co2_sequestered_by_quadrant_m1.png)
*Figure: figure 5 co2 sequestered by quadrant m1*

![figure_6_tree_contribution_to_carbon_stock_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P03\02_carbon_analysis\figure_6_tree_contribution_to_carbon_stock_m1.png)
*Figure: figure 6 tree contribution to carbon stock m1*

![figure_7_co2_sequestered_by_quadrant_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P03\02_carbon_analysis\figure_7_co2_sequestered_by_quadrant_m2.png)
*Figure: figure 7 co2 sequestered by quadrant m2*

![figure_8_tree_contribution_to_carbon_stock_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P03\02_carbon_analysis\figure_8_tree_contribution_to_carbon_stock_m2.png)
*Figure: figure 8 tree contribution to carbon stock m2*

![figure_9_comparison_of_co2_sequestered_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P03\02_carbon_analysis\figure_9_comparison_of_co2_sequestered_by_quadrant.png)
*Figure: figure 9 comparison of co2 sequestered by quadrant*

![figure_11_summary_of_canopy_cover.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P03\03_canopy_analysis\figure_11_summary_of_canopy_cover.png)
*Figure: figure 11 summary of canopy cover*

![figure_12_summary_of_estimated_lai.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P03\03_canopy_analysis\figure_12_summary_of_estimated_lai.png)
*Figure: figure 12 summary of estimated lai*


### Plot-P04

**Summary Statistics**
| Quadrant   | Type      |   Number | Species            |
|:-----------|:----------|---------:|:-------------------|
| Q1         | Tree      |        1 | Gliricidia sepium  |
| Q2         | Tree      |        1 | Gliricidia sepium  |
| Q3         | Tree      |        1 | Boswellia serrata  |
| Q4         | Tree      |        1 | Ficus racemosa     |
| Q1         | Herb      |       14 | Mixed Herbs        |
| Q1         | Grass     |       27 | Mixed Grasses      |
| Q1         | Litter    |       43 | Decomposing Matter |
| Q1         | Bare Soil |       22 | Bare Ground        |
| Q2         | Herb      |       12 | Mixed Herbs        |
| Q2         | Grass     |       13 | Mixed Grasses      |
| Q2         | Litter    |       46 | Decomposing Matter |
| Q2         | Bare Soil |       40 | Bare Ground        |
| Q3         | Herb      |       45 | Mixed Herbs        |
| Q3         | Grass     |       18 | Mixed Grasses      |
| Q3         | Litter    |       22 | Decomposing Matter |
| Q3         | Bare Soil |       13 | Bare Ground        |
| Q4         | Herb      |       23 | Mixed Herbs        |
| Q4         | Grass     |       24 | Mixed Grasses      |
| Q4         | Litter    |       20 | Decomposing Matter |
| Q4         | Bare Soil |       44 | Bare Ground        |

![figure_2_plant_composition_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P04\01_general\figure_2_plant_composition_by_quadrant.png)
*Figure: figure 2 plant composition by quadrant*

![figure_3_schematic_plant_distribution.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P04\01_general\figure_3_schematic_plant_distribution.png)
*Figure: figure 3 schematic plant distribution*

![figure_4_distribution_of_identified_plant_species.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P04\01_general\figure_4_distribution_of_identified_plant_species.png)
*Figure: figure 4 distribution of identified plant species*

![figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P04\02_carbon_analysis\figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png)
*Figure: figure 10 comparison of biomass estimates vs tree diameter*

![figure_5_co2_sequestered_by_quadrant_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P04\02_carbon_analysis\figure_5_co2_sequestered_by_quadrant_m1.png)
*Figure: figure 5 co2 sequestered by quadrant m1*

![figure_6_tree_contribution_to_carbon_stock_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P04\02_carbon_analysis\figure_6_tree_contribution_to_carbon_stock_m1.png)
*Figure: figure 6 tree contribution to carbon stock m1*

![figure_7_co2_sequestered_by_quadrant_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P04\02_carbon_analysis\figure_7_co2_sequestered_by_quadrant_m2.png)
*Figure: figure 7 co2 sequestered by quadrant m2*

![figure_8_tree_contribution_to_carbon_stock_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P04\02_carbon_analysis\figure_8_tree_contribution_to_carbon_stock_m2.png)
*Figure: figure 8 tree contribution to carbon stock m2*

![figure_9_comparison_of_co2_sequestered_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P04\02_carbon_analysis\figure_9_comparison_of_co2_sequestered_by_quadrant.png)
*Figure: figure 9 comparison of co2 sequestered by quadrant*

![figure_11_summary_of_canopy_cover.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P04\03_canopy_analysis\figure_11_summary_of_canopy_cover.png)
*Figure: figure 11 summary of canopy cover*

![figure_12_summary_of_estimated_lai.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P04\03_canopy_analysis\figure_12_summary_of_estimated_lai.png)
*Figure: figure 12 summary of estimated lai*


### Plot-P05

**Summary Statistics**
| Quadrant   | Type      |   Number | Species                    |
|:-----------|:----------|---------:|:---------------------------|
| Q1         | Tree      |        1 | Syzygium cumini (Jambul)   |
| Q1         | Tree      |        1 | Terminalia elliptica (Ain) |
| Q1         | Tree      |        1 | Ficus racemosa             |
| Q2         | Tree      |        1 | Garcinia indica (Kokum)    |
| Q2         | Tree      |        1 | Phyllanthus emblica (Amla) |
| Q2         | Tree      |        1 | Mangifera indica           |
| Q3         | Tree      |        1 | Ficus benghalensis         |
| Q3         | Tree      |        1 | Alstonia scholaris         |
| Q4         | Tree      |        1 | Mallotus philippensis      |
| Q4         | Tree      |        1 | Syzygium caryophyllatum    |
| Q1         | Herb      |       31 | Mixed Herbs                |
| Q1         | Grass     |       21 | Mixed Grasses              |
| Q1         | Litter    |       14 | Decomposing Matter         |
| Q1         | Bare Soil |       30 | Bare Ground                |
| Q2         | Herb      |       32 | Mixed Herbs                |
| Q2         | Grass     |       12 | Mixed Grasses              |
| Q2         | Litter    |       20 | Decomposing Matter         |
| Q2         | Bare Soil |       45 | Bare Ground                |
| Q3         | Herb      |       32 | Mixed Herbs                |
| Q3         | Grass     |       23 | Mixed Grasses              |
| Q3         | Litter    |       39 | Decomposing Matter         |
| Q3         | Bare Soil |        5 | Bare Ground                |
| Q4         | Herb      |       35 | Mixed Herbs                |
| Q4         | Grass     |       17 | Mixed Grasses              |
| Q4         | Litter    |       46 | Decomposing Matter         |
| Q4         | Bare Soil |       17 | Bare Ground                |

![figure_2_plant_composition_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P05\01_general\figure_2_plant_composition_by_quadrant.png)
*Figure: figure 2 plant composition by quadrant*

![figure_3_schematic_plant_distribution.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P05\01_general\figure_3_schematic_plant_distribution.png)
*Figure: figure 3 schematic plant distribution*

![figure_4_distribution_of_identified_plant_species.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P05\01_general\figure_4_distribution_of_identified_plant_species.png)
*Figure: figure 4 distribution of identified plant species*

![figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P05\02_carbon_analysis\figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png)
*Figure: figure 10 comparison of biomass estimates vs tree diameter*

![figure_5_co2_sequestered_by_quadrant_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P05\02_carbon_analysis\figure_5_co2_sequestered_by_quadrant_m1.png)
*Figure: figure 5 co2 sequestered by quadrant m1*

![figure_6_tree_contribution_to_carbon_stock_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P05\02_carbon_analysis\figure_6_tree_contribution_to_carbon_stock_m1.png)
*Figure: figure 6 tree contribution to carbon stock m1*

![figure_7_co2_sequestered_by_quadrant_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P05\02_carbon_analysis\figure_7_co2_sequestered_by_quadrant_m2.png)
*Figure: figure 7 co2 sequestered by quadrant m2*

![figure_8_tree_contribution_to_carbon_stock_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P05\02_carbon_analysis\figure_8_tree_contribution_to_carbon_stock_m2.png)
*Figure: figure 8 tree contribution to carbon stock m2*

![figure_9_comparison_of_co2_sequestered_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P05\02_carbon_analysis\figure_9_comparison_of_co2_sequestered_by_quadrant.png)
*Figure: figure 9 comparison of co2 sequestered by quadrant*


### Plot-P06

**Summary Statistics**
| Quadrant   | Type      |   Number | Species                   |
|:-----------|:----------|---------:|:--------------------------|
| Q1         | Tree      |        1 | Pongamia pinnata (Karanj) |
| Q1         | Tree      |        1 | Tectona grandis (teak)    |
| Q1         | Tree      |        1 | Gliricidia sepium         |
| Q1         | Tree      |        1 | Tectona grandis (teak)    |
| Q2         | Tree      |        1 | Acacia nilotica           |
| Q3         | Tree      |        1 | Pongamia pinnata (Karanj) |
| Q3         | Tree      |        1 | Gliricidia sepium         |
| Q4         | Tree      |        1 | Tectona grandis (teak)    |
| Q4         | Tree      |        1 | Ficus religiosa           |
| Q1         | Herb      |       44 | Mixed Herbs               |
| Q1         | Grass     |       40 | Mixed Grasses             |
| Q1         | Litter    |       35 | Decomposing Matter        |
| Q1         | Bare Soil |        4 | Bare Ground               |
| Q2         | Herb      |       11 | Mixed Herbs               |
| Q2         | Grass     |       13 | Mixed Grasses             |
| Q2         | Litter    |       30 | Decomposing Matter        |
| Q2         | Bare Soil |       46 | Bare Ground               |
| Q3         | Herb      |       32 | Mixed Herbs               |
| Q3         | Grass     |       25 | Mixed Grasses             |
| Q3         | Litter    |       25 | Decomposing Matter        |
| Q3         | Bare Soil |       23 | Bare Ground               |
| Q4         | Herb      |       13 | Mixed Herbs               |
| Q4         | Grass     |       20 | Mixed Grasses             |
| Q4         | Litter    |       21 | Decomposing Matter        |
| Q4         | Bare Soil |       49 | Bare Ground               |

![figure_2_plant_composition_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P06\01_general\figure_2_plant_composition_by_quadrant.png)
*Figure: figure 2 plant composition by quadrant*

![figure_3_schematic_plant_distribution.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P06\01_general\figure_3_schematic_plant_distribution.png)
*Figure: figure 3 schematic plant distribution*

![figure_4_distribution_of_identified_plant_species.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P06\01_general\figure_4_distribution_of_identified_plant_species.png)
*Figure: figure 4 distribution of identified plant species*

![figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P06\02_carbon_analysis\figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png)
*Figure: figure 10 comparison of biomass estimates vs tree diameter*

![figure_5_co2_sequestered_by_quadrant_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P06\02_carbon_analysis\figure_5_co2_sequestered_by_quadrant_m1.png)
*Figure: figure 5 co2 sequestered by quadrant m1*

![figure_6_tree_contribution_to_carbon_stock_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P06\02_carbon_analysis\figure_6_tree_contribution_to_carbon_stock_m1.png)
*Figure: figure 6 tree contribution to carbon stock m1*

![figure_7_co2_sequestered_by_quadrant_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P06\02_carbon_analysis\figure_7_co2_sequestered_by_quadrant_m2.png)
*Figure: figure 7 co2 sequestered by quadrant m2*

![figure_8_tree_contribution_to_carbon_stock_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P06\02_carbon_analysis\figure_8_tree_contribution_to_carbon_stock_m2.png)
*Figure: figure 8 tree contribution to carbon stock m2*

![figure_9_comparison_of_co2_sequestered_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P06\02_carbon_analysis\figure_9_comparison_of_co2_sequestered_by_quadrant.png)
*Figure: figure 9 comparison of co2 sequestered by quadrant*

![figure_11_summary_of_canopy_cover.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P06\03_canopy_analysis\figure_11_summary_of_canopy_cover.png)
*Figure: figure 11 summary of canopy cover*

![figure_12_summary_of_estimated_lai.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P06\03_canopy_analysis\figure_12_summary_of_estimated_lai.png)
*Figure: figure 12 summary of estimated lai*


### Plot-P07

**Summary Statistics**
| Quadrant   | Type      |   Number | Species                   |
|:-----------|:----------|---------:|:--------------------------|
| Q1         | Tree      |        1 | Gliricidia sepium         |
| Q2         | Tree      |        1 | Pongamia pinnata (Karanj) |
| Q3         | Tree      |        1 | Anogeissus latifolia      |
| Q4         | Tree      |        1 | Dalbergia latifolia       |
| Q1         | Herb      |       16 | Mixed Herbs               |
| Q1         | Grass     |       39 | Mixed Grasses             |
| Q1         | Litter    |       32 | Decomposing Matter        |
| Q1         | Bare Soil |       20 | Bare Ground               |
| Q2         | Herb      |       24 | Mixed Herbs               |
| Q2         | Grass     |       38 | Mixed Grasses             |
| Q2         | Litter    |       26 | Decomposing Matter        |
| Q2         | Bare Soil |       16 | Bare Ground               |
| Q3         | Herb      |       24 | Mixed Herbs               |
| Q3         | Grass     |       27 | Mixed Grasses             |
| Q3         | Litter    |       42 | Decomposing Matter        |
| Q3         | Bare Soil |        5 | Bare Ground               |
| Q4         | Herb      |       21 | Mixed Herbs               |
| Q4         | Grass     |       11 | Mixed Grasses             |
| Q4         | Litter    |       58 | Decomposing Matter        |
| Q4         | Bare Soil |       10 | Bare Ground               |

![figure_2_plant_composition_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P07\01_general\figure_2_plant_composition_by_quadrant.png)
*Figure: figure 2 plant composition by quadrant*

![figure_3_schematic_plant_distribution.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P07\01_general\figure_3_schematic_plant_distribution.png)
*Figure: figure 3 schematic plant distribution*

![figure_4_distribution_of_identified_plant_species.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P07\01_general\figure_4_distribution_of_identified_plant_species.png)
*Figure: figure 4 distribution of identified plant species*

![figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P07\02_carbon_analysis\figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png)
*Figure: figure 10 comparison of biomass estimates vs tree diameter*

![figure_5_co2_sequestered_by_quadrant_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P07\02_carbon_analysis\figure_5_co2_sequestered_by_quadrant_m1.png)
*Figure: figure 5 co2 sequestered by quadrant m1*

![figure_6_tree_contribution_to_carbon_stock_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P07\02_carbon_analysis\figure_6_tree_contribution_to_carbon_stock_m1.png)
*Figure: figure 6 tree contribution to carbon stock m1*

![figure_7_co2_sequestered_by_quadrant_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P07\02_carbon_analysis\figure_7_co2_sequestered_by_quadrant_m2.png)
*Figure: figure 7 co2 sequestered by quadrant m2*

![figure_8_tree_contribution_to_carbon_stock_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P07\02_carbon_analysis\figure_8_tree_contribution_to_carbon_stock_m2.png)
*Figure: figure 8 tree contribution to carbon stock m2*

![figure_9_comparison_of_co2_sequestered_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P07\02_carbon_analysis\figure_9_comparison_of_co2_sequestered_by_quadrant.png)
*Figure: figure 9 comparison of co2 sequestered by quadrant*

![figure_11_summary_of_canopy_cover.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P07\03_canopy_analysis\figure_11_summary_of_canopy_cover.png)
*Figure: figure 11 summary of canopy cover*

![figure_12_summary_of_estimated_lai.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P07\03_canopy_analysis\figure_12_summary_of_estimated_lai.png)
*Figure: figure 12 summary of estimated lai*


### Plot-P08

**Summary Statistics**
| Quadrant   | Type      |   Number | Species                  |
|:-----------|:----------|---------:|:-------------------------|
| Q1         | Tree      |        1 | Boswellia serrata        |
| Q2         | Tree      |        1 | Tectona grandis          |
| Q2         | Tree      |        1 | Gliricidia sepium        |
| Q3         | Tree      |        1 | Lagerstroemia microcarpa |
| Q4         | Tree      |        1 | Albizia lebbeck          |
| Q4         | Tree      |        1 | Ficus racemosa           |
| Q1         | Herb      |       19 | Mixed Herbs              |
| Q1         | Grass     |       33 | Mixed Grasses            |
| Q1         | Litter    |       27 | Decomposing Matter       |
| Q1         | Bare Soil |       21 | Bare Ground              |
| Q2         | Herb      |       21 | Mixed Herbs              |
| Q2         | Grass     |       29 | Mixed Grasses            |
| Q2         | Litter    |       29 | Decomposing Matter       |
| Q2         | Bare Soil |       31 | Bare Ground              |
| Q3         | Herb      |       28 | Mixed Herbs              |
| Q3         | Grass     |       20 | Mixed Grasses            |
| Q3         | Litter    |       52 | Decomposing Matter       |
| Q3         | Bare Soil |        2 | Bare Ground              |
| Q4         | Herb      |       18 | Mixed Herbs              |
| Q4         | Grass     |       12 | Mixed Grasses            |
| Q4         | Litter    |       38 | Decomposing Matter       |
| Q4         | Bare Soil |       32 | Bare Ground              |

![figure_2_plant_composition_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P08\01_general\figure_2_plant_composition_by_quadrant.png)
*Figure: figure 2 plant composition by quadrant*

![figure_3_schematic_plant_distribution.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P08\01_general\figure_3_schematic_plant_distribution.png)
*Figure: figure 3 schematic plant distribution*

![figure_4_distribution_of_identified_plant_species.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P08\01_general\figure_4_distribution_of_identified_plant_species.png)
*Figure: figure 4 distribution of identified plant species*

![figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P08\02_carbon_analysis\figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png)
*Figure: figure 10 comparison of biomass estimates vs tree diameter*

![figure_5_co2_sequestered_by_quadrant_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P08\02_carbon_analysis\figure_5_co2_sequestered_by_quadrant_m1.png)
*Figure: figure 5 co2 sequestered by quadrant m1*

![figure_6_tree_contribution_to_carbon_stock_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P08\02_carbon_analysis\figure_6_tree_contribution_to_carbon_stock_m1.png)
*Figure: figure 6 tree contribution to carbon stock m1*

![figure_7_co2_sequestered_by_quadrant_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P08\02_carbon_analysis\figure_7_co2_sequestered_by_quadrant_m2.png)
*Figure: figure 7 co2 sequestered by quadrant m2*

![figure_8_tree_contribution_to_carbon_stock_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P08\02_carbon_analysis\figure_8_tree_contribution_to_carbon_stock_m2.png)
*Figure: figure 8 tree contribution to carbon stock m2*

![figure_9_comparison_of_co2_sequestered_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P08\02_carbon_analysis\figure_9_comparison_of_co2_sequestered_by_quadrant.png)
*Figure: figure 9 comparison of co2 sequestered by quadrant*

![figure_11_summary_of_canopy_cover.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P08\03_canopy_analysis\figure_11_summary_of_canopy_cover.png)
*Figure: figure 11 summary of canopy cover*

![figure_12_summary_of_estimated_lai.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P08\03_canopy_analysis\figure_12_summary_of_estimated_lai.png)
*Figure: figure 12 summary of estimated lai*


### Plot-P09

**Summary Statistics**
| Quadrant   | Type      |   Number | Species            |
|:-----------|:----------|---------:|:-------------------|
| Q1         | Tree      |        1 | Mangifera indica   |
| Q3         | Tree      |        1 | Ficus religiosa    |
| Q1         | Herb      |       40 | Mixed Herbs        |
| Q1         | Grass     |       25 | Mixed Grasses      |
| Q1         | Litter    |       18 | Decomposing Matter |
| Q1         | Bare Soil |       17 | Bare Ground        |
| Q2         | Herb      |       45 | Mixed Herbs        |
| Q2         | Grass     |       30 | Mixed Grasses      |
| Q2         | Litter    |       55 | Decomposing Matter |
| Q2         | Bare Soil |       10 | Bare Ground        |
| Q3         | Herb      |       15 | Mixed Herbs        |
| Q3         | Grass     |       10 | Mixed Grasses      |
| Q3         | Litter    |       36 | Decomposing Matter |
| Q3         | Bare Soil |       47 | Bare Ground        |
| Q4         | Herb      |       20 | Mixed Herbs        |
| Q4         | Grass     |       19 | Mixed Grasses      |
| Q4         | Litter    |       54 | Decomposing Matter |
| Q4         | Bare Soil |       18 | Bare Ground        |

![figure_2_plant_composition_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P09\01_general\figure_2_plant_composition_by_quadrant.png)
*Figure: figure 2 plant composition by quadrant*

![figure_3_schematic_plant_distribution.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P09\01_general\figure_3_schematic_plant_distribution.png)
*Figure: figure 3 schematic plant distribution*

![figure_4_distribution_of_identified_plant_species.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P09\01_general\figure_4_distribution_of_identified_plant_species.png)
*Figure: figure 4 distribution of identified plant species*

![figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P09\02_carbon_analysis\figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png)
*Figure: figure 10 comparison of biomass estimates vs tree diameter*

![figure_5_co2_sequestered_by_quadrant_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P09\02_carbon_analysis\figure_5_co2_sequestered_by_quadrant_m1.png)
*Figure: figure 5 co2 sequestered by quadrant m1*

![figure_6_tree_contribution_to_carbon_stock_m1.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P09\02_carbon_analysis\figure_6_tree_contribution_to_carbon_stock_m1.png)
*Figure: figure 6 tree contribution to carbon stock m1*

![figure_7_co2_sequestered_by_quadrant_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P09\02_carbon_analysis\figure_7_co2_sequestered_by_quadrant_m2.png)
*Figure: figure 7 co2 sequestered by quadrant m2*

![figure_8_tree_contribution_to_carbon_stock_m2.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P09\02_carbon_analysis\figure_8_tree_contribution_to_carbon_stock_m2.png)
*Figure: figure 8 tree contribution to carbon stock m2*

![figure_9_comparison_of_co2_sequestered_by_quadrant.png](D:\Projects\Env-Sci\Project-V1\backend\output\images\Plot-P09\02_carbon_analysis\figure_9_comparison_of_co2_sequestered_by_quadrant.png)
*Figure: figure 9 comparison of co2 sequestered by quadrant*


## 4. Conclusion

This report provides a detailed analysis of the vegetation structure and carbon sequestration potential of the surveyed plots. The plot-by-plot breakdown of results allows for a granular understanding of the ecological variations within the study area. The findings can be a valuable resource for monitoring vegetation health, assessing carbon stocks, and making informed decisions for sustainable land management.

Further research could involve:

-   Long-term monitoring of the plots to track changes in vegetation dynamics.
-   Inclusion of below-ground biomass for a more complete carbon stock assessment.
-   Correlation of the findings with other environmental factors such as soil type and microclimate.
