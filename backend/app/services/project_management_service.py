import json
import os
from typing import List, Dict, Any, Optional # Import Optional
from pathlib import Path
from datetime import datetime
from app.models.pydantic_models import Project, ProjectCreate, DataSource, Tool
from app.core.config import DATA_DIR
import logging

logger = logging.getLogger(__name__)

# Define file paths for storing data
PROJECTS_FILE = DATA_DIR / "projects.json"
DATA_SOURCES_FILE = DATA_DIR / "data_sources.json"
TOOLS_FILE = DATA_DIR / "tools.json"

def _read_json_file(file_path: Path) -> List[Dict[str, Any]]:
    """Reads data from a JSON file."""
    if not file_path.exists():
        return []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        logger.warning(f"Could not decode JSON from {file_path}. Returning empty list.")
        return []
    except Exception as e:
        logger.error(f"Error reading {file_path}: {e}")
        return []

def _write_json_file(file_path: Path, data: List[Dict[str, Any]]):
    """Writes data to a JSON file."""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        logger.error(f"Error writing to {file_path}: {e}")

# --- Project Operations ---
def get_all_projects() -> List[Project]:
    """Retrieves all projects."""
    projects_data = _read_json_file(PROJECTS_FILE)
    return [Project(**p) for p in projects_data]

def get_project_by_id(project_id: str) -> Optional[Project]:
    """Retrieves a single project by its ID."""
    projects = get_all_projects()
    return next((p for p in projects if p.id == project_id), None)

import uuid
from datetime import datetime

# ... (imports)

def create_project(project_create: ProjectCreate) -> Project:
    """Creates a new project."""
    projects = get_all_projects()
    
    new_project = Project(
        id=f"project_{int(datetime.now().timestamp() * 1000)}", # Generate ID similar to frontend logic but server-side
        name=project_create.name,
        description=project_create.description,
        createdAt=datetime.utcnow().isoformat() + "Z",
        updatedAt=datetime.utcnow().isoformat() + "Z",
        status=project_create.status,
        tools=project_create.tools,
        dataSources=project_create.dataSources,
        progress=0,
        totalDataPoints=0,
        lastSynced=datetime.utcnow().isoformat() + "Z"
    )
    
    projects.append(new_project)
    _write_json_file(PROJECTS_FILE, [p.dict() for p in projects])
    return new_project

def update_project(project_id: str, updated_project: Project) -> Optional[Project]:
    """Updates an existing project."""
    projects = get_all_projects()
    found = False
    for i, p in enumerate(projects):
        if p.id == project_id:
            projects[i] = updated_project
            found = True
            break
    if found:
        _write_json_file(PROJECTS_FILE, [p.dict() for p in projects])
        return updated_project
    return None

def delete_project(project_id: str):
    """Deletes a project by its ID."""
    projects = get_all_projects()
    initial_len = len(projects)
    projects = [p for p in projects if p.id != project_id]
    if len(projects) == initial_len:
        raise ValueError(f"Project with ID {project_id} not found.")
    _write_json_file(PROJECTS_FILE, [p.dict() for p in projects])

# --- Data Source Operations ---
def get_all_data_sources() -> List[DataSource]:
    """Retrieves all data sources."""
    data_sources_data = _read_json_file(DATA_SOURCES_FILE)
    return [DataSource(**ds) for ds in data_sources_data]

def get_data_source_by_id(ds_id: str) -> Optional[DataSource]:
    """Retrieves a single data source by its ID."""
    data_sources = get_all_data_sources()
    return next((ds for ds in data_sources if ds.id == ds_id), None)

def create_data_source(data_source: DataSource) -> DataSource:
    """Creates a new data source."""
    data_sources = get_all_data_sources()
    if any(ds.id == data_source.id for ds in data_sources):
        raise ValueError(f"Data Source with ID {data_source.id} already exists.")
    data_sources.append(data_source)
    _write_json_file(DATA_SOURCES_FILE, [ds.dict() for ds in data_sources])
    return data_source

def update_data_source(ds_id: str, updated_data_source: DataSource) -> Optional[DataSource]:
    """Updates an existing data source."""
    data_sources = get_all_data_sources()
    found = False
    for i, ds in enumerate(data_sources):
        if ds.id == ds_id:
            data_sources[i] = updated_data_source
            found = True
            break
    if found:
        _write_json_file(DATA_SOURCES_FILE, [ds.dict() for ds in data_sources])
        return updated_data_source
    return None

def delete_data_source(ds_id: str):
    """Deletes a data source by its ID."""
    data_sources = get_all_data_sources()
    initial_len = len(data_sources)
    data_sources = [ds for ds in data_sources if ds.id != ds_id]
    if len(data_sources) == initial_len:
        raise ValueError(f"Data Source with ID {ds_id} not found.")
    _write_json_file(DATA_SOURCES_FILE, [ds.dict() for ds in data_sources])

# --- Tool Operations ---
def get_all_tools() -> List[Tool]:
    """Retrieves all tools."""
    tools_data = _read_json_file(TOOLS_FILE)
    return [Tool(**t) for t in tools_data]

def get_tool_by_id(tool_id: str) -> Optional[Tool]:
    """Retrieves a single tool by its ID."""
    tools = get_all_tools()
    return next((t for t in tools if t.id == tool_id), None)

def create_tool(tool: Tool) -> Tool:
    """Creates a new tool."""
    tools = get_all_tools()
    if any(t.id == tool.id for t in tools):
        raise ValueError(f"Tool with ID {tool.id} already exists.")
    tools.append(tool)
    _write_json_file(TOOLS_FILE, [t.dict() for t in tools])
    return tool

def update_tool(tool_id: str, updated_tool: Tool) -> Optional[Tool]:
    """Updates an existing tool."""
    tools = get_all_tools()
    found = False
    for i, t in enumerate(tools):
        if t.id == tool_id:
            tools[i] = updated_tool
            found = True
            break
    if found:
        _write_json_file(TOOLS_FILE, [t.dict() for t in tools])
        return updated_tool
    return None

def delete_tool(tool_id: str):
    """Deletes a tool by its ID."""
    tools = get_all_tools()
    initial_len = len(tools)
    tools = [t for t in tools if t.id != tool_id]
    if len(tools) == initial_len:
        raise ValueError(f"Tool with ID {tool_id} not found.")
    _write_json_file(TOOLS_FILE, [t.dict() for t in tools])

def initialize_default_data():
    """Initializes default projects, data sources, and tools if their files are empty."""
    if not PROJECTS_FILE.exists() or not _read_json_file(PROJECTS_FILE):
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
        _write_json_file(PROJECTS_FILE, [default_project.dict()])
        logger.info("Initialized default project.")

    if not DATA_SOURCES_FILE.exists() or not _read_json_file(DATA_SOURCES_FILE):
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
        _write_json_file(DATA_SOURCES_FILE, [ds.dict() for ds in default_data_sources])
        logger.info("Initialized default data sources.")

    if not TOOLS_FILE.exists() or not _read_json_file(TOOLS_FILE):
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
        _write_json_file(TOOLS_FILE, [t.dict() for t in default_tools])
        logger.info("Initialized default tools.")

# Ensure data directories exist
os.makedirs(DATA_DIR, exist_ok=True)
# Initialize default data when the service is loaded
initialize_default_data()
