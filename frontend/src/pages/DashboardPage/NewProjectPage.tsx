import { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Breadcrumb from '../../components/Breadcrumb';
import { addProject, updateProject, getProjectById, getAllTools, getAllDataSources } from '../../services/projectService';
import { Project } from '../../types';
import ProjectWizard, { WizardData } from './ProjectWizard';

interface NewProjectPageProps {
  isEditing?: boolean;
}

const NewProjectPage = ({ isEditing = false }: NewProjectPageProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Queries
  const { data: availableTools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: getAllTools
  });

  const { data: availableDataSources = [] } = useQuery({
    queryKey: ['dataSources'],
    queryFn: getAllDataSources
  });

  const { data: existingProject, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => id ? getProjectById(id) : null,
    enabled: isEditing && !!id
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: addProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/dashboard/projects');
    },
    onError: (err) => {
      console.error('Error creating project:', err);
      setError('Failed to create project. Please try again.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      navigate('/dashboard/projects');
    },
    onError: (err) => {
      console.error('Error updating project:', err);
      setError('Failed to update project. Please try again.');
    }
  });

  const handleWizardComplete = (data: WizardData) => {
    const projectData: any = {
      name: data.name,
      description: data.description,
      status: 'active', // Default status
      tools: data.tools,
      dataSources: data.dataSources,
      // Backend handles createdAt, updatedAt, id for new projects
    };

    if (isEditing && id && existingProject) {
      updateMutation.mutate({ ...existingProject, ...projectData });
    } else {
      createMutation.mutate(projectData as Project);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isLoadingProject;

  if (isEditing && isLoadingProject) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Map existing project to wizard data format
  const initialData: Partial<WizardData> | undefined = existingProject ? {
    name: existingProject.name,
    description: existingProject.description,
    type: 'ecological', // Default or infer if possible
    tools: existingProject.tools,
    dataSources: existingProject.dataSources
  } : undefined;

  return (
    <Box>
      <Breadcrumb />
      <ProjectWizard
        initialData={initialData}
        availableTools={availableTools}
        availableDataSources={availableDataSources}
        onComplete={handleWizardComplete}
        onCancel={() => navigate('/dashboard/projects')}
        isSubmitting={isLoading}
      />
    </Box>
  );
};

export default NewProjectPage;