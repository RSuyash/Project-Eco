from pydantic import BaseModel
from typing import List, Optional, Literal

# --- Value Objects / Shared Models ---

class PipelineStatus(BaseModel):
    """
    Represents the status of a pipeline step or the entire pipeline.
    """
    step: str
    success: bool
    message: str
    error: Optional[str] = None

class FullPipelineResponse(BaseModel):
    """
    Response model for the full pipeline execution.
    """
    status: str
    details: List[PipelineStatus]

class WoodyVegetationData(BaseModel):
    Plot_ID: str
    Location_Name: str
    Quad_ID: str
    Species_Scientific: str
    Growth_Form: str
    Tree_ID: str
    Height_m: float
    Condition: str
    GBH_Stem1_cm: float
    GBH_Stem2_cm: float
    GBH_Stem3_cm: float
    GBH_Stem4_cm: float
    GBH_Stem5_cm: float
    GBH_Stem6_cm: float
    Remarks: str
    Total_GBH_cm: float

class HerbFloorVegetationData(BaseModel):
    Plot_ID: str
    Location_Name: str
    Subplot_ID: str
    Layer_Type: str
    Species_or_Category: str
    Count_or_Cover: float 
    Avg_Height_cm: float
    Notes: str

class FieldDataImportRequest(BaseModel):
    woody_data: List[WoodyVegetationData]
    herb_data: List[HerbFloorVegetationData]

# --- Plot Configuration Models ---

class PlotDimensions(BaseModel):
    width: float
    height: float
    unit: str = 'm'

class GridConfiguration(BaseModel):
    rows: int
    cols: int
    labeling: Literal['alphanumeric', 'sequential'] = 'sequential'

class SubplotDefinition(BaseModel):
    id: str
    type: Literal['quadrant', 'subplot_herb', 'subplot_shrub', 'custom']
    dimensions: PlotDimensions
    position_x: float
    position_y: float
    relative_to: Literal['plot_origin', 'grid_cell'] = 'plot_origin'
    required_data: List[str] = [] # e.g. ['species_count', 'photo']

class PlotConfiguration(BaseModel):
    type: Literal['standard', 'species_area_curve', 'custom'] = 'standard'
    dimensions: PlotDimensions
    grid: GridConfiguration
    subdivisions: List[SubplotDefinition] = []

# --- Domain Entities ---

class ProjectCreate(BaseModel):
    name: str
    description: str
    status: str = 'active'
    tools: List[str] = []
    dataSources: List[str] = []
    defaultPlotConfiguration: Optional[PlotConfiguration] = None

class Project(BaseModel):
    id: str
    name: str
    description: str
    createdAt: str
    updatedAt: str
    status: str # 'active' | 'completed' | 'archived'
    tools: List[str]
    dataSources: List[str]
    progress: Optional[float] = None
    totalDataPoints: Optional[int] = None
    lastSynced: Optional[str] = None
    defaultPlotConfiguration: Optional[PlotConfiguration] = None

class Plot(BaseModel):
    id: str
    projectId: str
    name: str
    configuration: PlotConfiguration
    location: Optional[dict] = None # { lat: float, lng: float }
    data: Optional[dict] = None # Flexible storage for now

class DataSource(BaseModel):
    id: str
    name: str
    type: str

class Tool(BaseModel):
    id: str
    name: str
    category: str
