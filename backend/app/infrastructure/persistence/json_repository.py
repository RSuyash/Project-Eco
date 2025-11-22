import json
import os
from typing import List, Dict, Any, Optional
from pathlib import Path
from datetime import datetime
import logging

from app.domain.entities import Project, DataSource, Tool
from app.domain.repositories import ProjectRepository, DataSourceRepository, ToolRepository
from app.core.config import DATA_DIR

logger = logging.getLogger(__name__)

class JsonRepositoryMixin:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        if not self.file_path.exists():
            os.makedirs(self.file_path.parent, exist_ok=True)
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump([], f)

    def _read_json(self) -> List[Dict[str, Any]]:
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []

    def _write_json(self, data: List[Dict[str, Any]]):
        with open(self.file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)

class JsonProjectRepository(ProjectRepository, JsonRepositoryMixin):
    def __init__(self):
        super().__init__(DATA_DIR / "projects.json")

    def get_all(self) -> List[Project]:
        data = self._read_json()
        return [Project(**item) for item in data]

    def get_by_id(self, project_id: str) -> Optional[Project]:
        projects = self.get_all()
        return next((p for p in projects if p.id == project_id), None)

    def create(self, project: Project) -> Project:
        projects = self.get_all()
        projects.append(project)
        self._write_json([p.dict() for p in projects])
        return project

    def update(self, project_id: str, project: Project) -> Optional[Project]:
        projects = self.get_all()
        for i, p in enumerate(projects):
            if p.id == project_id:
                projects[i] = project
                self._write_json([p.dict() for p in projects])
                return project
        return None

    def delete(self, project_id: str) -> bool:
        projects = self.get_all()
        initial_len = len(projects)
        projects = [p for p in projects if p.id != project_id]
        if len(projects) < initial_len:
            self._write_json([p.dict() for p in projects])
            return True
        return False

class JsonDataSourceRepository(DataSourceRepository, JsonRepositoryMixin):
    def __init__(self):
        super().__init__(DATA_DIR / "data_sources.json")

    def get_all(self) -> List[DataSource]:
        data = self._read_json()
        return [DataSource(**item) for item in data]

    def get_by_id(self, ds_id: str) -> Optional[DataSource]:
        items = self.get_all()
        return next((item for item in items if item.id == ds_id), None)

    def create(self, data_source: DataSource) -> DataSource:
        items = self.get_all()
        items.append(data_source)
        self._write_json([item.dict() for item in items])
        return data_source

    def update(self, ds_id: str, data_source: DataSource) -> Optional[DataSource]:
        items = self.get_all()
        for i, item in enumerate(items):
            if item.id == ds_id:
                items[i] = data_source
                self._write_json([item.dict() for item in items])
                return data_source
        return None

    def delete(self, ds_id: str) -> bool:
        items = self.get_all()
        initial_len = len(items)
        items = [item for item in items if item.id != ds_id]
        if len(items) < initial_len:
            self._write_json([item.dict() for item in items])
            return True
        return False

class JsonToolRepository(ToolRepository, JsonRepositoryMixin):
    def __init__(self):
        super().__init__(DATA_DIR / "tools.json")

    def get_all(self) -> List[Tool]:
        data = self._read_json()
        return [Tool(**item) for item in data]

    def get_by_id(self, tool_id: str) -> Optional[Tool]:
        items = self.get_all()
        return next((item for item in items if item.id == tool_id), None)

    def create(self, tool: Tool) -> Tool:
        items = self.get_all()
        items.append(tool)
        self._write_json([item.dict() for item in items])
        return tool

    def update(self, tool_id: str, tool: Tool) -> Optional[Tool]:
        items = self.get_all()
        for i, item in enumerate(items):
            if item.id == tool_id:
                items[i] = tool
                self._write_json([item.dict() for item in items])
                return tool
        return None

    def delete(self, tool_id: str) -> bool:
        items = self.get_all()
        initial_len = len(items)
        items = [item for item in items if item.id != tool_id]
        if len(items) < initial_len:
            self._write_json([item.dict() for item in items])
            return True
        return False
