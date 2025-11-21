import typer
import logging
from app.services.data_processing import data_processing_service
from app.services.canopy import canopy_analysis_service
from app.services.ecological_analysis import ecological_analysis_service
from app.services.visualization import visualization_service
from app.services.report_generator import report_generator_service

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = typer.Typer(help="A CLI for running the vegetation analysis pipeline.")

@app.command()
def clean_data():
    """
    Cleans the raw vegetation data.
    """
    typer.echo("Starting step 1: Cleaning vegetation data...")
    try:
        data_processing_service.clean_vegetation_data()
        typer.secho("Step 1: Completed successfully.", fg=typer.colors.GREEN)
    except Exception as e:
        typer.secho(f"Step 1 failed: {e}", fg=typer.colors.RED)
        raise typer.Exit(code=1)

@app.command()
def analyze_canopy():
    """
    Analyzes canopy images to calculate cover percentage and LAI.
    """
    typer.echo("Starting step 2: Running canopy analysis...")
    try:
        canopy_analysis_service.run_canopy_analysis()
        typer.secho("Step 2: Completed successfully.", fg=typer.colors.GREEN)
    except Exception as e:
        typer.secho(f"Step 2 failed: {e}", fg=typer.colors.RED)
        raise typer.Exit(code=1)

@app.command()
def calculate_ecology():
    """
    Calculates biomass and carbon stock from the cleaned tree data.
    """
    typer.echo("Starting step 3: Calculating biomass and carbon...")
    try:
        ecological_analysis_service.calculate_biomass_and_carbon()
        typer.secho("Step 3: Completed successfully.", fg=typer.colors.GREEN)
    except Exception as e:
        typer.secho(f"Step 3 failed: {e}", fg=typer.colors.RED)
        raise typer.Exit(code=1)

@app.command()
def generate_plots():
    """
    Generates all visualization plots from the analysis data.
    """
    typer.echo("Starting step 4: Generating plots...")
    try:
        visualization_service.generate_all_plots()
        typer.secho("Step 4: Completed successfully.", fg=typer.colors.GREEN)
    except Exception as e:
        typer.secho(f"Step 4 failed: {e}", fg=typer.colors.RED)
        raise typer.Exit(code=1)

@app.command()
def generate_report():
    """
    Generates the final analysis report in Markdown, DOCX, and PDF.
    """
    typer.echo("Starting step 5: Generating report...")
    try:
        report_generator_service.generate_report()
        typer.secho("Step 5: Completed successfully.", fg=typer.colors.GREEN)
    except Exception as e:
        typer.secho(f"Step 5 failed: {e}", fg=typer.colors.RED)
        raise typer.Exit(code=1)

@app.command(name="full-pipeline")
def run_full_pipeline():
    """
    Runs the entire vegetation analysis pipeline from start to finish.
    """
    typer.echo("--- Running Full Vegetation Analysis Pipeline ---")
    clean_data()
    analyze_canopy()
    calculate_ecology()
    generate_plots()
    generate_report()
    typer.secho("--- Vegetation Analysis Pipeline Finished Successfully ---", fg=typer.colors.BRIGHT_GREEN)

if __name__ == "__main__":
    app()
