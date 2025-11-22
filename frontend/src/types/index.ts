export interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'completed' | 'archived';
    tools: string[];
    dataSources: string[];
    progress?: number;
    totalDataPoints?: number;
    lastSynced?: string;
}

export interface DataSource {
    id: string;
    name: string;
    type: string;
}

export interface Tool {
    id: string;
    name: string;
    category: string;
}
