import pandas as pd
import numpy as np
import os
import logging
from app.core.config import CLEANED_VEG_TREES_PATH, ECO_RESULTS_PATH, CLEANED_VEG_FULL_PATH

logger = logging.getLogger(__name__)

def get_cleaned_data(plot_id=None, data_type='trees'):
    """
    Helper to load cleaned data.
    data_type: 'trees' or 'full'
    """
    path = CLEANED_VEG_TREES_PATH if data_type == 'trees' else CLEANED_VEG_FULL_PATH
    
    if not os.path.exists(path):
        logger.error(f"Data file not found at {path}")
        return pd.DataFrame()
        
    df = pd.read_csv(path)
    
    if plot_id:
        # Ensure plot_id is string for comparison
        df['Plot'] = df['Plot'].astype(str)
        df = df[df['Plot'] == str(plot_id)]
        
    return df

def calculate_species_richness(plot_id):
    """
    Calculates species richness (number of unique species).
    """
    df = get_cleaned_data(plot_id, data_type='full')
    if df.empty:
        return {"total_richness": 0, "species_list": []}
        
    # Filter out 'Unknown' or empty species if necessary
    species_list = df['Species'].dropna().unique().tolist()
    richness = len(species_list)
    
    return {
        "plot_id": plot_id,
        "total_richness": richness,
        "species_list": sorted(species_list)
    }

def calculate_diversity_indices(plot_id):
    """
    Calculates Shannon and Simpson diversity indices.
    """
    df = get_cleaned_data(plot_id, data_type='full')
    if df.empty:
        return {"shannon": 0, "simpson": 0, "evenness": 0}
        
    # Count individuals per species
    # Assuming 'Number' column exists for counts, otherwise count rows
    if 'Number' in df.columns:
        counts = df.groupby('Species')['Number'].sum()
    else:
        counts = df['Species'].value_counts()
        
    total_individuals = counts.sum()
    if total_individuals == 0:
        return {"shannon": 0, "simpson": 0, "evenness": 0}
        
    proportions = counts / total_individuals
    
    # Shannon Index (H') = -sum(pi * ln(pi))
    shannon = -np.sum(proportions * np.log(proportions))
    
    # Simpson Index (D) = sum(pi^2)
    # Simpson's Index of Diversity (1 - D)
    simpson = 1 - np.sum(proportions ** 2)
    
    # Pielou's Evenness (J') = H' / ln(S)
    S = len(counts)
    evenness = shannon / np.log(S) if S > 1 else 0
    
    return {
        "plot_id": plot_id,
        "shannon_index": round(shannon, 3),
        "simpson_index": round(simpson, 3),
        "pielou_evenness": round(evenness, 3)
    }

def calculate_dominance(plot_id):
    """
    Calculates dominance metrics (abundance rank).
    """
    df = get_cleaned_data(plot_id, data_type='full')
    if df.empty:
        return []
        
    if 'Number' in df.columns:
        counts = df.groupby('Species')['Number'].sum()
    else:
        counts = df['Species'].value_counts()
        
    total = counts.sum()
    dominance_df = counts.reset_index(name='count')
    dominance_df['relative_abundance'] = (dominance_df['count'] / total) * 100
    dominance_df = dominance_df.sort_values('count', ascending=False)
    
    return dominance_df.to_dict(orient='records')

