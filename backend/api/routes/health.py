"""Health check endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import Exam

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check."""
    return {
        "status": "healthy",
        "service": "ExamTrend AI API",
        "version": "1.0.0"
    }


@router.get("/health/db")
async def database_health(db: Session = Depends(get_db)):
    """Database health check."""
    try:
        # Try to query the database
        exam_count = db.query(Exam).count()
        return {
            "status": "healthy",
            "database": "connected",
            "exams_count": exam_count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
