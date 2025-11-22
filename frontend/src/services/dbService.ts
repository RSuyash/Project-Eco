import { Project, DataSource, Tool } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper function for API calls
async function apiCall<T>(method: string, path: string, data?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || response.statusText);
  }

  if (response.status === 204) { // No Content for successful deletes
    return undefined as T;
  }

  return response.json();
}

// --- Project Operations ---
export const getAllProjects = async (): Promise<Project[]> => {
  return apiCall<Project[]>('GET', '/projects');
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
  try {
    return await apiCall<Project>('GET', `/projects/${id}`);
  } catch (error: any) {
    if (error.message === 'Project not found') { // Specific error from backend for 404
      return undefined;
    }
    throw error;
  }
};

export const addProject = async (project: Project): Promise<Project> => {
  return apiCall<Project>('POST', '/projects', project);
};

export const updateProject = async (project: Project): Promise<Project> => {
  return apiCall<Project>('PUT', `/projects/${project.id}`, project);
};

export const deleteProject = async (id: string): Promise<void> => {
  return apiCall<void>('DELETE', `/projects/${id}`);
};

// --- Data Source Operations ---
export const getAllDataSources = async (): Promise<DataSource[]> => {
  return apiCall<DataSource[]>('GET', '/data-sources');
};

export const getDataSourceById = async (id: string): Promise<DataSource | undefined> => {
  try {
    return await apiCall<DataSource>('GET', `/data-sources/${id}`);
  } catch (error: any) {
    if (error.message === 'Data Source not found') {
      return undefined;
    }
    throw error;
  }
};

export const addDataSource = async (dataSource: DataSource): Promise<DataSource> => {
  return apiCall<DataSource>('POST', '/data-sources', dataSource);
};

export const updateDataSource = async (dataSource: DataSource): Promise<DataSource> => {
  return apiCall<DataSource>('PUT', `/data-sources/${dataSource.id}`, dataSource);
};

export const deleteDataSource = async (id: string): Promise<void> => {
  return apiCall<void>('DELETE', `/data-sources/${id}`);
};

// --- Tool Operations ---
export const getAllTools = async (): Promise<Tool[]> => {
  return apiCall<Tool[]>('GET', '/tools');
};

export const getToolById = async (id: string): Promise<Tool | undefined> => {
  try {
    return await apiCall<Tool>('GET', `/tools/${id}`);
  } catch (error: any) {
    if (error.message === 'Tool not found') {
      return undefined;
    }
    throw error;
  }
};

export const addTool = async (tool: Tool): Promise<Tool> => {
  return apiCall<Tool>('POST', '/tools', tool);
};

export const updateTool = async (tool: Tool): Promise<Tool> => {
  return apiCall<Tool>('PUT', `/tools/${tool.id}`, tool);
};

export const deleteTool = async (id: string): Promise<void> => {
  return apiCall<void>('DELETE', `/tools/${id}`);
};

// No need for initDB or initializeDefaultData on the frontend anymore,
// as the backend handles persistence and default data initialization.
// The frontend will simply call the API endpoints to get/set data.