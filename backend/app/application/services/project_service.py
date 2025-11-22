from typing import List, Optional
from datetime import datetime
from app.domain.entities import Project, ProjectCreate, DataSource, Tool
from app.domain.repositories import ProjectRepository, DataSourceRepository, ToolRepository

class ProjectService:
    def __init__(
        self,
        project_repo: ProjectRepository,
        data_source_repo: DataSourceRepository,
        tool_repo: ToolRepository
    ):
        self.project_repo = project_repo
        self.data_source_repo = data_source_repo
        self.tool_repo = tool_repo

    # --- Project Operations ---
    def get_all_projects(self) -> List[Project]:
        return self.project_repo.get_all()

    def get_project(self, project_id: str) -> Optional[Project]:
        return self.project_repo.get_by_id(project_id)

    def create_project(self, project_create: ProjectCreate) -> Project:
        # Business logic for ID generation and default values
        new_project = Project(
            id=f"project_{int(datetime.now().timestamp() * 1000)}",
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
        return self.project_repo.create(new_project)

    def update_project(self, project_id: str, project: Project) -> Optional[Project]:
        # Ensure we are updating the correct project
        if project.id != project_id:
            return None # Or raise error
        return self.project_repo.update(project_id, project)

    def delete_project(self, project_id: str) -> bool:
        return self.project_repo.delete(project_id)

    # --- Data Source Operations ---
    def get_all_data_sources(self) -> List[DataSource]:
        return self.data_source_repo.get_all()

    def get_data_source(self, ds_id: str) -> Optional[DataSource]:
        return self.data_source_repo.get_by_id(ds_id)

    def create_data_source(self, data_source: DataSource) -> DataSource:
        # Check for duplicates if needed
        existing = self.data_source_repo.get_by_id(data_source.id)
        if existing:
            raise ValueError(f"Data Source with ID {data_source.id} already exists.")
        return self.data_source_repo.create(data_source)

    def update_data_source(self, ds_id: str, data_source: DataSource) -> Optional[DataSource]:
        return self.data_source_repo.update(ds_id, data_source)

    def delete_data_source(self, ds_id: str) -> bool:
        return self.data_source_repo.delete(ds_id)

    # --- Tool Operations ---
    def get_all_tools(self) -> List[Tool]:
        return self.tool_repo.get_all()

    def get_tool(self, tool_id: str) -> Optional[Tool]:
        return self.tool_repo.get_by_id(tool_id)

    def create_tool(self, tool: Tool) -> Tool:
        existing = self.tool_repo.get_by_id(tool.id)
        if existing:
            raise ValueError(f"Tool with ID {tool.id} already exists.")
        return self.tool_repo.create(tool)

    def update_tool(self, tool_id: str, tool: Tool) -> Optional[Tool]:
        return self.tool_repo.update(tool_id, tool)

    def delete_tool(self, tool_id: str) -> bool:
        return self.tool_repo.delete(tool_id)
