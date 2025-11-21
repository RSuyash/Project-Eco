from fastapi import APIRouter, HTTPException, BackgroundTasks, status, UploadFile, File, Form
from app.models.pydantic_models import PipelineStatus, FullPipelineResponse, FieldDataImportRequest
from app.services.data_processing import data_processing_service
from app.services.canopy import canopy_analysis_service
from app.services.ecological_analysis import ecological_analysis_service
from app.services.visualization import visualization_service
from app.services.report_generator import report_generator_service
from app.core.config import APP_DATA_INPUT_CANOPY_IMAGES # Import the new config variable
import logging
import os

router = APIRouter()
logger = logging.getLogger(__name__)

def run_pipeline_step(step_func, step_name: str, results: list):
    """Helper to run a pipeline step and record its status."""
    try:
        logger.info(f"Running pipeline step: {step_name}")
        step_func()
        results.append(PipelineStatus(step=step_name, success=True, message=f"{step_name} completed successfully."))
        logger.info(f"Pipeline step successful: {step_name}")
    except Exception as e:
        logger.error(f"Pipeline step failed: {step_name}", exc_info=True)
        results.append(PipelineStatus(step=step_name, success=False, message=f"Error during {step_name}.", error=str(e)))
        # Stop the pipeline on failure
        raise e

@router.post("/import-field-data", status_code=status.HTTP_200_OK)
async def import_field_data_endpoint(request: FieldDataImportRequest, background_tasks: BackgroundTasks):
    """
    Receives woody and herb floor vegetation data, saves it to raw CSVs,
    and then triggers the full analysis pipeline in the background.
    """
    try:
        # Convert Pydantic models to dictionaries for saving
        woody_data_dicts = [data.dict() for data in request.woody_data]
        herb_data_dicts = [data.dict(by_alias=True) for data in request.herb_data] # Use by_alias for 'Count_or_Cover'

        # Save the raw data to CSV files
        data_processing_service.save_raw_field_data(woody_data_dicts, herb_data_dicts)

        # Trigger the full pipeline to process the newly imported data
        background_tasks.add_task(run_full_pipeline_task)

        return {"message": "Field data imported successfully. Full analysis pipeline started in the background."}
    except Exception as e:
        logger.error(f"Error importing field data: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to import field data: {e}")

@router.post("/images/upload", status_code=status.HTTP_200_OK)
async def upload_image_endpoint(
    file: UploadFile = File(...),
    plot_id: str = Form(...),
    quadrant_id: str = Form(...)
):
    """
    Receives an uploaded image file along with plot_id and quadrant_id,
    saves it to the designated input directory, and returns the file path.
    """
    try:
        # Create plot-specific directory if it doesn't exist
        plot_dir = APP_DATA_INPUT_CANOPY_IMAGES / plot_id
        os.makedirs(plot_dir, exist_ok=True)

        # Sanitize filename to prevent path traversal issues
        filename = os.path.basename(file.filename)
        file_path = plot_dir / filename

        # Save the file
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        logger.info(f"Uploaded image saved to: {file_path}")
        return {"message": "Image uploaded successfully", "file_path": str(file_path)}
    except Exception as e:
        logger.error(f"Error uploading image: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to upload image: {e}")

def run_full_pipeline_task():
    """
    Internal function to run the full pipeline, used by background tasks.
    """
    results = []
    pipeline_steps = [
        (data_processing_service.clean_vegetation_data, "Data Cleaning"),
        (canopy_analysis_service.run_canopy_analysis, "Canopy Analysis"),
        (ecological_analysis_service.calculate_biomass_and_carbon, "Ecological Calculation"),
        (visualization_service.generate_all_plots, "Plot Generation"),
        (report_generator_service.generate_report, "Report Generation"),
    ]
    try:
        for func, name in pipeline_steps:
            run_pipeline_step(func, name, results)
        logger.info("Full pipeline completed successfully.")
    except Exception:
        logger.error("Full pipeline failed and was aborted.")
        # The error is already logged and appended to results by run_pipeline_step
        pass

@router.post("/run-step/{step_name}", response_model=PipelineStatus)
async def run_single_step(step_name: str):
    """
    Run a single step of the vegetation analysis pipeline.
    
    Valid step names are:
    - `clean-data`
    - `analyze-canopy`
    - `calculate-ecology`
    - `generate-plots`
    - `generate-report`
    """
    steps = {
        "clean-data": data_processing_service.clean_vegetation_data,
        "analyze-canopy": canopy_analysis_service.run_canopy_analysis,
        "calculate-ecology": ecological_analysis_service.calculate_biomass_and_carbon,
        "generate-plots": visualization_service.generate_all_plots,
        "generate-report": report_generator_service.generate_report,
    }

    step_func = steps.get(step_name)
    if not step_func:
        raise HTTPException(status_code=404, detail=f"Step '{step_name}' not found.")

    results = []
    try:
        run_pipeline_step(step_func, step_name, results)
        return results[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run-full-pipeline", response_model=FullPipelineResponse)
async def run_full_pipeline_endpoint(background_tasks: BackgroundTasks):
    """
    Triggers the full vegetation analysis pipeline to run in the background.
    """
    background_tasks.add_task(run_full_pipeline_task)
    
    return FullPipelineResponse(
        status="Full pipeline execution started in the background.",
        details=[] # The results will be logged by the background task
    )
