from abc import ABC, abstractmethod
from typing import List, Optional, Any
from app.domain.entities import Project, DataSource, Tool

class ProjectRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[Project]:
        pass

    @abstractmethod
    def get_by_id(self, project_id: str) -> Optional[Project]:
        pass

    @abstractmethod
    def create(self, project: Project) -> Project:
        pass

    @abstractmethod
    def update(self, project_id: str, project: Project) -> Optional[Project]:
        pass

    @abstractmethod
    def delete(self, project_id: str) -> bool:
        pass

class DataSourceRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[DataSource]:
        pass

    @abstractmethod
    def get_by_id(self, ds_id: str) -> Optional[DataSource]:
        pass

    @abstractmethod
    def create(self, data_source: DataSource) -> DataSource:
        pass

    @abstractmethod
    def update(self, ds_id: str, data_source: DataSource) -> Optional[DataSource]:
        pass

    @abstractmethod
    def delete(self, ds_id: str) -> bool:
        pass

class ToolRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[Tool]:
        pass

    @abstractmethod
    def get_by_id(self, tool_id: str) -> Optional[Tool]:
        pass

    @abstractmethod
    def create(self, tool: Tool) -> Tool:
        pass

    @abstractmethod
    def update(self, tool_id: str, tool: Tool) -> Optional[Tool]:
        pass

    @abstractmethod
    def delete(self, tool_id: str) -> bool:
        pass

class VegetationRepository(ABC):
    @abstractmethod
    def get_cleaned_data(self) -> Any: # Returns DataFrame-like object
        pass

    @abstractmethod
    def get_ecological_results(self) -> Any:
        pass

    @abstractmethod
    def get_canopy_results(self) -> Any:
        pass

