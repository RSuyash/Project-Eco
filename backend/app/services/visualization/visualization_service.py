import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import matplotlib.patches as patches
import os
import logging
from app.core.config import (
    CLEANED_VEG_FULL_PATH,
    ECO_RESULTS_PATH,
    CANOPY_RESULTS_PATH,
    IMAGE_DIR,
)

logger = logging.getLogger(__name__)

def setup_matplotlib():
    plt.style.use('seaborn-v0_8-whitegrid')
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['figure.dpi'] = 120
    plt.rcParams['axes.titleweight'] = 'bold'
    plt.rcParams['axes.labelweight'] = 'bold'

def plot_nested_sampling_design(output_path):
    fig, ax = plt.subplots(figsize=(10, 10))
    ax.set_aspect('equal', adjustable='box'); ax.set_xlim(-1, 11); ax.set_ylim(-1, 11)
    ax.set_xticks(np.arange(0, 11, 1)); ax.set_yticks(np.arange(0, 11, 1))
    fig.suptitle("Figure 1: Nested Sampling Plot Design", fontsize=18)
    ax.set_title("10x10m plot with quadrants numbered anti-clockwise from top-left.", fontsize=12, pad=10)
    ax.set_xlabel("West-East Direction (meters)", fontsize=12); ax.set_ylabel("South-North Direction (meters)", fontsize=12)
    main_plot = patches.Rectangle((0, 0), 10, 10, linewidth=4, edgecolor='black', facecolor='none', zorder=10)
    ax.add_patch(main_plot)
    quadrant_coords = {"Q1": (0, 5), "Q2": (0, 0), "Q3": (5, 0), "Q4": (5, 5)}
    for name, (x, y) in quadrant_coords.items():
        ax.add_patch(patches.Rectangle((x, y), 5, 5, linewidth=2.5, edgecolor='#003366', facecolor='#aaccff', alpha=0.6))
        ax.text(x + 2.5, y + 2.5, name, ha='center', va='center', fontsize=14, fontweight='bold', color='#003366')
    for x, y in [(0, 0), (9, 0), (0, 9), (9, 9)]:
        ax.add_patch(patches.Rectangle((x, y), 1, 1, linewidth=2, edgecolor='#990000', facecolor='#ff9999', alpha=0.8))
    legend_patches = [patches.Patch(edgecolor='black', facecolor='none', linewidth=4, label='10x10m Main Plot'),
                      patches.Patch(edgecolor='#003366', facecolor='#aaccff', alpha=0.6, label='5x5m Quadrant'),
                      patches.Patch(edgecolor='#990000', facecolor='#ff9999', alpha=0.8, label='1x1m Sub-plot (Herbs)')]
    ax.legend(handles=legend_patches, loc='upper center', bbox_to_anchor=(0.5, -0.05), fancybox=True, ncol=3, fontsize=11)
    fig.tight_layout(rect=[0, 0.05, 1, 0.95]); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def plot_plant_composition(df_cleaned, output_path, plot_no, custom_title_suffix=""):
    counts_per_plot = df_cleaned.groupby(['Quadrant', 'Type'])['Number'].sum().unstack(fill_value=0).reindex(['Q1','Q2','Q3','Q4'])
    fig, ax = plt.subplots(figsize=(10, 7))
    counts_per_plot.plot(kind='bar', stacked=True, ax=ax, width=0.7)
    
    title_text = f'Figure 2: Plant Composition by Quadrant ({plot_no})'
    if custom_title_suffix:
        title_text = f'Figure 2: Plant Composition by Quadrant ({custom_title_suffix})'
    
    fig.suptitle(title_text, fontsize=18)
    ax.set_title("Shows the total count and type of plants recorded in each quadrant.", fontsize=12, pad=10)
    ax.set_xlabel('Quadrant', fontsize=12); ax.set_ylabel('Total Number of Individuals', fontsize=12)
    ax.tick_params(axis='x', rotation=0, labelsize=11)
    ax.legend(title='Plant Type', bbox_to_anchor=(1.01, 1), loc='upper left', fontsize=11, title_fontsize=12)
    fig.tight_layout(rect=[0, 0, 0.88, 0.96]); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def plot_schematic_plant_distribution(df_cleaned, df_trees, output_path, plot_no):
    fig, ax = plt.subplots(figsize=(10, 10))
    ax.set_aspect('equal', adjustable='box'); ax.set_xlim(-1, 11); ax.set_ylim(-1, 11)
    ax.set_xticks(np.arange(0, 11, 1)); ax.set_yticks(np.arange(0, 11, 1))
    fig.suptitle(f"Figure 3: Schematic Plant Distribution (Plot {plot_no})", fontsize=18)
    ax.set_title("Structured locations of plants. Circle size is scaled by tree diameter or count.", fontsize=12, pad=10)
    ax.set_xlabel("West-East Direction (meters)", fontsize=12); ax.set_ylabel("South-North Direction (meters)", fontsize=12)

    # Define quadrant boundaries and 1x1m subplot centers
    quadrant_boundaries = {"Q1": (0, 5, 5, 5), "Q2": (0, 0, 5, 5), "Q3": (5, 0, 5, 5), "Q4": (5, 5, 5, 5)} # x, y, width, height
    subplot_1x1_centers = {"Q1": (0.5, 9.5), "Q2": (0.5, 0.5), "Q3": (9.5, 0.5), "Q4": (9.5, 9.5)} # Center of 1x1m subplot

    # Draw 5x5m quadrants and 1x1m subplots
    for name, (x, y, w, h) in quadrant_boundaries.items():
        ax.add_patch(patches.Rectangle((x, y), w, h, linewidth=1.5, edgecolor='lightgrey', facecolor='#f0fff0', alpha=0.5, zorder=1))
        ax.text(x + w/2, y + h/2, name, ha='center', va='center', fontsize=12, color='darkgrey', zorder=2)
    
    for name, (cx, cy) in subplot_1x1_centers.items():
        ax.add_patch(patches.Rectangle((cx-0.5, cy-0.5), 1, 1, linewidth=1.5, edgecolor='darkred', facecolor='#ffcccc', alpha=0.7, zorder=1))

    plant_colors = {'Tree': '#006400', 'Sapling': '#FF8C00', 'Shrub': '#8A2BE2', 'Herb': '#556B2F', 'Grass': '#9ACD32', 'Bare Soil': '#CD853F', 'Litter': '#8B4513'}
    
    # Merge cleaned data with tree ecological results for DBH
    df_viz = pd.merge(df_cleaned, df_trees[['Quadrant', 'ID', 'Effective_DBH_cm']], on=['Quadrant', 'ID'], how='left')

    # Filter for Tree/Sapling/Shrub types (distributed within 5x5m quadrants)
    tree_like_df = df_viz[df_viz['Type'].isin(['Tree', 'Sapling', 'Shrub'])].copy()
    # Filter for Herb/Grass/Bare Soil/Litter types (located in 1x1m subplots)
    herb_like_df = df_viz[df_viz['Type'].isin(['Herb', 'Grass', 'Bare Soil', 'Litter'])].copy()

    # Plot Tree/Sapling/Shrub types
    for quadrant_name, (qx, qy, qw, qh) in quadrant_boundaries.items():
        quadrant_data = tree_like_df[tree_like_df['Quadrant'] == quadrant_name].reset_index(drop=True)
        num_items = len(quadrant_data)
        if num_items == 0: continue

        # Distribute points within the 5x5m quadrant area
        # Using a small random offset for better visual separation
        for i, (index, row) in enumerate(quadrant_data.iterrows()):
            plot_x = qx + np.random.uniform(0.5, qw - 0.5)
            plot_y = qy + np.random.uniform(0.5, qh - 0.5)

            if row['Type'] == 'Tree' and pd.notna(row['Effective_DBH_cm']):
                current_size = row['Effective_DBH_cm'] * 30
                label = f"ID {row['ID']}: DBH {row['Effective_DBH_cm']:.1f}cm"
            else:
                current_size = row['Number'] * 35 # Assuming 'Number' is count for saplings/shrubs
                label = f"ID {row['ID']}: {int(row['Number'])} {row['Type']}(s)"
            
            if pd.isna(current_size) or current_size <= 0:
                continue

            ax.scatter(plot_x, plot_y, s=current_size, c=plant_colors.get(row['Type'], 'black'), alpha=0.9, zorder=5, edgecolors='black', linewidth=0.5)
            ax.text(plot_x, plot_y + 0.7, label, ha='center', va='center', fontsize=8, weight='semibold', zorder=6,
                    bbox=dict(facecolor='white', alpha=0.85, edgecolor='none', boxstyle='round,pad=0.2'))

    # Plot Herb/Grass/Bare Soil/Litter types within their 1x1m subplots
    for quadrant_name, (cx, cy) in subplot_1x1_centers.items():
        subplot_data = herb_like_df[herb_like_df['Quadrant'] == quadrant_name].reset_index(drop=True)
        num_items = len(subplot_data)
        if num_items == 0: continue

        # Distribute points within the 1x1m subplot area
        # Using a small random offset for better visual separation
        for i, (index, row) in enumerate(subplot_data.iterrows()):
            plot_x = cx + np.random.uniform(-0.4, 0.4)
            plot_y = cy + np.random.uniform(-0.4, 0.4)

            current_size = row['Number'] * 10 # 'Number' is cover % for herbs, scale appropriately
            label = f"{row['Type']}: {int(row['Number'])}%"
            
            if pd.isna(current_size) or current_size <= 0:
                continue

            ax.scatter(plot_x, plot_y, s=current_size, c=plant_colors.get(row['Type'], 'black'), alpha=0.9, zorder=5, edgecolors='black', linewidth=0.5)
            ax.text(plot_x, plot_y + 0.2, label, ha='center', va='center', fontsize=7, weight='semibold', zorder=6,
                    bbox=dict(facecolor='white', alpha=0.85, edgecolor='none', boxstyle='round,pad=0.2'))

    # Create a unified legend
    legend_handles = [patches.Patch(color=color, label=label) for label, color in plant_colors.items()]
    ax.legend(handles=legend_handles, title='Plant Type', loc='center left', bbox_to_anchor=(1, 0.5), fancybox=True, fontsize=12, borderpad=1, labelspacing=1.2)
    fig.tight_layout(rect=[0, 0, 0.88, 0.95])
    plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def plot_species_distribution(df_cleaned, output_path, plot_no):
    woody_df = df_cleaned[df_cleaned['Type'].isin(['Tree', 'Sapling'])].copy()
    species_counts = woody_df.dropna(subset=['Species']).groupby('Species')['Number'].sum().sort_values(ascending=False).reset_index()
    fig_height = max(7, len(species_counts) * 0.5)
    fig, ax = plt.subplots(figsize=(10, fig_height))
    sns.barplot(x='Number', y='Species', data=species_counts, palette='viridis', ax=ax)
    fig.suptitle(f'Figure 4: Distribution of Identified Woody Plant Species (Plot {plot_no})', fontsize=18)
    ax.set_title("Shows the total abundance for each woody species identified in the field.", fontsize=12, pad=10)
    ax.set_xlabel('Total Number of Individuals', fontsize=12); ax.set_ylabel('Species', fontsize=12)
    fig.tight_layout(); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def plot_co2_sequestered(df_trees, output_path_m1, output_path_m2, plot_no):
    plot_summary_m1 = df_trees.groupby('Quadrant')['CO2_Eq_M1_kg'].sum().reset_index()
    fig5, ax5 = plt.subplots(figsize=(10, 7))
    bars = sns.barplot(x='Quadrant', y='CO2_Eq_M1_kg', data=plot_summary_m1, palette='mako', ax=ax5, order=['Q1','Q2','Q3','Q4'])
    fig5.suptitle(f'Figure 5: CO₂ Sequestered by Quadrant (Method 1) (Plot {plot_no})', fontsize=18)
    ax5.set_title("Estimates based on the Height-Inclusive allometric equation.", fontsize=12, pad=10)
    ax5.set_xlabel('Quadrant', fontsize=12); ax5.set_ylabel('Total CO₂ Equivalent (kg)', fontsize=12)
    for bar in bars.patches:
        ax5.annotate(f'{bar.get_height():.0f} kg', (bar.get_x() + bar.get_width() / 2, bar.get_height()),
                    ha='center', va='center', size=11, weight='bold', xytext=(0, 8), textcoords='offset points')
    ax5.set_ylim(0, plot_summary_m1['CO2_Eq_M1_kg'].max() * 1.2)
    fig5.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path_m1)
    plt.close(fig5)
    logging.info(f"Generated plot: {output_path_m1}")

    plot_summary_m2 = df_trees.groupby('Quadrant')['CO2_Eq_M2_kg'].sum().reset_index()
    fig7, ax7 = plt.subplots(figsize=(10, 7))
    bars = sns.barplot(x='Quadrant', y='CO2_Eq_M2_kg', data=plot_summary_m2, palette='viridis', ax=ax7, order=['Q1','Q2','Q3','Q4'])
    fig7.suptitle(f'Figure 7: CO₂ Sequestered by Quadrant (Method 2) (Plot {plot_no})', fontsize=18)
    ax7.set_title("Estimates based on the robust Height-Exclusive (DBH-only) allometric equation.", fontsize=12, pad=10)
    ax7.set_xlabel('Quadrant', fontsize=12); ax7.set_ylabel('Total CO₂ Equivalent (kg)', fontsize=12)
    for bar in bars.patches:
        ax7.annotate(f'{bar.get_height():.0f} kg', (bar.get_x() + bar.get_width() / 2, bar.get_height()),
                    ha='center', va='center', size=11, weight='bold', xytext=(0, 8), textcoords='offset points')
    ax7.set_ylim(0, plot_summary_m2['CO2_Eq_M2_kg'].max() * 1.2)
    fig7.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path_m2)
    plt.close(fig7)
    logging.info(f"Generated plot: {output_path_m2}")

