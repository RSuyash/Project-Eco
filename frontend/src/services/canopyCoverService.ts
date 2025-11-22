// src/services/canopyCoverService.ts

import { CanopyCoverData, CanopyCoverAnalysisResult } from '../database/models/Plot';

/**
 * Calculates diversity index (Shannon-Wiener) for canopy cover data
 */
export const calculateDiversityIndex = (coverData: CanopyCoverData[]): number => {
  if (!coverData || coverData.length === 0) return 0;

  // Calculate total cover percentage for normalization
  const totalCover = coverData.reduce((sum, item) => sum + item.coverPercentage, 0);
  if (totalCover === 0) return 0;

  // Calculate proportional cover for each type
  const proportionalCovers = coverData.map(item => item.coverPercentage / totalCover);

  // Calculate Shannon-Wiener index: H' = -Σ(pi * ln(pi))
  let diversityIndex = 0;
  for (const p of proportionalCovers) {
    if (p > 0) {
      diversityIndex -= p * Math.log(p);
    }
  }

  return diversityIndex;
};

/**
 * Calculates evenness from the diversity index
 */
export const calculateEvenness = (diversityIndex: number, speciesCount: number): number => {
  if (speciesCount <= 1) return speciesCount === 1 ? 1 : 0;
  
  const maxDiversity = Math.log(speciesCount);
  return maxDiversity > 0 ? diversityIndex / maxDiversity : 0;
};

/**
 * Aggregates canopy cover data by type for a specific area (plot, quadrant, or subplot)
 */
