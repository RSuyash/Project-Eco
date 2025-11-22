import axios from 'axios';

const API_URL = 'http://localhost:8000/api/analysis';

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
    const response = await axios.get(`${API_URL}/species-richness/${plotId}`);
    return response.data;
};

export const getDiversityIndices = async (plotId: string): Promise<DiversityData> => {
    const response = await axios.get(`${API_URL}/diversity/${plotId}`);
    return response.data;
};

export const getDominanceMetrics = async (plotId: string): Promise<DominanceData[]> => {
    const response = await axios.get(`${API_URL}/dominance/${plotId}`);
    return response.data;
};

export const getStructuralMetrics = async (plotId: string): Promise<StructuralData> => {
    const response = await axios.get(`${API_URL}/structure/${plotId}`);
    return response.data;
};
