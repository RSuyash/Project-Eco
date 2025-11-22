export type PlotType = 'standard' | 'species_area_curve' | 'custom';
export type SubplotType = 'quadrant' | 'subplot_herb' | 'subplot_shrub' | 'custom';
export type GridLabeling = 'alphanumeric' | 'sequential';
export type RelativePosition = 'plot_origin' | 'grid_cell';

export interface PlotDimensions {
    width: number;
    height: number;
    unit: 'm';
}

export interface GridConfiguration {
    rows: number;
    cols: number;
    labeling: GridLabeling;
}

export interface SubplotDefinition {
    id: string;
    type: SubplotType;
    dimensions: PlotDimensions;
    position_x: number;
    position_y: number;
    relative_to: RelativePosition;
    required_data: string[];
}

export interface PlotConfiguration {
    type: PlotType;
    dimensions: PlotDimensions;
    grid: GridConfiguration;
    subdivisions: SubplotDefinition[];
}

export interface Plot {
    id: string;
    projectId: string;
    name: string;
    configuration: PlotConfiguration;
    location?: { lat: number; lng: number };
    data?: any;
}
