import Dexie, { Table } from 'dexie';

// --- Interfaces ---

export interface ProjectDB {
    id?: number; // Auto-increment
    uuid: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PlotDB {
    id?: number;
    uuid: string;
    projectId: string; // Links to ProjectDB.uuid
    name: string;
    dimensions: { width: number; height: number; unit: string };

    // Ecological Metadata
    surveyorName?: string;
    surveyDate?: Date;
    slope?: number; // Degrees
    aspect?: string; // N, NE, E, etc.
    weather?: string; // Sunny, Cloudy, Rainy
    disturbance?: string[]; // ['Grazing', 'Fire', 'Cutting']
    canopyClosure?: number; // Percentage

    createdAt: Date;
    updatedAt: Date;
}

export interface TreeDB {
    id?: number;
    uuid: string;
    plotId: string; // Links to PlotDB.uuid
    quadrant: string; // Q1, Q2, Q3, Q4
    tagId: string; // Physical tag

    // Taxonomy
    species: string;
    commonName?: string;
    family?: string;

    // Biometrics
    gbh: number; // cm
    height: number; // m
    // canopySpread removed as per user request

    // Health & Status
    condition: 'Healthy' | 'Degraded' | 'Dead' | 'Sapling' | 'Coppice' | 'Stump';
    phenology: 'Dormant' | 'Leafing' | 'Flowering' | 'Fruiting' | 'Senescence';
    isEpiphyteLaden?: boolean;

    // Location
    x: number; // relative to plot origin
    y: number;

    remarks?: string;
    updatedAt: Date;
}

export interface SubplotDB {
    id?: number;
    uuid: string;
    plotId: string;
    type: '1x1' | '5x5'; // Standard sizes
    corner: 'SP1' | 'SP2' | 'SP3' | 'SP4'; // Location

    // Data
    herbCount?: number;
    shrubCount?: number;
    dominantSpecies?: string[];
    groundCover?: number; // %

    updatedAt: Date;
}

export interface PhotoDB {
    id?: number;
    uuid: string;
    parentId: string; // Plot UUID or Tree UUID
    parentType: 'plot' | 'tree';
    category: 'general' | 'canopy_hemispherical' | 'species_detail' | 'site_context';
    blob: Blob; // The image data
    timestamp: Date;

    // Location (if applicable)
    x?: number;
    y?: number;
    caption?: string;
}

// --- Database Class ---

class FieldDatabase extends Dexie {
    projects!: Table<ProjectDB>;
    plots!: Table<PlotDB>;
    trees!: Table<TreeDB>;
    subplots!: Table<SubplotDB>;
    photos!: Table<PhotoDB>;

    constructor() {
        super('TerraFieldDB');

        // Define Schema
        this.version(1).stores({
            projects: '++id, uuid, name, updatedAt',
            plots: '++id, uuid, projectId, name, updatedAt',
            trees: '++id, uuid, plotId, quadrant, species, tagId',
            subplots: '++id, uuid, plotId',
            photos: '++id, uuid, parentId, parentType'
        });
    }
}

export const db = new FieldDatabase();
