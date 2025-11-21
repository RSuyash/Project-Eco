from pydantic import BaseModel
from typing import List, Optional

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
    Count_or_Cover: float # Renamed from 'Count_or_Cover%' to be a valid Python identifier
    Avg_Height_cm: float
    Notes: str

class FieldDataImportRequest(BaseModel):
    woody_data: List[WoodyVegetationData]
    herb_data: List[HerbFloorVegetationData]

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

class DataSource(BaseModel):
    id: str
    name: str
    type: str

class Tool(BaseModel):
    id: str
    name: str
    category: str
