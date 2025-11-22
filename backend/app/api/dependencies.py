from app.infrastructure.persistence.json_repository import (
    JsonProjectRepository,
    JsonDataSourceRepository,
    JsonToolRepository
)
from app.application.services.project_service import ProjectService

def get_project_service() -> ProjectService:
    project_repo = JsonProjectRepository()
    data_source_repo = JsonDataSourceRepository()
    tool_repo = JsonToolRepository()
    return ProjectService(project_repo, data_source_repo, tool_repo)

from app.infrastructure.persistence.csv_repository import CsvVegetationRepository
from app.application.services.analysis_service import AnalysisService

def get_analysis_service() -> AnalysisService:
    repo = CsvVegetationRepository()
    return AnalysisService(repo)