def plot_tree_contribution(df_trees, output_path_m1, output_path_m2, plot_no):
    df_trees['Tree_Label'] = df_trees['Quadrant'] + " - ID " + df_trees['ID'].astype(str)
    fig6, ax6 = plt.subplots(figsize=(10, 8))
    df_m1 = df_trees.sort_values('Carbon_Stock_M1_kg', ascending=True)
    ax6.barh(df_m1['Tree_Label'], df_m1['Carbon_Stock_M1_kg'], color='skyblue')
    ax6.set_xlabel('Carbon Stock (kg)')
    ax6.set_ylabel('Tree')
    fig6.suptitle(f'Figure 6: Tree Contribution to Total Carbon Stock (Method 1) (Plot {plot_no})', fontsize=18)
    ax6.set_title("Shows the carbon stored by each tree using Method 1.", fontsize=12, pad=10)
    fig6.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path_m1)
    plt.close(fig6)
    logging.info(f"Generated plot: {output_path_m1}")

    fig8, ax8 = plt.subplots(figsize=(10, 8))
    df_m2 = df_trees.sort_values('Carbon_Stock_M2_kg', ascending=True)
    ax8.barh(df_m2['Tree_Label'], df_m2['Carbon_Stock_M2_kg'], color='lightcoral')
    ax8.set_xlabel('Carbon Stock (kg)')
    ax8.set_ylabel('Tree')
    fig8.suptitle(f'Figure 8: Tree Contribution to Total Carbon Stock (Method 2) (Plot {plot_no})', fontsize=18)
    ax8.set_title("Shows the carbon stored by each tree using Method 2.", fontsize=12, pad=10)
    fig8.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path_m2)
    plt.close(fig8)
    logging.info(f"Generated plot: {output_path_m2}")

