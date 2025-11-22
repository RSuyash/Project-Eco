from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.pydantic_models import Project, ProjectCreate, DataSource, Tool
from app.services import project_management_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Project Endpoints ---
@router.get("/projects", response_model=List[Project])
async def get_all_projects():
    """Retrieve all projects."""
    return project_management_service.get_all_projects()

@router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Retrieve a single project by ID."""
    project = project_management_service.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project

@router.post("/projects", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate):
    """Create a new project."""
    try:
        return project_management_service.create_project(project)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project: Project):
    """Update an existing project."""
    updated_project = project_management_service.update_project(project_id, project)
    if not updated_project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return updated_project

@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str):
    """Delete a project by ID."""
    try:
        project_management_service.delete_project(project_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

# --- Data Source Endpoints ---
@router.get("/data-sources", response_model=List[DataSource])
async def get_all_data_sources():
    """Retrieve all data sources."""
    return project_management_service.get_all_data_sources()

@router.get("/data-sources/{ds_id}", response_model=DataSource)
async def get_data_source(ds_id: str):
    """Retrieve a single data source by ID."""
    data_source = project_management_service.get_data_source_by_id(ds_id)
    if not data_source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data Source not found")
    return data_source

@router.post("/data-sources", response_model=DataSource, status_code=status.HTTP_201_CREATED)
async def create_data_source(data_source: DataSource):
    """Create a new data source."""
    try:
        return project_management_service.create_data_source(data_source)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.put("/data-sources/{ds_id}", response_model=DataSource)
async def update_data_source(ds_id: str, data_source: DataSource):
    """Update an existing data source."""
    updated_data_source = project_management_service.update_data_source(ds_id, data_source)
    if not updated_data_source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data Source not found")
    return updated_data_source

@router.delete("/data-sources/{ds_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_data_source(ds_id: str):
    """Delete a data source by ID."""
    try:
        project_management_service.delete_data_source(ds_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

# --- Tool Endpoints ---
@router.get("/tools", response_model=List[Tool])
async def get_all_tools():
    """Retrieve all tools."""
    return project_management_service.get_all_tools()

@router.get("/tools/{tool_id}", response_model=Tool)
async def get_tool(tool_id: str):
    """Retrieve a single tool by ID."""
    tool = project_management_service.get_tool_by_id(tool_id)
    if not tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
    return tool

@router.post("/tools", response_model=Tool, status_code=status.HTTP_201_CREATED)
async def create_tool(tool: Tool):
    """Create a new tool."""
    try:
        return project_management_service.create_tool(tool)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.put("/tools/{tool_id}", response_model=Tool)
async def update_tool(tool_id: str, tool: Tool):
    """Update an existing tool."""
    updated_tool = project_management_service.update_tool(tool_id, tool)
    if not updated_tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
    return updated_tool

@router.delete("/tools/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tool(tool_id: str):
    """Delete a tool by ID."""
    try:
        project_management_service.delete_tool(tool_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
