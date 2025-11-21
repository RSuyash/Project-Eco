import os
import pandas as pd
import pypandoc
import logging
from app.core.config import (
    CLEANED_VEG_FULL_PATH,
    ECO_RESULTS_PATH,
    CANOPY_RESULTS_PATH,
    IMAGE_DIR,
    REPORTS_DIR,
    REPORT_MD_PATH,
    REPORT_DOCX_PATH,
    REPORT_PDF_PATH,
    DATA_PROCESSING_SCRIPT_PATH,
    CANOPY_ANALYSIS_SCRIPT_PATH,
    ECOLOGICAL_ANALYSIS_SCRIPT_PATH,
)

logger = logging.getLogger(__name__)

def get_methodology_from_scripts():
    """Reads the analysis scripts and extracts the methodology."""
    methodology = {
        'data_cleaning': '',
        'canopy_analysis': '',
        'biomass_calculation': ''
    }
    try:
        with open(DATA_PROCESSING_SCRIPT_PATH, 'r') as f:
            methodology['data_cleaning'] = f.read()
        with open(CANOPY_ANALYSIS_SCRIPT_PATH, 'r') as f:
            methodology['canopy_analysis'] = f.read()
        with open(ECOLOGICAL_ANALYSIS_SCRIPT_PATH, 'r') as f:
            methodology['biomass_calculation'] = f.read()
    except FileNotFoundError as e:
        logging.error(f"Error reading methodology scripts: {e}")
    return methodology

def generate_report():
    """Generates a comprehensive report in Markdown, DOCX, and PDF formats."""
    
    logging.info("Generating full analysis report...")
    os.makedirs(REPORTS_DIR, exist_ok=True)

    try:
        df_full = pd.read_csv(CLEANED_VEG_FULL_PATH)
        df_trees = pd.read_csv(ECO_RESULTS_PATH)
        df_canopy = pd.read_csv(CANOPY_RESULTS_PATH)
    except FileNotFoundError as e:
        logging.error(f"Error loading data files for report generation: {e}")
        return

    methodology = get_methodology_from_scripts()

    report_md = f"""
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
{methodology['data_cleaning']}
```

### 2.2. Canopy Analysis

Canopy cover and LAI were estimated from hemispherical photographs using the following procedure:

- Each image was converted to grayscale.
- Otsu's thresholding method was applied to create a binary image, separating sky from canopy.
- Canopy cover was calculated as the percentage of canopy pixels.
- Gap fraction (the proportion of sky pixels) was used to estimate the LAI.
- A visual representation of the analysis was generated for each image.

```python
{methodology['canopy_analysis']}
```

### 2.3. Ecological Analysis

Aboveground Biomass (AGB) and CO₂ equivalent were calculated for each tree using established allometric equations:

- Wood density values were assigned to each tree species based on a predefined map.
- Two different allometric equations were used to estimate AGB:
    1.  A height-inclusive model.
    2.  A height-exclusive (DBH-only) model.
- The estimated AGB was then used to calculate the carbon stock and the corresponding CO₂ equivalent.

```python
{methodology['biomass_calculation']}
```

## 3. Results and Discussion
"""
    if 'Plot' not in df_full.columns:
        logging.error("'Plot' column not found in full data. Cannot generate per-plot results.")
        return

    plot_numbers = sorted(df_full['Plot'].unique())
    for plot_no in plot_numbers:
        report_md += f"""
### {plot_no}
"""
        plot_full_data = df_full[df_full['Plot'] == plot_no]
        
        report_md += """
**Summary Statistics**
"""
        report_md += plot_full_data[['Quadrant', 'Type', 'Number', 'Species']].to_markdown(index=False)
        report_md += "\n\n"
        
        plot_image_dir = os.path.join(IMAGE_DIR, plot_no)
        if os.path.exists(plot_image_dir):
            for section in sorted(os.listdir(plot_image_dir)):
                section_dir = os.path.join(plot_image_dir, section)
                if os.path.isdir(section_dir):
                    for image_file in sorted(os.listdir(section_dir)):
                        abs_image_path = os.path.abspath(os.path.join(section_dir, image_file))
                        report_md += f"![{image_file}]({abs_image_path})\n"
                        report_md += f"*Figure: {image_file.replace('_', ' ').replace('.png', '')}*\n\n"

    report_md += """
## 4. Conclusion

This report provides a detailed analysis of the vegetation structure and carbon sequestration potential of the surveyed plots. The plot-by-plot breakdown of results allows for a granular understanding of the ecological variations within the study area. The findings can be a valuable resource for monitoring vegetation health, assessing carbon stocks, and making informed decisions for sustainable land management.

Further research could involve:

-   Long-term monitoring of the plots to track changes in vegetation dynamics.
-   Inclusion of below-ground biomass for a more complete carbon stock assessment.
-   Correlation of the findings with other environmental factors such as soil type and microclimate.
"""

    with open(REPORT_MD_PATH, 'w', encoding='utf-8') as f:
        f.write(report_md)
    logging.info(f"Generated Markdown report: {REPORT_MD_PATH}")

    try:
        pypandoc.convert_file(str(REPORT_MD_PATH), 'docx', outputfile=str(REPORT_DOCX_PATH))
        logging.info(f"Generated DOCX report: {REPORT_DOCX_PATH}")
    except Exception as e:
        logging.error(f"Failed to generate DOCX report: {e}")

    try:
        pypandoc.convert_file(str(REPORT_MD_PATH), 'pdf', outputfile=str(REPORT_PDF_PATH), extra_args=['--pdf-engine=xelatex'])
        logging.info(f"Generated PDF report: {REPORT_PDF_PATH}")
    except Exception as e:
        logging.error(f"Failed to generate PDF report: {e}. Ensure you have a LaTeX distribution (like MiKTeX or TeX Live) installed.")