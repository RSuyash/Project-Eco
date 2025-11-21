import pandas as pd
import logging
from app.core.config import (
    CLEANED_VEG_FULL_PATH,
    ECO_RESULTS_PATH,
    CANOPY_RESULTS_PATH,
)

logger = logging.getLogger(__name__)

def get_full_cleaned_data():
    """Loads and returns the full cleaned vegetation data."""
    try:
        return pd.read_csv(CLEANED_VEG_FULL_PATH)
    except FileNotFoundError:
        logger.error(f"Data file not found: {CLEANED_VEG_FULL_PATH}")
        return None

def get_eco_results_data():
    """Loads and returns the ecological analysis results."""
    try:
        return pd.read_csv(ECO_RESULTS_PATH)
    except FileNotFoundError:
        logger.error(f"Data file not found: {ECO_RESULTS_PATH}")
        return None

def get_canopy_results_data():
    """Loads and returns the canopy analysis results."""
    try:
        return pd.read_csv(CANOPY_RESULTS_PATH)
    except FileNotFoundError:
        logger.error(f"Data file not found: {CANOPY_RESULTS_PATH}")
        return None

def get_data_for_plant_composition(plot_id: str):
    """Prepares data for the plant composition plot (Fig 2)."""
    df_cleaned = get_full_cleaned_data()
    if df_cleaned is None or 'Plot' not in df_cleaned.columns:
        return None
    
    df_plot = df_cleaned[df_cleaned['Plot'] == plot_id]
    if df_plot.empty:
        return None
        
    return df_plot.groupby(['Quadrant', 'Type'])['Number'].sum().unstack(fill_value=0).reindex(['Q1','Q2','Q3','Q4'])

def get_data_for_schematic_distribution(plot_id: str):
    """Prepares data for the schematic plant distribution plot (Fig 3)."""
    df_cleaned = get_full_cleaned_data()
    df_trees = get_eco_results_data()
    if df_cleaned is None or df_trees is None or 'Plot' not in df_cleaned.columns:
        return None

    df_cleaned_plot = df_cleaned[df_cleaned['Plot'] == plot_id]
    df_trees_plot = df_trees[df_trees['Plot'] == plot_id]
    if df_cleaned_plot.empty:
        return None

    return pd.merge(df_cleaned_plot, df_trees_plot[['Quadrant', 'ID', 'Effective_DBH_cm']], on=['Quadrant', 'ID'], how='left')

def get_data_for_species_distribution(plot_id: str):
    """Prepares data for the woody species distribution plot (Fig 4)."""
    df_cleaned = get_full_cleaned_data()
    if df_cleaned is None or 'Plot' not in df_cleaned.columns:
        return None

    df_plot = df_cleaned[df_cleaned['Plot'] == plot_id]
    if df_plot.empty:
        return None

    woody_df = df_plot[df_plot['Type'].isin(['Tree', 'Sapling'])].copy()
    return woody_df.dropna(subset=['Species']).groupby('Species')['Number'].sum().sort_values(ascending=False).reset_index()

def get_data_for_co2_by_quadrant(plot_id: str):
    """Prepares data for the CO2 sequestered by quadrant plots (Fig 5 & 7)."""
    df_trees = get_eco_results_data()
    if df_trees is None or 'Plot' not in df_trees.columns:
        return None
    
    df_plot = df_trees[df_trees['Plot'] == plot_id]
    if df_plot.empty:
        return None

    summary_m1 = df_plot.groupby('Quadrant')['CO2_Eq_M1_kg'].sum().reset_index()
    summary_m2 = df_plot.groupby('Quadrant')['CO2_Eq_M2_kg'].sum().reset_index()
    return summary_m1, summary_m2

def get_data_for_tree_contribution(plot_id: str):
    """Prepares data for the tree contribution to carbon stock plots (Fig 6 & 8)."""
    df_trees = get_eco_results_data()
    if df_trees is None or 'Plot' not in df_trees.columns:
        return None

    df_plot = df_trees[df_trees['Plot'] == plot_id]
    if df_plot.empty:
        return None
    
    df_plot['Tree_Label'] = df_plot['Quadrant'] + " - ID " + df_plot['ID'].astype(str)
    return df_plot

def get_data_for_co2_comparison(plot_id: str):
    """Prepares data for the CO2 comparison plot (Fig 9)."""
    df_trees = get_eco_results_data()
    if df_trees is None or 'Plot' not in df_trees.columns:
        return None

    df_plot = df_trees[df_trees['Plot'] == plot_id]
    if df_plot.empty:
        return None

    plot_summary_comp = df_plot.groupby('Quadrant').agg(CO2_M1=('CO2_Eq_M1_kg', 'sum'), CO2_M2=('CO2_Eq_M2_kg', 'sum')).reset_index()
    plot_summary_melted = plot_summary_comp.melt(id_vars='Quadrant', var_name='Method', value_name='CO2_kg')
    plot_summary_melted['Method'] = plot_summary_melted['Method'].map({'CO2_M1': 'M1 (Height-Inclusive)', 'CO2_M2': 'M2 (Height-Exclusive)'})
    return plot_summary_melted

def get_data_for_biomass_comparison(plot_id: str):
    """Prepares data for the biomass comparison plot (Fig 10)."""
    df_trees = get_eco_results_data()
    if df_trees is None or 'Plot' not in df_trees.columns:
        return None
    
    df_plot = df_trees[df_trees['Plot'] == plot_id]
    return df_plot if not df_plot.empty else None

def get_data_for_canopy_summary(plot_id: str):
    """Prepares data for the canopy cover and LAI summary plots (Fig 11 & 12)."""
    df_canopy = get_canopy_results_data()
    if df_canopy is None or 'plot_id' not in df_canopy.columns:
        return None
        
    df_plot = df_canopy[df_canopy['plot_id'] == plot_id]
    return df_plot if not df_plot.empty else None
