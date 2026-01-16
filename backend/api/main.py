"""FastAPI application main entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from backend.config.settings import settings
from backend.database.connection import init_db
from backend.api.routes import analysis, exams, health

# Configure logging
logging.basicConfig(
    level=settings.log_level,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="ExamTrend AI API",
    description="Real PYQ analysis and prediction engine",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(exams.router, prefix="/api", tags=["Exams"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    logger.info("Starting ExamTrend AI API...")
    init_db()
    logger.info("✅ API is ready!")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down ExamTrend AI API...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload
    )
