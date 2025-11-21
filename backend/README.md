# Vegetation Analysis API Backend

## 1. Project Overview

This backend provides a comprehensive suite of tools for vegetation analysis. It is built using Python and FastAPI, offering a robust API to process field data, analyze canopy photographs, calculate ecological metrics, and generate detailed reports and visualizations.

The backend is designed with a modular architecture, allowing users to either run the entire analysis pipeline in one go or to invoke specific, granular services for individual analysis tasks.

## 2. Backend Architecture

The backend is structured as a modular Python application. The core logic is organized within the `app/services` directory, which is further divided into subdirectories for each major component of the analysis pipeline:

-   `app/services/canopy/`: Contains logic for analyzing hemispherical canopy photographs.
-   `app/services/data_processing/`: Handles the cleaning and preprocessing of raw CSV field data.
-   `app.services/ecological_analysis/`: Calculates biomass, carbon stock, and other ecological metrics.
-   `app/services/visualization/`: Responsible for generating all plots and charts. It is further divided into a `data_provider` and a `plot_generator`.
-   `app/services/report_generator/`: Generates final analysis reports in various formats.

The API is exposed via FastAPI endpoints, which are defined in `app/api/endpoints/`. The application supports two versions of the API, running in parallel.

## 3. Setup and Installation

### Prerequisites

-   Python 3.9+
-   `pip` (Python package installer)
-   A LaTeX distribution (like MiKTeX or TeX Live) is required for PDF report generation.

### Installation Steps

1.  **Navigate to the backend directory:**
    ```bash
    cd path/to/your/project/backend
    ```

2.  **Install dependencies:**
    It is highly recommended to use a virtual environment.
    ```bash
    # Create and activate a virtual environment (optional but recommended)
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

    # Install the required packages
    pip install -r requirements.txt
    ```

## 4. Running the Application

To run the FastAPI server, execute the following command from the `backend` directory:

```bash
uvicorn app.main:app --reload --port 8000
```

The server will start, and the API will be available at `http://127.0.0.1:8000`.

You can access the interactive API documentation (Swagger UI) by navigating to `http://127.0.0.1:8000/docs` in your web browser.

## 5. API Usage

The API is versioned to provide both high-level and granular control over the analysis pipeline.

### API v1: Full Pipeline Execution

The v1 API is designed for running the entire pipeline or major steps of it.

#### Endpoints

-   **`POST /api/v1/run-full-pipeline`**
    -   **Description:** Triggers the entire vegetation analysis pipeline to run in the background, from data cleaning to report generation.
    -   **Request Body:** None
    -   **Example `curl`:**
        ```bash
        curl -X POST http://127.0.0.1:8000/api/v1/run-full-pipeline
        ```

-   **`POST /api/v1/run-step/{step_name}`**
    -   **Description:** Runs a single, major step of the pipeline.
    -   **Path Parameter `step_name`:**
        -   `clean-data`
        -   `analyze-canopy`
        -   `calculate-ecology`
        -   `generate-plots`
        -   `generate-report`
    -   **Example `curl`:**
        ```bash
        curl -X POST http://127.0.0.1:8000/api/v1/run-step/clean-data
        ```

### API v2: Granular Analysis

The v2 API provides fine-grained access to individual analysis features, allowing you to request specific data, plots, or image analyses.

#### Endpoints

-   **`POST /api/v2/canopy-analysis/image`**
    -   **Description:** Analyzes a single canopy image and returns the results and processed images as base64 encoded strings.
    -   **Request Body:** A JSON object with the absolute path to the image.
        ```json
        {
          "image_path": "D:\\...\\backend\\data\\plots-field-data\\capopy_images\\Plot-1\\Canopy_Images\\center.jpg"
        }
        ```
    -   **Example `Invoke-WebRequest` (PowerShell):**
        ```powershell
        Invoke-WebRequest -Method POST -Uri "http://127.0.0.1:8000/api/v2/canopy-analysis/image" `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"image_path": "D:\\...\\path\\to\\your\\image.jpg"}'
        ```

-   **`GET /api/v2/plot-data/{plot_name}/{plot_id}`**
    -   **Description:** Returns the JSON data required to generate a specific plot for a given plot ID.
    -   **Path Parameters:**
        -   `plot_name`: The name of the plot data to retrieve (e.g., `co2_comparison`, `species_distribution`).
        -   `plot_id`: The ID of the plot (e.g., `Plot-P01`).
    -   **Example `curl`:**
        ```bash
        curl -X GET http://127.0.0.1:8000/api/v2/plot-data/co2_comparison/Plot-P01
        ```

-   **`POST /api/v2/generate-plot/{plot_name}/{plot_id}`**
    -   **Description:** Generates a single plot image on the server for a given plot ID.
    -   **Path Parameters:**
        -   `plot_name`: The name of the plot to generate (e.g., `biomass_comparison`).
        -   `plot_id`: The ID of the plot (e.g., `Plot-P02`).
    -   **Example `curl`:**
        ```bash
        curl -X POST http://127.0.0.1:8000/api/v2/generate-plot/biomass_comparison/Plot-P02
        ```
    -   **Success Response:** Returns a JSON object with the path to the newly created image file.

## 6. Command-Line Interface (CLI) Usage

A CLI is available for testing and running the pipeline directly from the terminal.

### Commands

To see all available commands, run:
```bash
python -m app.cli --help
```

-   **`python -m app.cli full-pipeline`**
    -   Runs the entire analysis pipeline.

-   **`python -m app.cli <command>`**
    -   Runs an individual step of the pipeline.
    -   Available commands: `clean-data`, `analyze-canopy`, `calculate-ecology`, `generate-plots`, `generate-report`.
    -   **Example:**
        ```bash
        python -m app.cli generate-plots
        ```
