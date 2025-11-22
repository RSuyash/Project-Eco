from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.domain.entities import Project, ProjectCreate, DataSource, Tool
from app.application.services.project_service import ProjectService
from app.api.dependencies import get_project_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Project Endpoints ---
@router.get("/projects", response_model=List[Project])
async def get_all_projects(service: ProjectService = Depends(get_project_service)):
    """Retrieve all projects."""
    return service.get_all_projects()

@router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, service: ProjectService = Depends(get_project_service)):
    """Retrieve a single project by ID."""
    project = service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project

@router.post("/projects", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate, service: ProjectService = Depends(get_project_service)):
    """Create a new project."""
    try:
        return service.create_project(project)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project: Project, service: ProjectService = Depends(get_project_service)):
    """Update an existing project."""
    updated_project = service.update_project(project_id, project)
    if not updated_project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return updated_project

@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str, service: ProjectService = Depends(get_project_service)):
    """Delete a project by ID."""
    if not service.delete_project(project_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

# --- Data Source Endpoints ---
@router.get("/data-sources", response_model=List[DataSource])
async def get_all_data_sources(service: ProjectService = Depends(get_project_service)):
    """Retrieve all data sources."""
    return service.get_all_data_sources()

@router.get("/data-sources/{ds_id}", response_model=DataSource)
async def get_data_source(ds_id: str, service: ProjectService = Depends(get_project_service)):
    """Retrieve a single data source by ID."""
    data_source = service.get_data_source(ds_id)
    if not data_source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data Source not found")
    return data_source

@router.post("/data-sources", response_model=DataSource, status_code=status.HTTP_201_CREATED)
async def create_data_source(data_source: DataSource, service: ProjectService = Depends(get_project_service)):
    """Create a new data source."""
    try:
        return service.create_data_source(data_source)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.put("/data-sources/{ds_id}", response_model=DataSource)
async def update_data_source(ds_id: str, data_source: DataSource, service: ProjectService = Depends(get_project_service)):
    """Update an existing data source."""
    updated_data_source = service.update_data_source(ds_id, data_source)
    if not updated_data_source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data Source not found")
    return updated_data_source

@router.delete("/data-sources/{ds_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_data_source(ds_id: str, service: ProjectService = Depends(get_project_service)):
    """Delete a data source by ID."""
    if not service.delete_data_source(ds_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data Source not found")

# --- Tool Endpoints ---
@router.get("/tools", response_model=List[Tool])
async def get_all_tools(service: ProjectService = Depends(get_project_service)):
    """Retrieve all tools."""
    return service.get_all_tools()

@router.get("/tools/{tool_id}", response_model=Tool)
async def get_tool(tool_id: str, service: ProjectService = Depends(get_project_service)):
    """Retrieve a single tool by ID."""
    tool = service.get_tool(tool_id)
    if not tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
    return tool

@router.post("/tools", response_model=Tool, status_code=status.HTTP_201_CREATED)
async def create_tool(tool: Tool, service: ProjectService = Depends(get_project_service)):
    """Create a new tool."""
    try:
        return service.create_tool(tool)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.put("/tools/{tool_id}", response_model=Tool)
async def update_tool(tool_id: str, tool: Tool, service: ProjectService = Depends(get_project_service)):
    """Update an existing tool."""
    updated_tool = service.update_tool(tool_id, tool)
    if not updated_tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
    return updated_tool

@router.delete("/tools/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tool(tool_id: str, service: ProjectService = Depends(get_project_service)):
    """Delete a tool by ID."""
    if not service.delete_tool(tool_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
