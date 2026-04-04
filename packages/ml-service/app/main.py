"""FastAPI application for Sunbull AI ML Service."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.utils.logging import setup_logging, get_logger
from app.models.sizing_model import sizing_model
from app.routers import sizing, roi, proposal, scoring, lender

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown event handler."""
    # Startup
    logger.info("Starting Sunbull AI ML Service", version=settings.app_version)
    setup_logging()
    
    # Pre-load models on startup
    try:
        # Attempt to load sizing model
        if settings.use_model_cache:
            sizing_model._load_model()
            if sizing_model.is_trained:
                logger.info("Sizing model loaded successfully")
            else:
                logger.info("Using rule-based sizing fallback")
    except Exception as e:
        logger.warning("Failed to load models, will use fallback", error=str(e))
    
    yield
    
    # Shutdown
    logger.info("Shutting down Sunbull AI ML Service")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="ML/AI operations service for Sunbull solar sales platform",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_credentials,
    allow_methods=settings.cors_methods,
    allow_headers=settings.cors_headers,
)

# Mount routers
app.include_router(sizing.router)
app.include_router(roi.router)
app.include_router(proposal.router)
app.include_router(scoring.router)
app.include_router(lender.router)


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


@app.get("/")
async def root() -> dict:
    """Root endpoint."""
    return {
        "message": "Sunbull AI ML Service",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