export const aggregateCanopyCoverByType = (
  coverData: CanopyCoverData[],
  plotId: string,
  quadrantId?: string,
  subplotId?: string
): CanopyCoverAnalysisResult => {
  // Filter data based on the specified area
  const filteredData = coverData.filter(item => {
    if (subplotId) {
      return item.plotId === plotId && 
             item.quadrantId === quadrantId && 
             item.subplotId === subplotId;
    } else if (quadrantId) {
      return item.plotId === plotId && 
             item.quadrantId === quadrantId;
    } else {
      return item.plotId === plotId;
    }
  });

  // Initialize cover calculations
  const coverSums = {
    herb: 0,
    grass: 0,
    shrub: 0,
    tree: 0,
    litter: 0,
    bare_soil: 0,
    other: 0
  };

  // Sum up cover percentages by type
  filteredData.forEach(item => {
    coverSums[item.coverType] += item.coverPercentage;
  });

  // Calculate total cover
  const totalCover = 
    coverSums.herb + 
    coverSums.grass + 
    coverSums.shrub + 
    coverSums.tree + 
    coverSums.litter + 
    coverSums.bare_soil + 
    coverSums.other;

  // Calculate diversity index for this area
  const diversityIndex = calculateDiversityIndex(filteredData);
  const evenness = calculateEvenness(diversityIndex, filteredData.length);

  return {
    id: `${plotId}_${quadrantId || 'all'}_${subplotId || 'all'}_${Date.now()}`,
    plotId,
    quadrantId,
    subplotId,
    totalCoverPercentage: totalCover,
    herbCover: coverSums.herb,
    grassCover: coverSums.grass,
    shrubCover: coverSums.shrub,
    treeCover: coverSums.tree,
    litterCover: coverSums.litter,
    bareSoilCover: coverSums.bare_soil,
    otherCover: coverSums.other,
    diversityIndex,
    evenness,
    analysisDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Analyzes canopy cover across multiple plots and generates comparative data
 */
export const analyzeCanopyCoverAcrossPlots = (
  coverData: CanopyCoverData[],
  plotIds: string[]
): CanopyCoverAnalysisResult[] => {
  return plotIds.map(plotId => 
    aggregateCanopyCoverByType(coverData, plotId)
  );
};

/**
 * Calculates dominant cover type in an area
 */
export const getDominantCoverType = (analysisResult: CanopyCoverAnalysisResult): { type: string, percentage: number } => {
  const coverTypes = [
    { type: 'Herb', value: analysisResult.herbCover },
    { type: 'Grass', value: analysisResult.grassCover },
    { type: 'Shrub', value: analysisResult.shrubCover },
    { type: 'Tree', value: analysisResult.treeCover },
    { type: 'Litter', value: analysisResult.litterCover },
    { type: 'Bare Soil', value: analysisResult.bareSoilCover },
    { type: 'Other', value: analysisResult.otherCover }
  ];

  const dominant = coverTypes.reduce((max, current) => 
    current.value > max.value ? current : max
  );

  const percentage = analysisResult.totalCoverPercentage > 0 
    ? (dominant.value / analysisResult.totalCoverPercentage) * 100 
    : 0;

  return {
    type: dominant.type,
    percentage: parseFloat(percentage.toFixed(2))
  };
};

/**
 * Generates summary statistics for canopy cover across all plots
 */
export const generateCanopyCoverSummary = (
  analysisResults: CanopyCoverAnalysisResult[]
): {
  totalPlots: number;
  avgTotalCover: number;
  avgHerbCover: number;
  avgGrassCover: number;
  avgShrubCover: number;
  avgTreeCover: number;
  avgLitterCover: number;
  avgBareSoilCover: number;
  avgOtherCover: number;
  avgDiversityIndex: number;
  avgEvenness: number;
  dominantCoverType: string;
} => {
  if (analysisResults.length === 0) {
    return {
      totalPlots: 0,
      avgTotalCover: 0,
      avgHerbCover: 0,
      avgGrassCover: 0,
      avgShrubCover: 0,
      avgTreeCover: 0,
      avgLitterCover: 0,
      avgBareSoilCover: 0,
      avgOtherCover: 0,
      avgDiversityIndex: 0,
      avgEvenness: 0,
      dominantCoverType: 'N/A'
    };
  }

  const totalPlots = analysisResults.length;

  const avgTotalCover = analysisResults.reduce((sum, result) => sum + result.totalCoverPercentage, 0) / totalPlots;
  const avgHerbCover = analysisResults.reduce((sum, result) => sum + result.herbCover, 0) / totalPlots;
  const avgGrassCover = analysisResults.reduce((sum, result) => sum + result.grassCover, 0) / totalPlots;
  const avgShrubCover = analysisResults.reduce((sum, result) => sum + result.shrubCover, 0) / totalPlots;
  const avgTreeCover = analysisResults.reduce((sum, result) => sum + result.treeCover, 0) / totalPlots;
  const avgLitterCover = analysisResults.reduce((sum, result) => sum + result.litterCover, 0) / totalPlots;
  const avgBareSoilCover = analysisResults.reduce((sum, result) => sum + result.bareSoilCover, 0) / totalPlots;
  const avgOtherCover = analysisResults.reduce((sum, result) => sum + result.otherCover, 0) / totalPlots;
  
  const avgDiversityIndex = analysisResults.reduce((sum, result) => 
    sum + (result.diversityIndex || 0), 0) / totalPlots;
  const avgEvenness = analysisResults.reduce((sum, result) => 
    sum + (result.evenness || 0), 0) / totalPlots;

  // Calculate overall dominant cover type
  const coverSums = {
    herb: analysisResults.reduce((sum, result) => sum + result.herbCover, 0),
    grass: analysisResults.reduce((sum, result) => sum + result.grassCover, 0),
    shrub: analysisResults.reduce((sum, result) => sum + result.shrubCover, 0),
    tree: analysisResults.reduce((sum, result) => sum + result.treeCover, 0),
    litter: analysisResults.reduce((sum, result) => sum + result.litterCover, 0),
    bareSoil: analysisResults.reduce((sum, result) => sum + result.bareSoilCover, 0),
    other: analysisResults.reduce((sum, result) => sum + result.otherCover, 0)
  };

  const dominantCoverType = Object.entries(coverSums).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0];

  return {
    totalPlots,
    avgTotalCover: parseFloat(avgTotalCover.toFixed(2)),
    avgHerbCover: parseFloat(avgHerbCover.toFixed(2)),
    avgGrassCover: parseFloat(avgGrassCover.toFixed(2)),
    avgShrubCover: parseFloat(avgShrubCover.toFixed(2)),
    avgTreeCover: parseFloat(avgTreeCover.toFixed(2)),
    avgLitterCover: parseFloat(avgLitterCover.toFixed(2)),
    avgBareSoilCover: parseFloat(avgBareSoilCover.toFixed(2)),
    avgOtherCover: parseFloat(avgOtherCover.toFixed(2)),
    avgDiversityIndex: parseFloat(avgDiversityIndex.toFixed(2)),
    avgEvenness: parseFloat(avgEvenness.toFixed(2)),
    dominantCoverType
  };
};

/**
 * Creates formatted data for visualization (e.g., pie charts showing cover composition)
 */
export const formatCoverDataForVisualization = (
  analysisResult: CanopyCoverAnalysisResult
): Array<{ name: string; value: number; color?: string }> => {
  const coverTypes = [
    { name: 'Herb', value: analysisResult.herbCover, color: '#8BC34A' },
    { name: 'Grass', value: analysisResult.grassCover, color: '#4CAF50' },
    { name: 'Shrub', value: analysisResult.shrubCover, color: '#795548' },
    { name: 'Tree', value: analysisResult.treeCover, color: '#388E3C' },
    { name: 'Litter', value: analysisResult.litterCover, color: '#5D4037' },
    { name: 'Bare Soil', value: analysisResult.bareSoilCover, color: '#FFC107' },
    { name: 'Other', value: analysisResult.otherCover, color: '#9E9E9E' }
  ];

  // Filter out types with 0 coverage
  return coverTypes.filter(item => item.value > 0);
};

/**
 * Creates comparative coverage data for multiple plots (e.g., for bar charts)
 */
export const createComparativeCoverData = (
  analysisResults: CanopyCoverAnalysisResult[]
): Array<Record<string, any>> => {
  return analysisResults.map(result => ({
    name: result.plotId,
    herb: result.herbCover,
    grass: result.grassCover,
    shrub: result.shrubCover,
    tree: result.treeCover,
    litter: result.litterCover,
    bareSoil: result.bareSoilCover,
    other: result.otherCover
  }));
};

/**
 * Generates subplot-level analysis data
 */
export const analyzeSubplotCover = (
  coverData: CanopyCoverData[],
  plotId: string,
  quadrantId: string
): CanopyCoverAnalysisResult[] => {
  // Get all unique subplots for this plot and quadrant
  const uniqueSubplots = Array.from(
    new Set(
      coverData
        .filter(item => item.plotId === plotId && item.quadrantId === quadrantId)
        .map(item => item.subplotId)
    )
  );

  return uniqueSubplots.map(subplotId => 
    aggregateCanopyCoverByType(coverData, plotId, quadrantId, subplotId)
  );
};