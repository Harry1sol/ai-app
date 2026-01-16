"""SQLAlchemy ORM models."""
from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

Base = declarative_base()


# SQLAlchemy Models
class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    full_name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=func.now())


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(50))
    created_at = Column(DateTime, default=func.now())


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    weightage_marks = Column(Integer, default=0)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pdf_source = Column(String(500), nullable=False)
    year = Column(Integer, nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"))
    question_text = Column(Text, nullable=False)
    marks = Column(Integer, default=1)
    difficulty = Column(String(20))
    topics = Column(Text)  # JSON string
    question_metadata = Column(Text)  # JSON string (renamed from 'metadata' to avoid SQLAlchemy conflict)
    extracted_at = Column(DateTime, default=func.now())


class TopicFrequency(Base):
    __tablename__ = "topic_frequency"

    id = Column(Integer, primary_key=True, autoincrement=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"))
    topic = Column(String(255), nullable=False)
    year = Column(Integer, nullable=False)
    count = Column(Integer, default=0)
    total_marks = Column(Integer, default=0)
    updated_at = Column(DateTime, default=func.now())


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"))
    topic = Column(String(255), nullable=False)
    predicted_probability = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    reasoning = Column(Text)  # JSON string
    trend = Column(String(20))
    last_updated = Column(DateTime, default=func.now())


class SourceDocument(Base):
    __tablename__ = "source_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    year = Column(Integer, nullable=False)
    exam_name = Column(String(255), nullable=False)
    source_label = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    url = Column(String(500))
    created_at = Column(DateTime, default=func.now())


# Pydantic Models for API
class ExamResponse(BaseModel):
    id: int
    name: str
    full_name: str
    category: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class SubjectResponse(BaseModel):
    id: int
    exam_id: int
    name: str
    code: Optional[str] = None

    class Config:
        from_attributes = True


class ChapterResponse(BaseModel):
    id: int
    subject_id: int
    name: str
    weightage_marks: int
    order_index: int

    class Config:
        from_attributes = True


class YearData(BaseModel):
    year: int
    questionCount: int
    topics: List[str]


class TopicPrediction(BaseModel):
    topic: str
    probability: int  # 0-100
    logic: str
    trend: str  # 'up', 'down', 'stable'


class SourceDocumentResponse(BaseModel):
    year: int
    examName: str
    sourceLabel: str
    url: str

    class Config:
        from_attributes = True


class AnalysisRequest(BaseModel):
    exam: str
    level: Optional[str] = None
    subject: str
    chapter: str


class AnalysisResponse(BaseModel):
    yearWiseData: List[YearData]
    predictions: List[TopicPrediction]
    sourceDocuments: List[SourceDocumentResponse]
    totalQuestionsAnalyzed: int
    mostFrequentTopic: str
    confidenceScore: float = 0.0
    dataQuality: str = "unknown"