def plot_comparison_figures(df_trees, output_path_co2, output_path_biomass, plot_no):
    plot_summary_comp = df_trees.groupby('Quadrant').agg(CO2_M1=('CO2_Eq_M1_kg', 'sum'), CO2_M2=('CO2_Eq_M2_kg', 'sum')).reset_index()
    plot_summary_melted = plot_summary_comp.melt(id_vars='Quadrant', var_name='Method', value_name='CO2_kg')
    plot_summary_melted['Method'] = plot_summary_melted['Method'].map({'CO2_M1': 'M1 (Height-Inclusive)', 'CO2_M2': 'M2 (Height-Exclusive)'})
    fig9, ax9 = plt.subplots(figsize=(12, 8))
    sns.barplot(x='Quadrant', y='CO2_kg', hue='Method', data=plot_summary_melted, palette='cividis', ax=ax9, order=['Q1','Q2','Q3','Q4'])
    fig9.suptitle(f'Figure 9: Comparison of CO₂ Sequestered by Quadrant (Plot {plot_no})', fontsize=18)
    ax9.set_title("Shows the range of estimates between the two allometric equations for each quadrant.", fontsize=12, pad=10)
    ax9.set_xlabel('Quadrant', fontsize=12); ax9.set_ylabel('Total CO₂ Equivalent (kg)', fontsize=12)
    ax9.legend(title='Calculation Method', fontsize=11, title_fontsize=12); fig9.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path_co2)
    plt.close(fig9)
    logging.info(f"Generated plot: {output_path_co2}")

    fig10, ax10 = plt.subplots(figsize=(12, 8))
    sns.scatterplot(data=df_trees, x='Effective_DBH_cm', y='AGB_M1_kg', s=200, ax=ax10, label='Method 1 (Height-Inclusive)', zorder=10)
    sns.scatterplot(data=df_trees, x='Effective_DBH_cm', y='AGB_M2_kg', s=250, ax=ax10, marker='X', label='Method 2 (Height-Exclusive)', zorder=10)
    fig10.suptitle(f'Figure 10: Comparison of Biomass Estimates vs. Tree Diameter (Plot {plot_no})', fontsize=18)
    ax10.set_title("Each tree is represented by two points, showing the biomass estimate from each method.", fontsize=12, pad=10)
    ax10.set_xlabel('Effective Stem Diameter (cm)', fontsize=12); ax10.set_ylabel('Estimated Aboveground Biomass (kg)', fontsize=12)
    ax10.legend(fontsize=11, title_fontsize=12); fig10.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path_biomass)
    plt.close(fig10)
    logging.info(f"Generated plot: {output_path_biomass}")

