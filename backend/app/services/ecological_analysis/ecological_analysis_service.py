import pandas as pd
import numpy as np
import os
import logging
from app.core.config import CLEANED_VEG_TREES_PATH, ECO_RESULTS_PATH

logger = logging.getLogger(__name__)

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