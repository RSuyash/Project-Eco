import pandas as pd
import numpy as np
import os
import logging
from app.core.config import (
    RAW_WOODY_DATA,
    RAW_HERB_DATA,
    CLEANED_VEG_FULL_PATH,
    CLEANED_VEG_TREES_PATH,
)

logger = logging.getLogger(__name__)

def clean_vegetation_data():
    """
    Cleans and preprocesses vegetation survey data from separate woody and herb files,
    using paths from the central config.
    """
    logging.info(f"Starting data cleaning process for woody: {RAW_WOODY_DATA}, herb: {RAW_HERB_DATA}")

    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(CLEANED_VEG_FULL_PATH), exist_ok=True)
    os.makedirs(os.path.dirname(CLEANED_VEG_TREES_PATH), exist_ok=True)

    # Load woody vegetation data
    woody_df = pd.read_csv(RAW_WOODY_DATA)
    woody_df.rename(columns={
        'Quad_ID': 'Quadrant',
        'Species_Scientific': 'Species',
        'Growth_Form': 'Type',
        'GBH_Stem1_cm': 'Girth_cm_Stem1',
        'GBH_Stem2_cm': 'Girth_cm_Stem2',
        'Height_m': 'Height_m',
        'Tree_ID': 'ID',
        'Plot_ID': 'Plot'
    }, inplace=True)
    woody_df['Number'] = 1 # Each row represents one individual
    woody_df['ID'] = woody_df['ID'].astype(str) # Ensure ID is string
    # Add placeholder for Girth_cm_Stem3 if it doesn't exist (for consistency)
    if 'Girth_cm_Stem3' not in woody_df.columns:
        woody_df['Girth_cm_Stem3'] = np.nan

    # Load herb floor vegetation data
    herb_df = pd.read_csv(RAW_HERB_DATA)
    herb_df.rename(columns={
        'Layer_Type': 'Type',
        'Species_or_Category': 'Species',
        'Count_or_Cover%': 'Number', # Note: This is a percentage, not a count
        'Avg_Height_cm': 'Height_m',
        'Plot_ID': 'Plot'
    }, inplace=True)
    # Map Subplot_ID to Quadrant
    subplot_to_quadrant_map = {
        'SP1': 'Q1',
        'SP2': 'Q2',
        'SP3': 'Q3',
        'SP4': 'Q4'
    }
    herb_df['Quadrant'] = herb_df['Subplot_ID'].map(subplot_to_quadrant_map)
    herb_df['Height_m'] = herb_df['Height_m'] / 100 # Convert cm to meters
    herb_df['Girth_cm_Stem1'] = np.nan # No girth for herbs
    herb_df['Girth_cm_Stem2'] = np.nan # No girth for herbs
    herb_df['Girth_cm_Stem3'] = np.nan # No girth for herbs
    herb_df['ID'] = herb_df['Type'] + '_' + herb_df['Subplot_ID'].astype(str) # Create a unique ID
    herb_df['ID'] = herb_df['ID'].astype(str) # Ensure ID is string

    # Combine the dataframes
    df = pd.concat([woody_df, herb_df], ignore_index=True)
    df['Plot'] = 'Plot-' + df['Plot'].astype(str) # Standardize plot names to 'Plot-P01', 'Plot-P02', etc.

    # Ensure all expected columns are present, filling missing ones with NaN
    expected_cols = [
        'Plot', 'Quadrant', 'ID', 'Type', 'Number', 'Species', 'Girth_cm_Stem1',
        'Girth_cm_Stem2', 'Girth_cm_Stem3', 'Height_m'
    ]
    for col in expected_cols:
        if col not in df.columns:
            df[col] = np.nan

    # Reorder columns to match the original script's expected structure as much as possible
    df = df[expected_cols + [col for col in df.columns if col not in expected_cols]]

    # The rest of the cleaning logic remains largely the same, operating on the combined 'df'
    # Rename columns for consistency (some already done above, but keeping for robustness)
    df.rename(columns={
        'Quadrant ID': 'Quadrant', # This might be from original data, ensure it's handled
        'GBH (Girth at Breast Height) - First Branch': 'Girth_cm_Stem1',
        'GBH (Girth at Breast Height) - Second Branch': 'Girth_cm_Stem2',
        'GBH (Girth at Breast Height) - Third Branch': 'Girth_cm_Stem3',
        'Height (m)': 'Height_m'
    }, inplace=True)

    df_cleaned = df.copy()
    df_cleaned.loc[:, 'Quadrant'] = df_cleaned['Quadrant'].ffill()
    df_cleaned['Type'] = df_cleaned['Type'].str.strip().replace('Saplings', 'Sapling')
    
    numeric_cols = ['Number', 'Girth_cm_Stem1', 'Girth_cm_Stem2', 'Girth_cm_Stem3', 'Height_m']
    for col in numeric_cols:
        df_cleaned[col] = pd.to_numeric(df_cleaned[col], errors='coerce')

    # --- Data Cleaning for Species ---
    df_cleaned['Species'] = df_cleaned['Species'].str.strip()
    df_cleaned['Species'] = df_cleaned['Species'].replace('', np.nan)
    
    # Save the full cleaned data
    df_cleaned.to_csv(CLEANED_VEG_FULL_PATH, index=False)
    logging.info(f"Full cleaned data saved to {CLEANED_VEG_FULL_PATH}")

    df_trees = df_cleaned[df_cleaned['Type'] == 'Tree'].copy()
    df_trees.dropna(subset=['Girth_cm_Stem1'], inplace=True)
    
    # Calculate DBH for each stem
    df_trees['DBH1_cm'] = df_trees['Girth_cm_Stem1'] / np.pi
    df_trees['DBH2_cm'] = df_trees['Girth_cm_Stem2'] / np.pi
    df_trees['DBH3_cm'] = df_trees['Girth_cm_Stem3'] / np.pi
    
    # Calculate effective DBH
    df_trees['Effective_DBH_cm'] = np.sqrt(
        df_trees['DBH1_cm'].fillna(0)**2 + 
        df_trees['DBH2_cm'].fillna(0)**2 + 
        df_trees['DBH3_cm'].fillna(0)**2
    )
    
    df_trees.dropna(subset=['Height_m'], inplace=True)

    # Save the cleaned trees data
    df_trees.to_csv(CLEANED_VEG_TREES_PATH, index=False)
    logging.info(f"Cleaned tree data saved to {CLEANED_VEG_TREES_PATH}")
    
    return df_cleaned, df_trees