def plot_canopy_analysis(df_canopy, output_path_cover, output_path_lai, plot_id):
    fig11, ax11 = plt.subplots(figsize=(10, 7))
    bars = sns.barplot(x='filename', y='canopy_cover_percent', data=df_canopy, palette='summer', ax=ax11)
    fig11.suptitle(f'Figure 11: Summary of Canopy Cover by Quadrant Location (Plot {plot_id})', fontsize=18)
    ax11.set_title("Canopy cover calculated from hemispherical photographs.", fontsize=12, pad=10)
    ax11.set_xlabel('Quadrant Location (Image Filename)', fontsize=12); ax11.set_ylabel('Canopy Cover (%)', fontsize=12)
    ax11.set_ylim(0, 100); plt.xticks(rotation=15, ha="right")
    for bar in bars.patches:
        ax11.annotate(f'{bar.get_height():.1f}%', (bar.get_x() + bar.get_width() / 2, bar.get_height()),
                    ha='center', va='center', size=11, weight='bold', xytext=(0, 8), textcoords='offset points')
    fig11.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path_cover)
    plt.close(fig11)
    logging.info(f"Generated plot: {output_path_cover}")

    fig12, ax12 = plt.subplots(figsize=(10, 7))
    bars = sns.barplot(x='filename', y='estimated_lai', data=df_canopy, palette='autumn', ax=ax12)
    fig12.suptitle(f'Figure 12: Summary of Estimated LAI by Quadrant Location (Plot {plot_id})', fontsize=18)
    ax12.set_title("Leaf Area Index (LAI) estimated from canopy gap fraction.", fontsize=12, pad=10)
    ax12.set_xlabel('Quadrant Location (Image Filename)', fontsize=12); ax12.set_ylabel('Estimated Leaf Area Index (LAI)', fontsize=12)
    plt.xticks(rotation=15, ha="right")
    for bar in bars.patches:
        ax12.annotate(f'{bar.get_height():.2f}', (bar.get_x() + bar.get_width() / 2, bar.get_height()),
                    ha='center', va='center', size=11, weight='bold', xytext=(0, 8), textcoords='offset points')
    ax12.set_ylim(0, df_canopy['estimated_lai'].max() * 1.2)
    fig12.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path_lai)
    plt.close(fig12)
    logging.info(f"Generated plot: {output_path_lai}")

