"""Analysis endpoints - main API for PYQ analysis."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
import json

from backend.database.connection import get_db
from backend.database.models import (
    Exam, Subject, Chapter, Question, TopicFrequency, Prediction, SourceDocument,
    AnalysisRequest, AnalysisResponse, YearData, TopicPrediction, SourceDocumentResponse
)

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_pyq(request: AnalysisRequest, db: Session = Depends(get_db)):
    """
    Main analysis endpoint.
    Returns PYQ trends, predictions, and statistics for a given exam/subject/chapter.
    """
    # Find exam
    exam = db.query(Exam).filter(
        Exam.name.ilike(f"%{request.exam}%")
    ).first()

    if not exam:
        raise HTTPException(status_code=404, detail=f"Exam '{request.exam}' not found")

    # Find subject
    subject = db.query(Subject).filter(
        Subject.exam_id == exam.id,
        Subject.name.ilike(f"%{request.subject}%")
    ).first()

    if not subject:
        raise HTTPException(
            status_code=404,
            detail=f"Subject '{request.subject}' not found for exam '{exam.name}'"
        )

    # Find chapter
    chapter = db.query(Chapter).filter(
        Chapter.subject_id == subject.id,
        Chapter.name.ilike(f"%{request.chapter}%")
    ).first()

    if not chapter:
        raise HTTPException(
            status_code=404,
            detail=f"Chapter '{request.chapter}' not found for subject '{subject.name}'"
        )

    # Get year-wise data
    year_wise_query = db.query(
        Question.year,
        func.count(Question.id).label("count"),
        func.group_concat(Question.topics).label("topics_json")
    ).filter(
        Question.exam_id == exam.id,
        Question.subject_id == subject.id,
        Question.chapter_id == chapter.id
    ).group_by(Question.year).order_by(Question.year).all()

    year_wise_data = []
    for row in year_wise_query:
        # Parse topics from all questions in that year
        topics_set = set()
        if row.topics_json:
            for topics_str in row.topics_json.split(","):
                try:
                    topics_list = json.loads(topics_str) if topics_str else []
                    topics_set.update(topics_list)
                except json.JSONDecodeError:
                    pass

        year_wise_data.append(YearData(
            year=row.year,
            questionCount=row.count,
            topics=list(topics_set)[:5]  # Limit to top 5 topics
        ))

    # Get predictions
    predictions_query = db.query(Prediction).filter(
        Prediction.exam_id == exam.id,
        Prediction.subject_id == subject.id,
        Prediction.chapter_id == chapter.id
    ).order_by(Prediction.predicted_probability.desc()).limit(5).all()

    predictions = []
    for pred in predictions_query:
        predictions.append(TopicPrediction(
            topic=pred.topic,
            probability=int(pred.predicted_probability * 100),
            logic=json.loads(pred.reasoning) if pred.reasoning else "Based on historical frequency",
            trend=pred.trend or "stable"
        ))

    # Get source documents
    sources_query = db.query(SourceDocument).filter(
        SourceDocument.exam_id == exam.id
    ).order_by(SourceDocument.year.desc()).limit(10).all()

    source_documents = []
    for source in sources_query:
        source_documents.append(SourceDocumentResponse(
            year=source.year,
            examName=source.exam_name,
            sourceLabel=source.source_label,
            url=source.url or source.file_path
        ))

    # Get total questions analyzed
    total_questions = db.query(func.count(Question.id)).filter(
        Question.exam_id == exam.id,
        Question.subject_id == subject.id,
        Question.chapter_id == chapter.id
    ).scalar() or 0

    # Get most frequent topic
    most_frequent_topic_query = db.query(
        TopicFrequency.topic,
        func.sum(TopicFrequency.count).label("total")
    ).filter(
        TopicFrequency.exam_id == exam.id,
        TopicFrequency.subject_id == subject.id,
        TopicFrequency.chapter_id == chapter.id
    ).group_by(TopicFrequency.topic).order_by(func.sum(TopicFrequency.count).desc()).first()

    most_frequent_topic = most_frequent_topic_query[0] if most_frequent_topic_query else "Unknown"

    # Calculate data quality
    years_covered = len(year_wise_data)
    data_quality = "high" if years_covered >= 5 else "medium" if years_covered >= 3 else "low"
    confidence_score = min(years_covered / 7.0, 1.0)  # Normalize to 0-1

    return AnalysisResponse(
        yearWiseData=year_wise_data,
        predictions=predictions,
        sourceDocuments=source_documents,
        totalQuestionsAnalyzed=total_questions,
        mostFrequentTopic=most_frequent_topic,
        confidenceScore=round(confidence_score, 2),
        dataQuality=data_quality
    )


@router.get("/stats/{exam_name}")
async def get_exam_stats(exam_name: str, db: Session = Depends(get_db)):
    """Get overall statistics for an exam."""
    exam = db.query(Exam).filter(Exam.name.ilike(f"%{exam_name}%")).first()

    if not exam:
        raise HTTPException(status_code=404, detail=f"Exam '{exam_name}' not found")

    total_questions = db.query(func.count(Question.id)).filter(
        Question.exam_id == exam.id
    ).scalar()

    total_subjects = db.query(func.count(Subject.id)).filter(
        Subject.exam_id == exam.id
    ).scalar()

    years_covered = db.query(func.count(func.distinct(Question.year))).filter(
        Question.exam_id == exam.id
    ).scalar()

    return {
        "exam": exam.full_name,
        "total_questions": total_questions,
        "total_subjects": total_subjects,
        "years_covered": years_covered,
        "data_quality": "high" if years_covered >= 5 else "medium" if years_covered >= 3 else "low"
    }
