from fastapi import APIRouter, HTTPException, Path as FastAPIPath, Body
from typing import Dict, Any, List
from pathlib import Path
import os
from app.services.ecological_analysis import ecological_analysis_service
from app.core.config import CANOPY_IMAGES_DIR

router = APIRouter()

@router.get("/species-richness/{plot_id}", response_model=Dict[str, Any])
async def get_species_richness(plot_id: str = FastAPIPath(..., title="The ID of the plot")):
    """
    Get species richness and list for a specific plot.
    """
    try:
        result = ecological_analysis_service.calculate_species_richness(plot_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/diversity/{plot_id}", response_model=Dict[str, Any])
async def get_diversity_indices(plot_id: str = FastAPIPath(..., title="The ID of the plot")):
    """
    Get diversity indices (Shannon, Simpson, Evenness) for a specific plot.
    """
    try:
        result = ecological_analysis_service.calculate_diversity_indices(plot_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dominance/{plot_id}", response_model=List[Dict[str, Any]])
async def get_dominance_metrics(plot_id: str = FastAPIPath(..., title="The ID of the plot")):
    """
    Get species dominance metrics (abundance rank) for a specific plot.
    """
    try:
        result = ecological_analysis_service.calculate_dominance(plot_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/structure/{plot_id}", response_model=Dict[str, Any])
async def get_structural_metrics(plot_id: str = FastAPIPath(..., title="The ID of the plot")):
    """
    Get structural metrics (Height and DBH distributions) for a specific plot.
    """
    try:
        result = ecological_analysis_service.calculate_structural_metrics(plot_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/canopy-images", response_model=List[Dict[str, Any]])
async def get_canopy_images():
    """
    Get list of available canopy images from the plots-field-data directory.
    """
    try:
        results = []
        # Loop through each plot directory (e.g., 'Plot-1', 'Plot-2', etc.)
        for plot_dir in CANOPY_IMAGES_DIR.iterdir():
            if plot_dir.is_dir() and plot_dir.name.startswith("Plot-"):
                # Look for Canopy_Images subdirectory
                canopy_images_path = plot_dir / "Canopy_Images"
                if canopy_images_path.exists() and canopy_images_path.is_dir():
                    # Get all image files in the Canopy_Images directory
                    for img_file in canopy_images_path.iterdir():
                        if img_file.is_file() and img_file.suffix.lower() in ['.png', '.jpg', '.jpeg']:
                            results.append({
                                "plot_id": plot_dir.name,
                                "filename": img_file.name,
                                "relative_path": f"{plot_dir.name}/Canopy_Images/{img_file.name}",
                                "absolute_path": str(img_file.resolve())
                            })
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-canopy-image-by-path", response_model=Dict[str, Any])
async def analyze_canopy_image_by_path(
    plot_id: str,
    quadrant_id: str,
    image_path: str = Body(..., embed=True)
):
    """
    Analyze a canopy image using its path directly on the server.
    """
    try:
        import base64
        import os
        from pathlib import Path

        # Validate the image path to prevent directory traversal
        # The image_path starts with ./data/... so we need to handle it properly
        full_path = Path(image_path).resolve()

        # Check if file exists
        if not os.path.exists(image_path):
            # Try prepending the current working directory to the path
            abs_path = Path.cwd() / image_path.lstrip('./')
            if os.path.exists(abs_path):
                image_path = str(abs_path)
            else:
                raise HTTPException(status_code=404, detail="Image file not found")

        # Read the image file
        with open(image_path, "rb") as img_file:
            image_content = img_file.read()

        # Convert to base64 for the response
        original_image_base64 = base64.b64encode(image_content).decode('utf-8')

        # Perform actual canopy analysis using the existing service
        import cv2
        import numpy as np
        import math

        # Read the image with OpenCV
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if image is None:
            raise HTTPException(status_code=400, detail="Could not read image file")

        # Perform thresholding to separate canopy from sky using Otsu's method
        _, binary_image = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Calculate canopy cover percentage
        total_pixels = binary_image.size
        sky_pixels = np.sum(binary_image == 255)  # Assuming white is sky after thresholding
        canopy_pixels = total_pixels - sky_pixels
        canopy_cover_percent = (canopy_pixels / total_pixels) * 100

        # Calculate gap fraction
        gap_fraction = sky_pixels / total_pixels

        # Estimate LAI (Leaf Area Index) using the formula: LAI = -ln(1-GF)/k
        # where k is extinction coefficient (typically 0.537 for spherical leaf distribution)
        if gap_fraction > 0 and gap_fraction < 1:
            estimated_lai = -math.log(gap_fraction) / 0.537
        elif gap_fraction == 0:
            estimated_lai = float('inf')  # Maximum LAI if no gaps
        else:
            estimated_lai = 0  # No canopy

        # Create binary mask of canopy (green) and non-canopy (blue)
        height, width = image.shape
        color_mask = np.zeros((height, width, 3), dtype=np.uint8)
        color_mask[binary_image == 0] = [0, 180, 0]  # Green for canopy
        color_mask[binary_image == 255] = [200, 50, 50]  # Red for sky/background

        # Create the analysis result image with overlay
        gray_bgr = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
        alpha = 0.6
        blended_image = cv2.addWeighted(gray_bgr, 1 - alpha, color_mask, alpha, 0)

        # Add contour lines for better visualization
        contours, _ = cv2.findContours(binary_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(blended_image, contours, -1, (50, 255, 255), 1)  # Yellow contours

        # Create binary mask image
        binary_mask_colored = np.zeros((height, width, 3), dtype=np.uint8)
        binary_mask_colored[binary_image == 0] = [0, 255, 0]  # Green for canopy
        binary_mask_colored[binary_image == 255] = [255, 0, 0]  # Red for sky

        # Create footer with results
        footer_height = 60
        footer = np.zeros((footer_height, blended_image.shape[1], 3), dtype=np.uint8)
        text = f"Plot: {plot_id} | Canopy Cover: {canopy_cover_percent:.2f}%  |  Estimated LAI: {estimated_lai:.2f}"
        cv2.putText(footer, text, (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        # Combine the blended image and the footer
        final_image = cv2.vconcat([blended_image, footer])

        # Convert results to base64
        _, buffer1 = cv2.imencode('.jpg', final_image)
        analysis_image_base64 = base64.b64encode(buffer1.tobytes()).decode('utf-8')

        _, buffer2 = cv2.imencode('.jpg', binary_mask_colored)
        binary_mask_base64 = base64.b64encode(buffer2.tobytes()).decode('utf-8')

        # Create result
        result = {
            "analysis_results": {
                "canopy_cover_percent": canopy_cover_percent,
                "estimated_lai": estimated_lai,
                "gap_fraction": gap_fraction
            },
            "images": {
                "original": original_image_base64,
                "analysis_image": analysis_image_base64,
                "binary_mask": binary_mask_base64
            },
            "plot_id": plot_id,
            "quadrant_id": quadrant_id
        }

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