def generate_all_plots():
    logging.info("Starting plot generation with per-plot categorized output.")
    setup_matplotlib()
    
    df_cleaned_full = pd.read_csv(CLEANED_VEG_FULL_PATH)
    df_trees_full = pd.read_csv(ECO_RESULTS_PATH)
    df_canopy_full = pd.read_csv(CANOPY_RESULTS_PATH)

    general_output_dir = os.path.join(IMAGE_DIR, '00_general_overview')
    os.makedirs(general_output_dir, exist_ok=True)
    plot_nested_sampling_design(os.path.join(general_output_dir, 'figure_1_nested_sampling_plot_design.png'))
    
    if 'Plot' not in df_cleaned_full.columns:
        logging.error("'Plot' column not found. Cannot generate per-plot vegetation plots.")
    else:
        df_cleaned_full['Plot'] = df_cleaned_full['Plot'].astype(str)
        df_trees_full['Plot'] = df_trees_full['Plot'].astype(str)
        df_canopy_full['plot_id'] = df_canopy_full['plot_id'].astype(str)

        plot_numbers = df_cleaned_full['Plot'].unique()
        for plot_no in sorted(plot_numbers):
            logging.info(f"--- Generating vegetation plots for Plot No. {plot_no} ---")
            
            plot_output_dir = os.path.join(IMAGE_DIR, plot_no)
            general_dir = os.path.join(plot_output_dir, '01_general')
            carbon_dir = os.path.join(plot_output_dir, '02_carbon_analysis')
            os.makedirs(general_dir, exist_ok=True)
            os.makedirs(carbon_dir, exist_ok=True)

            df_cleaned = df_cleaned_full[df_cleaned_full['Plot'] == plot_no]
            df_trees_with_eco = df_trees_full[df_trees_full['Plot'] == plot_no]

            plot_plant_composition(df_cleaned, os.path.join(general_dir, 'figure_2_plant_composition_by_quadrant.png'), plot_no)
            plot_schematic_plant_distribution(df_cleaned, df_trees_with_eco, os.path.join(general_dir, 'figure_3_schematic_plant_distribution.png'), plot_no)
            plot_species_distribution(df_cleaned, os.path.join(general_dir, 'figure_4_distribution_of_identified_plant_species.png'), plot_no)
            
            plot_co2_sequestered(df_trees_with_eco,
                                 os.path.join(carbon_dir, 'figure_5_co2_sequestered_by_quadrant_m1.png'),
                                 os.path.join(carbon_dir, 'figure_7_co2_sequestered_by_quadrant_m2.png'),
                                 plot_no)
            
            plot_tree_contribution(df_trees_with_eco,
                                   os.path.join(carbon_dir, 'figure_6_tree_contribution_to_carbon_stock_m1.png'),
                                   os.path.join(carbon_dir, 'figure_8_tree_contribution_to_carbon_stock_m2.png'),
                                   plot_no)

            plot_comparison_figures(df_trees_with_eco,
                                    os.path.join(carbon_dir, 'figure_9_comparison_of_co2_sequestered_by_quadrant.png'),
                                    os.path.join(carbon_dir, 'figure_10_comparison_of_biomass_estimates_vs_tree_diameter.png'),
                                    plot_no)

    if 'plot_id' not in df_canopy_full.columns:
        logging.error("'plot_id' column not found. Cannot generate per-plot canopy plots.")
    else:
        canopy_plot_ids = df_canopy_full['plot_id'].unique()
        for plot_id in canopy_plot_ids:
            logging.info(f"--- Generating canopy plots for {plot_id} ---")
            
            plot_output_dir = os.path.join(IMAGE_DIR, plot_id)
            canopy_dir = os.path.join(plot_output_dir, '03_canopy_analysis')
            os.makedirs(canopy_dir, exist_ok=True)

            df_canopy = df_canopy_full[df_canopy_full['plot_id'] == plot_id]
            
            plot_canopy_analysis(df_canopy,
                                 os.path.join(canopy_dir, 'figure_11_summary_of_canopy_cover.png'),
                                 os.path.join(canopy_dir, 'figure_12_summary_of_estimated_lai.png'),
                                 plot_id)

    logging.info("All plots generated in per-plot categorized folders.")
