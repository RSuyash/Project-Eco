import apiClient from './apiClient';

export interface SpeciesRichnessData {
    plot_id: string;
    total_richness: number;
    species_list: string[];
}

export interface DiversityData {
    plot_id: string;
    shannon_index: number;
    simpson_index: number;
    pielou_evenness: number;
}

export interface DominanceData {
    Species: string;
    count: number;
    relative_abundance: number;
}

export interface StructuralData {
    plot_id: string;
    height_distribution: { range: string; count: number }[];
    dbh_distribution: { range: string; count: number }[];
}

export const getSpeciesRichness = async (plotId: string): Promise<SpeciesRichnessData> => {
    const response = await apiClient.get<SpeciesRichnessData>(`/v1/analysis/species-richness/${plotId}`);
    return response.data;
};

export const getDiversityIndices = async (plotId: string): Promise<DiversityData> => {
    const response = await apiClient.get<DiversityData>(`/v1/analysis/diversity/${plotId}`);
    return response.data;
};

export const getDominanceMetrics = async (plotId: string): Promise<DominanceData[]> => {
    const response = await apiClient.get<DominanceData[]>(`/v1/analysis/dominance/${plotId}`);
    return response.data;
};

export const getStructuralMetrics = async (plotId: string): Promise<StructuralData> => {
    const response = await apiClient.get<StructuralData>(`/v1/analysis/structure/${plotId}`);
    return response.data;
};
