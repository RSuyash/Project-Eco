import apiClient from './apiClient';
import { Project, DataSource, Tool } from '../types';

// --- Project Operations ---
export const getAllProjects = async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/v1/projects');
    return response.data;
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    try {
        const response = await apiClient.get<Project>(`/v1/projects/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return undefined;
        }
        throw error;
    }
};

export const addProject = async (project: Project): Promise<Project> => {
    const response = await apiClient.post<Project>('/v1/projects', project);
    return response.data;
};

export const updateProject = async (project: Project): Promise<Project> => {
    const response = await apiClient.put<Project>(`/v1/projects/${project.id}`, project);
    return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/projects/${id}`);
};

// --- Data Source Operations ---
export const getAllDataSources = async (): Promise<DataSource[]> => {
    const response = await apiClient.get<DataSource[]>('/v1/data-sources');
    return response.data;
};

export const getDataSourceById = async (id: string): Promise<DataSource | undefined> => {
    try {
        const response = await apiClient.get<DataSource>(`/v1/data-sources/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return undefined;
        }
        throw error;
    }
};

export const addDataSource = async (dataSource: DataSource): Promise<DataSource> => {
    const response = await apiClient.post<DataSource>('/v1/data-sources', dataSource);
    return response.data;
};

export const updateDataSource = async (dataSource: DataSource): Promise<DataSource> => {
    const response = await apiClient.put<DataSource>(`/v1/data-sources/${dataSource.id}`, dataSource);
    return response.data;
};

export const deleteDataSource = async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/data-sources/${id}`);
};

// --- Tool Operations ---
export const getAllTools = async (): Promise<Tool[]> => {
    const response = await apiClient.get<Tool[]>('/v1/tools');
    return response.data;
};

export const getToolById = async (id: string): Promise<Tool | undefined> => {
    try {
        const response = await apiClient.get<Tool>(`/v1/tools/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return undefined;
        }
        throw error;
    }
};

export const addTool = async (tool: Tool): Promise<Tool> => {
    const response = await apiClient.post<Tool>('/v1/tools', tool);
    return response.data;
};

export const updateTool = async (tool: Tool): Promise<Tool> => {
    const response = await apiClient.put<Tool>(`/v1/tools/${tool.id}`, tool);
    return response.data;
};

export const deleteTool = async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/tools/${id}`);
};
