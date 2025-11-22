import logging
from datetime import datetime
from app.domain.entities import Project, DataSource, Tool
from app.application.services.project_service import ProjectService
from app.api.dependencies import get_project_service

logger = logging.getLogger(__name__)

def initialize_default_data():
    """Initializes default projects, data sources, and tools if their repositories are empty."""
    service = get_project_service()

    # Check Projects
    if not service.get_all_projects():
        default_project = Project(
            id='proj_1',
            name='Default Vegetation Analysis',
            description='Initial project for analyzing vegetation data from field surveys.',
            createdAt='2023-01-01T00:00:00Z',
            updatedAt='2023-01-01T00:00:00Z',
            status='active',
            tools=['Plot Visualizer', 'Species Analysis', 'Canopy Analysis'],
            dataSources=[],
            progress=10,
            totalDataPoints=0,
            lastSynced='2023-01-01T00:00:00Z',
        )
        service.create_project(default_project) # Note: create_project generates ID, but we want fixed ID. 
        # Actually service.create_project overrides ID. We might need to bypass service or modify service to accept ID.
        # For initialization, let's just use repo directly or accept that ID changes, OR modify service.
        # Let's modify service to allow ID override or just use repo here.
        # Using repo directly is cleaner for seeding.
        service.project_repo.create(default_project)
        logger.info("Initialized default project.")

    # Check Data Sources
    if not service.get_all_data_sources():
        default_data_sources = [
            DataSource(id='ds_1', name='Field Data', type='CSV'),
            DataSource(id='ds_2', name='Satellite Imagery', type='GeoTIFF'),
            DataSource(id='ds_3', name='Canopy Images', type='JPEG'),
            DataSource(id='ds_4', name='Soil Samples', type='JSON'),
            DataSource(id='ds_5', name='Water Quality', type='CSV'),
            DataSource(id='ds_6', name='Weather Data', type='JSON'),
            DataSource(id='ds_7', name='Herb Floor Data', type='CSV'),
            DataSource(id='ds_8', name='Woody Vegetation', type='CSV'),
            DataSource(id='ds_9', name='Biodiversity Records', type='JSON'),
        ]
        for ds in default_data_sources:
            service.data_source_repo.create(ds)
        logger.info("Initialized default data sources.")

    # Check Tools
    if not service.get_all_tools():
        default_tools = [
            Tool(id='tool_1', name='Plot Visualizer', category='Visualization'),
            Tool(id='tool_2', name='Species Analysis', category='Analysis'),
            Tool(id='tool_3', name='Canopy Analysis', category='Analysis'),
            Tool(id='tool_4', name='Data Visualization', category='Visualization'),
            Tool(id='tool_5', name='Species-Area Curve', category='Analysis'),
            Tool(id='tool_6', name='Botanical Survey', category='Field Work'),
            Tool(id='tool_7', name='Bird Monitoring', category='Fauna'),
            Tool(id='tool_8', name='Bat Survey', category='Fauna'),
            Tool(id='tool_9', name='Habitat Analysis', category='Analysis'),
            Tool(id='tool_10', name='Statistical Modeling', category='Analysis'),
        ]
        for t in default_tools:
            service.tool_repo.create(t)
        logger.info("Initialized default tools.")
