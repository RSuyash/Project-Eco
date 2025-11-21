import matplotlib.pyplot as plt
import seaborn as sns
import matplotlib.patches as patches
import numpy as np
import pandas as pd
import logging
import os

logger = logging.getLogger(__name__)

def setup_matplotlib():
    """Sets up consistent styling for all plots."""
    plt.style.use('seaborn-v0_8-whitegrid')
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['figure.dpi'] = 120
    plt.rcParams['axes.titleweight'] = 'bold'
    plt.rcParams['axes.labelweight'] = 'bold'

def generate_figure_1_nested_sampling_design(output_path: str):
    """Generates Figure 1: Nested Sampling Plot Design."""
    setup_matplotlib()
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

def generate_figure_2_plant_composition(data: pd.DataFrame, output_path: str, plot_id: str):
    """Generates Figure 2: Plant Composition by Quadrant."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(10, 7))
    data.plot(kind='bar', stacked=True, ax=ax, width=0.7)
    fig.suptitle(f'Figure 2: Plant Composition by Quadrant (Plot {plot_id})', fontsize=18)
    ax.set_title("Shows the total count and type of plants recorded in each quadrant.", fontsize=12, pad=10)
    ax.set_xlabel('Quadrant', fontsize=12); ax.set_ylabel('Total Number of Individuals', fontsize=12)
    ax.tick_params(axis='x', rotation=0, labelsize=11)
    ax.legend(title='Plant Type', bbox_to_anchor=(1.01, 1), loc='upper left', fontsize=11, title_fontsize=12)
    fig.tight_layout(rect=[0, 0, 0.88, 0.96]); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def generate_figure_3_schematic_distribution(data: pd.DataFrame, output_path: str, plot_id: str):
    """Generates Figure 3: Schematic Plant Distribution."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(10, 10))
    ax.set_aspect('equal', adjustable='box'); ax.set_xlim(-1, 11); ax.set_ylim(-1, 11)
    ax.set_xticks(np.arange(0, 11, 1)); ax.set_yticks(np.arange(0, 11, 1))
    fig.suptitle(f"Figure 3: Schematic Plant Distribution (Plot {plot_id})", fontsize=18)
    ax.set_title("Structured locations of plants. Circle size is scaled by tree diameter or count.", fontsize=12, pad=10)
    ax.set_xlabel("West-East Direction (meters)", fontsize=12); ax.set_ylabel("South-North Direction (meters)", fontsize=12)
    quadrant_coords = {"Q1": (0, 5), "Q2": (0, 0), "Q3": (5, 0), "Q4": (5, 5)}
    plot_centers = {"Q1": (2.5, 7.5), "Q2": (2.5, 2.5), "Q3": (7.5, 2.5), "Q4": (7.5, 7.5)}
    for name, (x, y) in quadrant_coords.items():
        ax.add_patch(patches.Rectangle((x, y), 5, 5, linewidth=1.5, edgecolor='lightgrey', facecolor='#f0fff0', alpha=0.5, zorder=1))
        ax.text(x + 2.5, y + 2.5, name, ha='center', va='center', fontsize=12, color='darkgrey', zorder=2)

    plant_colors = {'Tree': '#006400', 'Sapling': '#FF8C00', 'Shrub': '#8A2BE2', 'Herb': '#556B2F'}
    
    for quadrant_name, center_coords in plot_centers.items():
        quadrant_data = data[data['Quadrant'] == quadrant_name].reset_index(drop=True)
        num_items = len(quadrant_data)
        if num_items == 0: continue
        grid_size = int(np.ceil(np.sqrt(num_items)))
        x_points = np.linspace(center_coords[0] - 1.5, center_coords[0] + 1.5, grid_size) if grid_size > 1 else [center_coords[0]]
        y_points = np.linspace(center_coords[1] - 1.5, center_coords[1] + 1.5, grid_size) if grid_size > 1 else [center_coords[1]]
        positions = [(x, y) for y in y_points for x in x_points]

        for i, (index, row) in enumerate(quadrant_data.iterrows()):
            current_size = row['Effective_DBH_cm'] * 30 if row['Type'] == 'Tree' and pd.notna(row['Effective_DBH_cm']) else row['Number'] * 35
            if pd.isna(current_size) or current_size <= 0: continue
            if i >= len(positions): break
            plot_x, plot_y = positions[i]
            label = f"ID {row['ID']}: DBH {row['Effective_DBH_cm']:.1f}cm" if row['Type'] == 'Tree' and pd.notna(row['Effective_DBH_cm']) else f"ID {row['ID']}: {int(row['Number'])} {row['Type']}(s)"
            ax.scatter(plot_x, plot_y, s=current_size, c=plant_colors.get(row['Type'], 'black'), alpha=0.9, label=row['Type'], zorder=5, edgecolors='black', linewidth=0.5)
            text_y_offset = 0.7 if i % 2 == 0 else -0.7
            ax.text(plot_x, plot_y + text_y_offset, label, ha='center', va='center', fontsize=8, weight='semibold', zorder=6, bbox=dict(facecolor='white', alpha=0.85, edgecolor='none', boxstyle='round,pad=0.2'))

    legend_handles = [patches.Patch(color=color, label=label) for label, color in plant_colors.items()]
    ax.legend(handles=legend_handles, title='Plant Type', loc='center left', bbox_to_anchor=(1, 0.5), fancybox=True, fontsize=12, borderpad=1, labelspacing=1.2)
    fig.tight_layout(rect=[0, 0, 0.88, 0.95]); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def generate_figure_4_species_distribution(data: pd.DataFrame, output_path: str, plot_id: str):
    """Generates Figure 4: Distribution of Identified Woody Plant Species."""
    setup_matplotlib()
    fig_height = max(7, len(data) * 0.5)
    fig, ax = plt.subplots(figsize=(10, fig_height))
    sns.barplot(x='Number', y='Species', data=data, palette='viridis', ax=ax)
    fig.suptitle(f'Figure 4: Distribution of Identified Woody Plant Species (Plot {plot_id})', fontsize=18)
    ax.set_title("Shows the total abundance for each woody species identified in the field.", fontsize=12, pad=10)
    ax.set_xlabel('Total Number of Individuals', fontsize=12); ax.set_ylabel('Species', fontsize=12)
    fig.tight_layout(); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def generate_figure_5_co2_by_quadrant_m1(data: pd.DataFrame, output_path: str, plot_id: str):
    """Generates Figure 5: CO2 Sequestered by Quadrant (Method 1)."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(10, 7))
    bars = sns.barplot(x='Quadrant', y='CO2_Eq_M1_kg', data=data, palette='mako', ax=ax, order=['Q1','Q2','Q3','Q4'])
    fig.suptitle(f'Figure 5: CO₂ Sequestered by Quadrant (Method 1) (Plot {plot_id})', fontsize=18)
    ax.set_title("Estimates based on the Height-Inclusive allometric equation.", fontsize=12, pad=10)
    ax.set_xlabel('Quadrant', fontsize=12); ax.set_ylabel('Total CO₂ Equivalent (kg)', fontsize=12)
    for bar in bars.patches:
        ax.annotate(f'{bar.get_height():.0f} kg', (bar.get_x() + bar.get_width() / 2, bar.get_height()), ha='center', va='center', size=11, weight='bold', xytext=(0, 8), textcoords='offset points')
    ax.set_ylim(0, data['CO2_Eq_M1_kg'].max() * 1.2 if not data.empty else 10)
    fig.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def generate_figure_7_co2_by_quadrant_m2(data: pd.DataFrame, output_path: str, plot_id: str):
    """Generates Figure 7: CO2 Sequestered by Quadrant (Method 2)."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(10, 7))
    bars = sns.barplot(x='Quadrant', y='CO2_Eq_M2_kg', data=data, palette='viridis', ax=ax, order=['Q1','Q2','Q3','Q4'])
    fig.suptitle(f'Figure 7: CO₂ Sequestered by Quadrant (Method 2) (Plot {plot_id})', fontsize=18)
    ax.set_title("Estimates based on the robust Height-Exclusive (DBH-only) allometric equation.", fontsize=12, pad=10)
    ax.set_xlabel('Quadrant', fontsize=12); ax.set_ylabel('Total CO₂ Equivalent (kg)', fontsize=12)
    for bar in bars.patches:
        ax.annotate(f'{bar.get_height():.0f} kg', (bar.get_x() + bar.get_width() / 2, bar.get_height()), ha='center', va='center', size=11, weight='bold', xytext=(0, 8), textcoords='offset points')
    ax.set_ylim(0, data['CO2_Eq_M2_kg'].max() * 1.2 if not data.empty else 10)
    fig.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def generate_figure_6_tree_contribution_m1(data: pd.DataFrame, output_path: str, plot_id: str):
    """Generates Figure 6: Tree Contribution to Total Carbon Stock (Method 1)."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(10, 8))
    df_m1 = data.sort_values('Carbon_Stock_M1_kg', ascending=True)
    ax.barh(df_m1['Tree_Label'], df_m1['Carbon_Stock_M1_kg'], color='skyblue')
    ax.set_xlabel('Carbon Stock (kg)'); ax.set_ylabel('Tree')
    fig.suptitle(f'Figure 6: Tree Contribution to Total Carbon Stock (Method 1) (Plot {plot_id})', fontsize=18)
    ax.set_title("Shows the carbon stored by each tree using Method 1.", fontsize=12, pad=10)
    fig.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def generate_figure_8_tree_contribution_m2(data: pd.DataFrame, output_path: str, plot_id: str):
    """Generates Figure 8: Tree Contribution to Total Carbon Stock (Method 2)."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(10, 8))
    df_m2 = data.sort_values('Carbon_Stock_M2_kg', ascending=True)
    ax.barh(df_m2['Tree_Label'], df_m2['Carbon_Stock_M2_kg'], color='lightcoral')
    ax.set_xlabel('Carbon Stock (kg)'); ax.set_ylabel('Tree')
    fig.suptitle(f'Figure 8: Tree Contribution to Total Carbon Stock (Method 2) (Plot {plot_id})', fontsize=18)
    ax.set_title("Shows the carbon stored by each tree using Method 2.", fontsize=12, pad=10)
    fig.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def generate_figure_9_co2_comparison(data: pd.DataFrame, output_path: str, plot_id: str):
    """Generates Figure 9: Comparison of CO2 Sequestered by Quadrant."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(12, 8))
    sns.barplot(x='Quadrant', y='CO2_kg', hue='Method', data=data, palette='cividis', ax=ax, order=['Q1','Q2','Q3','Q4'])
    fig.suptitle(f'Figure 9: Comparison of CO₂ Sequestered by Quadrant (Plot {plot_id})', fontsize=18)
    ax.set_title("Shows the range of estimates between the two allometric equations for each quadrant.", fontsize=12, pad=10)
    ax.set_xlabel('Quadrant', fontsize=12); ax.set_ylabel('Total CO₂ Equivalent (kg)', fontsize=12)
    ax.legend(title='Calculation Method', fontsize=11, title_fontsize=12); fig.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def generate_figure_10_biomass_comparison(data: pd.DataFrame, output_path: str, plot_id: str):
    """Generates Figure 10: Comparison of Biomass Estimates vs. Tree Diameter."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(12, 8))
    sns.scatterplot(data=data, x='Effective_DBH_cm', y='AGB_M1_kg', s=200, ax=ax, label='Method 1 (Height-Inclusive)', zorder=10)
    sns.scatterplot(data=data, x='Effective_DBH_cm', y='AGB_M2_kg', s=250, ax=ax, marker='X', label='Method 2 (Height-Exclusive)', zorder=10)
    fig.suptitle(f'Figure 10: Comparison of Biomass Estimates vs. Tree Diameter (Plot {plot_id})', fontsize=18)
    ax.set_title("Each tree is represented by two points, showing the biomass estimate from each method.", fontsize=12, pad=10)
    ax.set_xlabel('Effective Stem Diameter (cm)', fontsize=12); ax.set_ylabel('Estimated Aboveground Biomass (kg)', fontsize=12)
    ax.legend(fontsize=11, title_fontsize=12); fig.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def generate_figure_11_canopy_cover_summary(data: pd.DataFrame, output_path: str, plot_id: str):
    """Generates Figure 11: Summary of Canopy Cover by Quadrant Location."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(10, 7))
    bars = sns.barplot(x='filename', y='canopy_cover_percent', data=data, palette='summer', ax=ax)
    fig.suptitle(f'Figure 11: Summary of Canopy Cover by Quadrant Location (Plot {plot_id})', fontsize=18)
    ax.set_title("Canopy cover calculated from hemispherical photographs.", fontsize=12, pad=10)
    ax.set_xlabel('Quadrant Location (Image Filename)', fontsize=12); ax.set_ylabel('Canopy Cover (%)', fontsize=12)
    ax.set_ylim(0, 100); plt.xticks(rotation=15, ha="right")
    for bar in bars.patches:
        ax.annotate(f'{bar.get_height():.1f}%', (bar.get_x() + bar.get_width() / 2, bar.get_height()), ha='center', va='center', size=11, weight='bold', xytext=(0, 8), textcoords='offset points')
    fig.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")

def generate_figure_12_lai_summary(data: pd.DataFrame, output_path: str, plot_id: str):
    """Generates Figure 12: Summary of Estimated LAI by Quadrant Location."""
    setup_matplotlib()
    fig, ax = plt.subplots(figsize=(10, 7))
    bars = sns.barplot(x='filename', y='estimated_lai', data=data, palette='autumn', ax=ax)
    fig.suptitle(f'Figure 12: Summary of Estimated LAI by Quadrant Location (Plot {plot_id})', fontsize=18)
    ax.set_title("Leaf Area Index (LAI) estimated from canopy gap fraction.", fontsize=12, pad=10)
    ax.set_xlabel('Quadrant Location (Image Filename)', fontsize=12); ax.set_ylabel('Estimated Leaf Area Index (LAI)', fontsize=12)
    plt.xticks(rotation=15, ha="right")
    for bar in bars.patches:
        ax.annotate(f'{bar.get_height():.2f}', (bar.get_x() + bar.get_width() / 2, bar.get_height()), ha='center', va='center', size=11, weight='bold', xytext=(0, 8), textcoords='offset points')
    ax.set_ylim(0, data['estimated_lai'].max() * 1.2 if not data.empty else 1)
    fig.tight_layout(rect=[0, 0, 1, 0.96]); plt.savefig(output_path)
    plt.close(fig)
    logging.info(f"Generated plot: {output_path}")
