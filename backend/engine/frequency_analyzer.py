"""Frequency analysis module for PYQ data."""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
import json
import logging

from backend.database.models import Question, TopicFrequency

logger = logging.getLogger(__name__)


class FrequencyAnalyzer:
    """Analyze question frequency patterns."""

    def __init__(self, db: Session):
        """
        Initialize analyzer.

        Args:
            db: Database session
        """
        self.db = db

    def analyze_and_store(
        self,
        exam_id: int,
        subject_id: int,
        chapter_id: int = None
    ) -> Dict[str, any]:
        """
        Analyze question frequency and store in topic_frequency table.

        Args:
            exam_id: Exam ID
            subject_id: Subject ID
            chapter_id: Optional chapter ID

        Returns:
            Analysis statistics
        """
        logger.info(f"Analyzing frequency for exam={exam_id}, subject={subject_id}, chapter={chapter_id}")

        # Query all questions
        query = self.db.query(Question).filter(
            Question.exam_id == exam_id,
            Question.subject_id == subject_id
        )

        if chapter_id:
            query = query.filter(Question.chapter_id == chapter_id)

        questions = query.all()

        logger.info(f"Found {len(questions)} questions to analyze")

        # Build frequency map: {(topic, year): count}
        frequency_map = {}

        for question in questions:
            year = question.year
            topics_json = question.topics

            if not topics_json:
                continue

            try:
                topics = json.loads(topics_json)
            except json.JSONDecodeError:
                logger.warning(f"Could not parse topics for question {question.id}")
                continue

            for topic in topics:
                key = (topic, year)
                if key not in frequency_map:
                    frequency_map[key] = 0
                frequency_map[key] += 1

        # Store in database
        stored_count = 0
        for (topic, year), count in frequency_map.items():
            # Check if entry exists
            existing = self.db.query(TopicFrequency).filter(
                TopicFrequency.exam_id == exam_id,
                TopicFrequency.subject_id == subject_id,
                TopicFrequency.chapter_id == chapter_id,
                TopicFrequency.topic == topic,
                TopicFrequency.year == year
            ).first()

            if existing:
                existing.count = count
                existing.total_marks = count  # Simplified: 1 mark per question
            else:
                new_freq = TopicFrequency(
                    exam_id=exam_id,
                    subject_id=subject_id,
                    chapter_id=chapter_id,
                    topic=topic,
                    year=year,
                    count=count,
                    total_marks=count
                )
                self.db.add(new_freq)

            stored_count += 1

        self.db.commit()

        logger.info(f"Stored {stored_count} frequency records")

        return {
            "questions_analyzed": len(questions),
            "unique_topics": len(set(k[0] for k in frequency_map.keys())),
            "records_stored": stored_count
        }

    def get_top_topics(
        self,
        exam_id: int,
        subject_id: int,
        chapter_id: int = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        Get top topics by frequency.

        Args:
            exam_id: Exam ID
            subject_id: Subject ID
            chapter_id: Optional chapter ID
            limit: Number of topics to return

        Returns:
            List of top topics with counts
        """
        query = self.db.query(
            TopicFrequency.topic,
            func.sum(TopicFrequency.count).label("total_count")
        ).filter(
            TopicFrequency.exam_id == exam_id,
            TopicFrequency.subject_id == subject_id
        )

        if chapter_id:
            query = query.filter(TopicFrequency.chapter_id == chapter_id)

        results = query.group_by(
            TopicFrequency.topic
        ).order_by(
            func.sum(TopicFrequency.count).desc()
        ).limit(limit).all()

        return [
            {"topic": row.topic, "count": row.total_count}
            for row in results
        ]
