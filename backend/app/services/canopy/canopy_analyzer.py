import cv2
import numpy as np
import os
import math
import logging
from app.core.config import CANOPY_IMAGE_DIR
import base64
from typing import Dict, Any

logger = logging.getLogger(__name__)

def analyze_single_image(image_path: str) -> Dict[str, Any]:
    """
    Analyzes a single canopy image and returns the analysis results and processed images.

    Args:
        image_path: The absolute path to the image file.

    Returns:
        A dictionary containing:
        - success (bool): True if analysis was successful, False otherwise.
        - message (str): A status message.
        - analysis_results (dict): Contains 'canopy_cover_percent', 'estimated_lai', 'gap_fraction'.
        - images (dict): Contains 'original', 'binary_mask', and 'analysis_image' as base64 encoded strings.
    """
    if not os.path.exists(image_path):
        return {
            "success": False,
            "message": "Image not found at specified path.",
            "analysis_results": {},
            "images": {}
        }

    try:
        # Read the original image
        original_image = cv2.imread(str(image_path))
        if original_image is None:
            raise IOError("Could not read image file.")
        
        gray_image = cv2.cvtColor(original_image, cv2.COLOR_BGR2GRAY)

        # Perform analysis
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

        # --- Create visualization ---
        gray_bgr = cv2.cvtColor(gray_image, cv2.COLOR_GRAY2BGR)
        color_mask = np.zeros_like(gray_bgr)
        color_mask[binary_image == 0] = [0, 180, 0]  # Green for canopy
        color_mask[binary_image == 255] = [200, 50, 50] # Blue for sky

        alpha = 0.6
        blended_image = cv2.addWeighted(gray_bgr, 1 - alpha, color_mask, alpha, 0)

        contours, _ = cv2.findContours(binary_image, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(blended_image, contours, -1, (50, 255, 255), 1)

        footer_height = 60
        footer = np.zeros((footer_height, blended_image.shape[1], 3), dtype=np.uint8)
        text = f"Canopy Cover: {canopy_cover_percent:.2f}% | Estimated LAI: {estimated_lai:.2f}"
        cv2.putText(footer, text, (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        final_analysis_image = cv2.vconcat([blended_image, footer])

        # --- Encode images to base64 ---
        _, buffer_orig = cv2.imencode('.jpg', original_image)
        original_base64 = base64.b64encode(buffer_orig).decode('utf-8')

        _, buffer_binary = cv2.imencode('.jpg', binary_image)
        binary_mask_base64 = base64.b64encode(buffer_binary).decode('utf-8')

        _, buffer_analysis = cv2.imencode('.jpg', final_analysis_image)
        analysis_image_base64 = base64.b64encode(buffer_analysis).decode('utf-8')

        return {
            "success": True,
            "message": "Analysis successful.",
            "analysis_results": {
                "canopy_cover_percent": round(canopy_cover_percent, 2),
                "estimated_lai": round(estimated_lai, 2),
                "gap_fraction": round(gap_fraction, 2),
            },
            "images": {
                "original": original_base64,
                "binary_mask": binary_mask_base64,
                "analysis_image": analysis_image_base64,
            }
        }

    except Exception as e:
        logger.error(f"An error occurred during single image analysis for {image_path}: {e}", exc_info=True)
        return {
            "success": False,
            "message": str(e),
            "analysis_results": {},
            "images": {}
        }
