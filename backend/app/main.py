from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.endpoints import analysis, analysis_v2, project_management, analysis_endpoints
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
    allow_origins=["http://localhost:5173", "http://localhost:8000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis.router, prefix="/api/v1", tags=["V1 - Full Pipeline"])
app.include_router(analysis_v2.router, prefix="/api/v2", tags=["V2 - Granular Analysis"])
app.include_router(project_management.router, prefix="/api/v1", tags=["V1 - Project Management"])
app.include_router(analysis_endpoints.router, prefix="/api/v1", tags=["Analysis"])

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

from starlette.staticfiles import StaticFiles
from starlette.types import Scope, Receive, Send
import os

# Custom StaticFiles class to add CORS headers
class StaticFilesWithCORS(StaticFiles):
    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        async def send_with_cors(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"access-control-allow-origin", b"*"))
                message["headers"] = headers
            await send(message)
        await super().__call__(scope, receive, send_with_cors)

# Mount static files to serve images with CORS support
app.mount("/data", StaticFilesWithCORS(directory="data"), name="data")

logger.info("FastAPI application started.")
