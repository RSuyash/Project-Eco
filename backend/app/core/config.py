from pathlib import Path
import os

# BASE_DIR is the 'backend' directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "output"
LOG_DIR = OUTPUT_DIR / "logs"
IMAGE_DIR = OUTPUT_DIR / "images"
CANOPY_IMAGE_DIR = IMAGE_DIR / "canopy_analysis"
REPORTS_DIR = OUTPUT_DIR / "reports"

# Create directories if they don't exist
os.makedirs(LOG_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)
os.makedirs(CANOPY_IMAGE_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)


# Input data paths
RAW_WOODY_DATA = DATA_DIR / "plots-field-data" / "field-data" / "woody_vegetation.csv"
RAW_HERB_DATA = DATA_DIR / "plots-field-data" / "field-data" / "herb_floor_vegetation.csv"
CANOPY_IMAGES_DIR = DATA_DIR / "plots-field-data" / "capopy_images"
APP_DATA_INPUT_CANOPY_IMAGES = DATA_DIR / "canopy_input_images"

# Create input data directories if they don't exist
os.makedirs(APP_DATA_INPUT_CANOPY_IMAGES, exist_ok=True)

# Output data paths
CLEANED_VEG_FULL_PATH = OUTPUT_DIR / "data" / "cleaned_vegetation_data_full.csv"
CLEANED_VEG_TREES_PATH = OUTPUT_DIR / "data" / "cleaned_vegetation_data_trees.csv"
CANOPY_RESULTS_PATH = OUTPUT_DIR / "data" / "canopy_analysis_results.csv"
ECO_RESULTS_PATH = OUTPUT_DIR / "data" / "ecological_analysis_results.csv"

# Report paths
MANUAL_REPORT_PATH = REPORTS_DIR / "manual_report.md"
REPORT_MD_PATH = REPORTS_DIR / "report.md"
REPORT_DOCX_PATH = REPORTS_DIR / "report.docx"
REPORT_PDF_PATH = REPORTS_DIR / "report.pdf"

# Service paths
# This is a bit of a hack for pypandoc in the report generator
# In a containerized environment, this would be handled differently.
SRC_DIR = BASE_DIR / "app"
DATA_PROCESSING_SCRIPT_PATH = SRC_DIR / "services" / "data_processing" / "data_processing_service.py"
CANOPY_ANALYSIS_SCRIPT_PATH = SRC_DIR / "services" / "canopy" / "canopy_analysis_service.py"
ECOLOGICAL_ANALYSIS_SCRIPT_PATH = SRC_DIR / "services" / "ecological_analysis" / "ecological_analysis_service.py"
