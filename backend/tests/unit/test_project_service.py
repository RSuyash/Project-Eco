import unittest
from unittest.mock import MagicMock
from app.application.services.project_service import ProjectService
from app.domain.entities import Project, ProjectCreate

class TestProjectService(unittest.TestCase):
    def setUp(self):
        self.mock_project_repo = MagicMock()
        self.mock_ds_repo = MagicMock()
        self.mock_tool_repo = MagicMock()
        self.service = ProjectService(
            self.mock_project_repo,
            self.mock_ds_repo,
            self.mock_tool_repo
        )

    def test_create_project(self):
        project_create = ProjectCreate(name="Test Project", description="Desc")
        # Mock the return value of create
        self.mock_project_repo.create.side_effect = lambda p: p
        
        created_project = self.service.create_project(project_create)
        
        self.assertEqual(created_project.name, "Test Project")
        self.assertIsNotNone(created_project.id)
        self.mock_project_repo.create.assert_called_once()

    def test_get_project(self):
        project_id = "p1"
        self.mock_project_repo.get_by_id.return_value = Project(
            id=project_id, name="Test", description="Desc", 
            createdAt="", updatedAt="", status="active", tools=[], dataSources=[]
        )
        
        project = self.service.get_project(project_id)
        self.assertEqual(project.id, project_id)
        self.mock_project_repo.get_by_id.assert_called_with(project_id)

if __name__ == '__main__':
    unittest.main()
