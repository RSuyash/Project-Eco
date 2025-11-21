from fastapi import APIRouter, HTTPException, Body, UploadFile, File, Query
from fastapi.responses import JSONResponse, FileResponse
from app.services.canopy import canopy_analyzer
from app.services.visualization import data_provider, plot_generator
from app.core.config import IMAGE_DIR
import os
import pandas as pd
import shutil
import uuid # For generating unique filenames

router = APIRouter()

# --- Canopy Analysis Endpoint ---

@router.post("/canopy-analysis/image")
async def analyze_canopy_image_endpoint(
    file: UploadFile = File(...),
    plot_id: str = Query(...),
    quadrant_id: str = Query(...)
):
    """
    Analyzes an uploaded canopy image and returns the results along with base64 encoded images.
    The image file is uploaded directly.
    """
    # Create a temporary file to save the uploaded image
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_file_path = os.path.join(IMAGE_DIR, "temp_uploads", unique_filename)
    os.makedirs(os.path.dirname(temp_file_path), exist_ok=True)

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        results = canopy_analyzer.analyze_single_image(temp_file_path)
        if not results["success"]:
            raise HTTPException(status_code=404, detail=results["message"])
        return JSONResponse(content=results)
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

# --- Plot Data Endpoints ---

@router.get("/plot-data/{plot_name}/{plot_id}")
async def get_plot_data_endpoint(plot_name: str, plot_id: str):
    """
    Returns the JSON data required to generate a specific plot.
    """
    data_func_map = {
        "plant_composition": data_provider.get_data_for_plant_composition,
        "schematic_distribution": data_provider.get_data_for_schematic_distribution,
        "species_distribution": data_provider.get_data_for_species_distribution,
        "co2_by_quadrant": data_provider.get_data_for_co2_by_quadrant,
        "tree_contribution": data_provider.get_data_for_tree_contribution,
        "co2_comparison": data_provider.get_data_for_co2_comparison,
        "biomass_comparison": data_provider.get_data_for_biomass_comparison,
        "canopy_summary": data_provider.get_data_for_canopy_summary,
    }
    
    data_func = data_func_map.get(plot_name)
    if not data_func:
        raise HTTPException(status_code=404, detail=f"Data provider for plot '{plot_name}' not found.")
        
    data = data_func(plot_id)
    
    if data is None or (isinstance(data, pd.DataFrame) and data.empty):
        raise HTTPException(status_code=404, detail=f"No data found for plot '{plot_id}'.")

    # Handle tuple returns for co2_by_quadrant
    if isinstance(data, tuple):
        data = {
            "method_1_summary": data[0].to_dict(orient='records'),
            "method_2_summary": data[1].to_dict(orient='records')
        }
    else:
        data = data.to_dict(orient='records')

    return JSONResponse(content={"plot_id": plot_id, "plot_name": plot_name, "data": data})

# --- Plot Generation Endpoints ---

@router.post("/generate-plot/{plot_name}/{plot_id}")
async def generate_plot_endpoint(plot_name: str, plot_id: str):
    """
    Generates a single plot on the server and returns the path to the file.
    """
    # Map plot names to their data provider and plot generator functions
    plot_map = {
        "nested_sampling_design": (None, plot_generator.generate_figure_1_nested_sampling_design),
        "plant_composition": (data_provider.get_data_for_plant_composition, plot_generator.generate_figure_2_plant_composition),
        "schematic_distribution": (data_provider.get_data_for_schematic_distribution, plot_generator.generate_figure_3_schematic_distribution),
        "species_distribution": (data_provider.get_data_for_species_distribution, plot_generator.generate_figure_4_species_distribution),
        "co2_by_quadrant_m1": (lambda pid: data_provider.get_data_for_co2_by_quadrant(pid)[0], plot_generator.generate_figure_5_co2_by_quadrant_m1),
        "tree_contribution_m1": (data_provider.get_data_for_tree_contribution, plot_generator.generate_figure_6_tree_contribution_m1),
        "co2_by_quadrant_m2": (lambda pid: data_provider.get_data_for_co2_by_quadrant(pid)[1], plot_generator.generate_figure_7_co2_by_quadrant_m2),
        "tree_contribution_m2": (data_provider.get_data_for_tree_contribution, plot_generator.generate_figure_8_tree_contribution_m2),
        "co2_comparison": (data_provider.get_data_for_co2_comparison, plot_generator.generate_figure_9_co2_comparison),
        "biomass_comparison": (data_provider.get_data_for_biomass_comparison, plot_generator.generate_figure_10_biomass_comparison),
        "canopy_cover_summary": (data_provider.get_data_for_canopy_summary, plot_generator.generate_figure_11_canopy_cover_summary),
        "lai_summary": (data_provider.get_data_for_canopy_summary, plot_generator.generate_figure_12_lai_summary),
    }

    if plot_name not in plot_map:
        raise HTTPException(status_code=404, detail=f"Plot generator for '{plot_name}' not found.")

    data_func, plot_func = plot_map[plot_name]
    
    # Prepare output path
    output_dir = IMAGE_DIR / "v2_generated" / plot_id
    os.makedirs(output_dir, exist_ok=True)
    output_path = output_dir / f"{plot_name}.png"

    try:
        if data_func:
            data = data_func(plot_id)
            if data is None or (isinstance(data, pd.DataFrame) and data.empty):
                raise HTTPException(status_code=404, detail=f"Could not retrieve data for plot '{plot_id}'.")
            plot_func(data, str(output_path), plot_id)
        else: # For plots without specific data, like the nested design
            plot_func(str(output_path))

        return JSONResponse(content={
            "success": True,
            "message": "Plot generated successfully.",
            "plot_path": str(output_path)
        })
    except Exception as e:
        logger.error(f"Failed to generate plot {plot_name} for {plot_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred during plot generation: {e}")
