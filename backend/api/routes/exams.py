"""Exam, subject, and chapter endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database.connection import get_db
from backend.database.models import (
    Exam, Subject, Chapter,
    ExamResponse, SubjectResponse, ChapterResponse
)

router = APIRouter()


@router.get("/exams", response_model=List[ExamResponse])
async def get_exams(db: Session = Depends(get_db)):
    """Get all available exams."""
    exams = db.query(Exam).all()
    return exams


@router.get("/exams/{exam_id}/subjects", response_model=List[SubjectResponse])
async def get_subjects(exam_id: int, db: Session = Depends(get_db)):
    """Get all subjects for a specific exam."""
    # Verify exam exists
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    subjects = db.query(Subject).filter(Subject.exam_id == exam_id).all()
    return subjects


@router.get("/subjects/{subject_id}/chapters", response_model=List[ChapterResponse])
async def get_chapters(subject_id: int, db: Session = Depends(get_db)):
    """Get all chapters for a specific subject."""
    # Verify subject exists
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    chapters = db.query(Chapter).filter(
        Chapter.subject_id == subject_id
    ).order_by(Chapter.order_index).all()
    return chapters


@router.get("/exams/search/{exam_name}")
async def search_exam_by_name(exam_name: str, db: Session = Depends(get_db)):
    """Search for an exam by name (case-insensitive)."""
    exam = db.query(Exam).filter(
        Exam.name.ilike(f"%{exam_name}%")
    ).first()

    if not exam:
        raise HTTPException(status_code=404, detail=f"Exam '{exam_name}' not found")

    return ExamResponse.from_orm(exam)