def calculate_structural_metrics(plot_id):
    """
    Calculates structural metrics (Height and DBH distributions) for trees.
    """
    df = get_cleaned_data(plot_id, data_type='trees')
    if df.empty:
        return {"height_dist": [], "dbh_dist": []}
        
    # Height Distribution
    # Create bins for height (e.g., 0-5, 5-10, etc.)
    height_bins = [0, 2, 5, 10, 15, 20, 30, 50]
    height_labels = ['0-2m', '2-5m', '5-10m', '10-15m', '15-20m', '20-30m', '>30m']
    
    if 'Height_m' in df.columns:
        df['Height_Class'] = pd.cut(df['Height_m'], bins=height_bins, labels=height_labels, right=False)
        height_dist = df['Height_Class'].value_counts().sort_index().reset_index()
        height_dist.columns = ['range', 'count']
    else:
        height_dist = pd.DataFrame(columns=['range', 'count'])

    # DBH Distribution
    # Create bins for DBH (e.g., 0-10, 10-20, etc.)
    dbh_bins = [0, 10, 20, 30, 50, 80, 100, 200]
    dbh_labels = ['0-10cm', '10-20cm', '20-30cm', '30-50cm', '50-80cm', '80-100cm', '>100cm']
    
    if 'Effective_DBH_cm' in df.columns:
        df['DBH_Class'] = pd.cut(df['Effective_DBH_cm'], bins=dbh_bins, labels=dbh_labels, right=False)
        dbh_dist = df['DBH_Class'].value_counts().sort_index().reset_index()
        dbh_dist.columns = ['range', 'count']
    else:
        dbh_dist = pd.DataFrame(columns=['range', 'count'])
        
    return {
        "plot_id": plot_id,
        "height_distribution": height_dist.to_dict(orient='records'),
        "dbh_distribution": dbh_dist.to_dict(orient='records')
    }

def calculate_biomass_and_carbon():
    """
    Calculates biomass and carbon stock for trees, using paths from the central config.
    """
    logging.info(f"Starting ecological calculations for {CLEANED_VEG_TREES_PATH}")
    
    os.makedirs(os.path.dirname(ECO_RESULTS_PATH), exist_ok=True)
    
    df_trees = pd.read_csv(CLEANED_VEG_TREES_PATH)

    # --- Ecological Calculations ---
    wood_density_map = {
        'Ficus racemosa': 0.48, 
        'Pongamia pinnata': 0.65, 
        'Indian drumstick': 0.45,
        'Azadirachta indica': 0.58,
        'Caesalpinia pulcherrima': 0.6, # Using a generic value for ornamental tree
        'Hibiscus rosa-sinensis': 0.5, # Using a generic value for large shrub/small tree
        'Neem': 0.58, # Synonym for Azadirachta indica
        'default': 0.62
    }
    df_trees['Wood_Density_g_cm3'] = df_trees['Species'].map(wood_density_map).fillna(wood_density_map['default'])

    # Method 1 (Height-Inclusive)
    df_trees['AGB_M1_kg'] = 0.0673 * (df_trees['Wood_Density_g_cm3'] * df_trees['Effective_DBH_cm']**2 * df_trees['Height_m'])**0.976
    df_trees['Carbon_Stock_M1_kg'] = (df_trees['AGB_M1_kg'] * 1.26) * 0.47
    df_trees['CO2_Eq_M1_kg'] = df_trees['Carbon_Stock_M1_kg'] * (44/12)

    # Method 2 (Height-Exclusive)
    D = df_trees['Effective_DBH_cm']
    rho = df_trees['Wood_Density_g_cm3']
    # Ensure no log(0) or negative logs
    D_safe = D.replace(0, np.nan).dropna()
    rho_safe = rho.replace(0, np.nan).dropna()

    df_trees['AGB_M2_kg'] = np.exp(-1.803 - 0.976 * np.log(rho_safe) + 2.673 * np.log(D_safe) - 0.0299 * (np.log(D_safe))**2)
    df_trees['Carbon_Stock_M2_kg'] = (df_trees['AGB_M2_kg'] * 1.26) * 0.47
    df_trees['CO2_Eq_M2_kg'] = df_trees['Carbon_Stock_M2_kg'] * (44/12)
    
    df_trees.to_csv(ECO_RESULTS_PATH, index=False)
    logging.info(f"Ecological calculations complete. Results saved to {ECO_RESULTS_PATH}")
    
    return df_trees