// src/services/fieldDataService.ts

import Papa from 'papaparse';
import { 
  Plot, 
  Quadrant, 
  Subplot, 
  Species, 
  SpeciesRecord,
  CanopyCoverData
} from '../database/models/Plot';

// Define interfaces for the CSV data structure
interface WoodyVegetationRow {
  Plot_ID: string;
  Location_Name: string;
  Quad_ID: string;
  Species_Scientific: string;
  Growth_Form: string;
  Tree_ID: string;
  Height_m: string;
  Condition: string;
  GBH_Stem1_cm: string;
  GBH_Stem2_cm: string;
  GBH_Stem3_cm: string;
  GBH_Stem4_cm: string;
  GBH_Stem5_cm: string;
  GBH_Stem6_cm: string;
  Remarks: string;
  Total_GBH_cm: string;
}

interface HerbFloorVegetationRow {
  Plot_ID: string;
  Location_Name: string;
  Subplot_ID: string;
  Layer_Type: string;
  Species_or_Category: string;
  'Count_or_Cover%': string;
  Avg_Height_cm: string;
  Notes: string;
}

/**
 * Processes woody vegetation CSV data and converts to internal data structures
 */
export const processWoodyVegetationData = async (csvText: string): Promise<{
  plots: Plot[];
  quadrants: Quadrant[];
  species: Species[];
  records: SpeciesRecord[];
}> => {
  return new Promise((resolve, reject) => {
    try {
      // Parse the CSV data
      const results = Papa.parse<WoodyVegetationRow>(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      if (results.errors.length > 0) {
        console.error('CSV parsing errors:', results.errors);
      }

      const plots: Plot[] = [];
      const quadrants: Quadrant[] = [];
      const species: Species[] = [];
      const records: SpeciesRecord[] = [];

      // Keep track of unique items to avoid duplicates
      const uniquePlots = new Set<string>();
      const uniqueQuadrants = new Set<string>();
      const uniqueSpecies = new Set<string>();

      results.data.forEach((row, index) => {
        // Create plot if not exists
        if (row.Plot_ID && !uniquePlots.has(row.Plot_ID)) {
          uniquePlots.add(row.Plot_ID);
          plots.push({
            id: `plot_${row.Plot_ID}`,
            plotId: row.Plot_ID,
            locationName: row.Location_Name || '',
            description: `Plot ${row.Plot_ID} data`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // Create quadrant if not exists
        const quadrantKey = `${row.Plot_ID}_${row.Quad_ID}`;
        if (row.Plot_ID && row.Quad_ID && !uniqueQuadrants.has(quadrantKey)) {
          uniqueQuadrants.add(quadrantKey);
          quadrants.push({
            id: `quad_${quadrantKey}`,
            plotId: row.Plot_ID,
            quadrantId: row.Quad_ID,
            description: `${row.Quad_ID} quadrant of ${row.Plot_ID}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // Create species if not exists
        if (row.Species_Scientific && !uniqueSpecies.has(row.Species_Scientific)) {
          uniqueSpecies.add(row.Species_Scientific);
          species.push({
            id: `species_${row.Species_Scientific.replace(/\s+/g, '_')}`,
            scientificName: row.Species_Scientific,
            commonName: row.Species_Scientific, // In this case, using scientific name as common name
            growthForm: row.Growth_Form,
          });
        }

        // Create species record
        const height = parseFloat(row.Height_m) || undefined;
        const gbh = parseFloat(row.Total_GBH_cm) || undefined;
        const stems = calculateStemsFromRow(row);

        records.push({
          id: `record_${row.Plot_ID}_${row.Tree_ID}_${Date.now() + index}`,
          speciesId: `species_${row.Species_Scientific.replace(/\s+/g, '_')}`,
          plotId: row.Plot_ID,
          quadrantId: row.Quad_ID,
          treeId: row.Tree_ID,
          height,
          gbh,
          condition: row.Condition,
          stems,
          totalGbh: gbh,
          notes: row.Remarks,
          timestamp: new Date().toISOString(),
        });
      });

      resolve({ plots, quadrants, species, records });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Processes herb/floor vegetation CSV data and converts to internal data structures
 */
export const processHerbFloorVegetationData = async (csvText: string): Promise<{
  plots: Plot[];
  subplots: Subplot[];
  species: Species[];
  records: SpeciesRecord[];
  canopyCoverData: CanopyCoverData[];
}> => {
  return new Promise((resolve, reject) => {
    try {
      // Parse the CSV data
      const results = Papa.parse<HerbFloorVegetationRow>(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      if (results.errors.length > 0) {
        console.error('CSV parsing errors:', results.errors);
      }

      const plots: Plot[] = [];
      const subplots: Subplot[] = [];
      const species: Species[] = [];
      const records: SpeciesRecord[] = [];
      const canopyCoverData: CanopyCoverData[] = [];

      // Keep track of unique items to avoid duplicates
      const uniquePlots = new Set<string>();
      const uniqueSubplots = new Set<string>();
      const uniqueSpecies = new Set<string>();

      results.data.forEach((row, index) => {
        // Create plot if not exists
        if (row.Plot_ID && !uniquePlots.has(row.Plot_ID)) {
          uniquePlots.add(row.Plot_ID);
          plots.push({
            id: `plot_${row.Plot_ID}`,
            plotId: row.Plot_ID,
            locationName: row.Location_Name || '',
            description: `Plot ${row.Plot_ID} data`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // Create subplot if not exists
        const subplotKey = `${row.Plot_ID}_${row.Subplot_ID}`;
        if (row.Plot_ID && row.Subplot_ID && !uniqueSubplots.has(subplotKey)) {
          uniqueSubplots.add(subplotKey);
          subplots.push({
            id: `subplot_${subplotKey}`,
            plotId: row.Plot_ID,
            quadrantId: getQuadrantFromSubplot(row.Subplot_ID), // Map subplot to quadrant
            subplotId: row.Subplot_ID,
            layerType: row.Layer_Type,
            speciesCategory: row.Species_or_Category,
            coverPercentage: parseFloat(row['Count_or_Cover%']) || undefined,
            avgHeight: parseFloat(row.Avg_Height_cm) || undefined,
            notes: row.Notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // Create species if not exists
        if (row.Species_or_Category && !uniqueSpecies.has(row.Species_or_Category)) {
          uniqueSpecies.add(row.Species_or_Category);
          species.push({
            id: `species_${row.Species_or_Category.replace(/\s+/g, '_')}`,
            scientificName: row.Species_or_Category,
            commonName: row.Species_or_Category, // Using category name as common name
            growthForm: 'Herb', // Defaulting to herb for herb/floor data
          });
        }

        // Create species record
        const coverPercentage = parseFloat(row['Count_or_Cover%']) || 0;
        const avgHeight = parseFloat(row.Avg_Height_cm) || undefined;

        records.push({
          id: `record_${row.Plot_ID}_${row.Subplot_ID}_${Date.now() + index}`,
          speciesId: `species_${row.Species_or_Category.replace(/\s+/g, '_')}`,
          plotId: row.Plot_ID,
          quadrantId: getQuadrantFromSubplot(row.Subplot_ID),
          subplotId: row.Subplot_ID,
          coverPercentage,
          avgHeight,
          notes: row.Notes,
          timestamp: new Date().toISOString(),
        });

        // Create canopy cover data
        const coverType = mapLayerTypeToCoverType(row.Layer_Type);
        canopyCoverData.push({
          id: `cover_${row.Plot_ID}_${row.Subplot_ID}_${Date.now() + index}`,
          plotId: row.Plot_ID,
          quadrantId: getQuadrantFromSubplot(row.Subplot_ID),
          subplotId: row.Subplot_ID,
          coverType,
          speciesName: row.Species_or_Category,
          coverPercentage,
          measurementDate: new Date().toISOString(),
          notes: row.Notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      resolve({ plots, subplots, species, records, canopyCoverData });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Imports both woody and herb/floor vegetation data
 */
export const importVegetationData = async (
  woodyCsvText: string, 
  herbFloorCsvText: string
): Promise<{
  plots: Plot[];
  quadrants: Quadrant[];
  subplots: Subplot[];
  species: Species[];
  records: SpeciesRecord[];
  canopyCoverData: CanopyCoverData[];
}> => {
  const woodyResults = await processWoodyVegetationData(woodyCsvText);
  const herbFloorResults = await processHerbFloorVegetationData(herbFloorCsvText);

  // Combine results, removing duplicates
  const allPlots = [...woodyResults.plots, ...herbFloorResults.plots]
    .filter((plot, index, self) => 
      index === self.findIndex(p => p.plotId === plot.plotId)
    );

  const allQuadrants = [...woodyResults.quadrants, ...herbFloorResults.quadrants]
    .filter((quad, index, self) => 
      index === self.findIndex(q => q.id === quad.id)
    );

  const allSubplots = herbFloorResults.subplots;
  
  const allSpecies = [...woodyResults.species, ...herbFloorResults.species]
    .filter((spec, index, self) => 
      index === self.findIndex(s => s.scientificName === spec.scientificName)
    );

  const allRecords = [...woodyResults.records, ...herbFloorResults.records];
  const allCanopyCoverData = herbFloorResults.canopyCoverData;

  return {
    plots: allPlots,
    quadrants: allQuadrants,
    subplots: allSubplots,
    species: allSpecies,
    records: allRecords,
    canopyCoverData: allCanopyCoverData
  };
};

/**
 * Helper function to calculate number of stems from row data
 */
function calculateStemsFromRow(row: WoodyVegetationRow): number | undefined {
  const stems = [
    parseFloat(row.GBH_Stem1_cm),
    parseFloat(row.GBH_Stem2_cm),
    parseFloat(row.GBH_Stem3_cm),
    parseFloat(row.GBH_Stem4_cm),
    parseFloat(row.GBH_Stem5_cm),
    parseFloat(row.GBH_Stem6_cm)
  ].filter(value => !isNaN(value) && value > 0);

  return stems.length > 0 ? stems.length : undefined;
}

/**
 * Helper function to map subplot to quadrant (SP1-2 -> Q1, SP3-4 -> Q2, etc.)
 */
function getQuadrantFromSubplot(subplotId: string): string {
  const subplotNum = parseInt(subplotId.replace('SP', ''));
  if (subplotNum <= 2) {
    return 'Q1';
  } else {
    return 'Q2';
  }
  // Note: The actual mapping might vary based on your specific methodology
  // This is a simple example mapping
}

/**
 * Helper function to map layer type to cover type
 */
function mapLayerTypeToCoverType(layerType: string): CanopyCoverData['coverType'] {
  const normalizedType = layerType.toLowerCase();
  
  if (normalizedType.includes('herb')) return 'herb';
  if (normalizedType.includes('grass')) return 'grass';
  if (normalizedType.includes('shrub')) return 'shrub';
  if (normalizedType.includes('tree')) return 'tree';
  if (normalizedType.includes('litter')) return 'litter';
  if (normalizedType.includes('bare') || normalizedType.includes('soil')) return 'bare_soil';
  
  return 'other';
}