def save_raw_field_data(woody_data: list, herb_data: list):
    """
    Saves raw woody and herb data (from API request) to their respective CSV files.
    This overwrites existing raw data.
    """
    logging.info("Saving raw field data to CSV files.")

    # Convert list of dicts to DataFrame for woody data
    woody_df = pd.DataFrame(woody_data)
    # Ensure column order matches original CSV for consistency
    woody_df = woody_df[['Plot_ID', 'Location_Name', 'Quad_ID', 'Species_Scientific', 'Growth_Form', 'Tree_ID', 'Height_m', 'Condition', 'GBH_Stem1_cm', 'GBH_Stem2_cm', 'GBH_Stem3_cm', 'GBH_Stem4_cm', 'GBH_Stem5_cm', 'GBH_Stem6_cm', 'Remarks', 'Total_GBH_cm']]
    woody_df.to_csv(RAW_WOODY_DATA, index=False)
    logging.info(f"Raw woody data saved to {RAW_WOODY_DATA}")

    # Convert list of dicts to DataFrame for herb data
    herb_df = pd.DataFrame(herb_data)
    # Ensure column order matches original CSV for consistency
    herb_df = herb_df[['Plot_ID', 'Location_Name', 'Subplot_ID', 'Layer_Type', 'Species_or_Category', 'Count_or_Cover', 'Avg_Height_cm', 'Notes']]
    # Rename 'Count_or_Cover' back to 'Count_or_Cover%' for the CSV file
    herb_df.rename(columns={'Count_or_Cover': 'Count_or_Cover%'}, inplace=True)
    herb_df.to_csv(RAW_HERB_DATA, index=False)
    logging.info(f"Raw herb data saved to {RAW_HERB_DATA}")
