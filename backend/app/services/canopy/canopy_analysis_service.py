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
