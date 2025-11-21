from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import analysis, analysis_v2, project_management
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Vegetation Analysis API",
    description="A comprehensive API for running a vegetation analysis pipeline.",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to the frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis.router, prefix="/api/v1", tags=["V1 - Full Pipeline"])
app.include_router(analysis_v2.router, prefix="/api/v2", tags=["V2 - Granular Analysis"])
app.include_router(project_management.router, prefix="/api/v1", tags=["V1 - Project Management"])

@app.get("/", tags=["Root"])
async def read_root():
    """
    Root endpoint providing basic API information.
    """
    return {
        "message": "Welcome to the Vegetation Analysis API",
        "version": app.version,
        "docs_url": "/docs",
    }

logger.info("FastAPI application started.")
