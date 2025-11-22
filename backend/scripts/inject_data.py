import sys
import os
from pathlib import Path

# Add backend directory to python path
sys.path.append(str(Path(__file__).parent.parent))

from app.infrastructure.persistence.json_repository import JsonProjectRepository
from app.domain.entities import Project

def inject_test_data():
    repo = JsonProjectRepository()
    
    test_project = Project(
        id="test_project_1",
        name="Injected Test Project",
        description="This project was injected via script.",
        createdAt="2023-01-01T00:00:00Z",
        updatedAt="2023-01-01T00:00:00Z",
        status="active",
        tools=[],
        dataSources=[]
    )
    
    repo.create(test_project)
    print(f"Injected project: {test_project.name}")

if __name__ == "__main__":
    inject_test_data()
