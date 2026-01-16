"""Master pipeline to process PYQ data end-to-end."""
import os
import sys
import logging
from pathlib import Path
from typing import Dict, List
import json
from datetime import datetime

from backend.pipeline.pdf_extractor import PDFExtractor
from backend.pipeline.question_segmenter import QuestionSegmenter
from backend.pipeline.topic_tagger import TopicTagger
from backend.database.connection import get_db_context
from backend.database.models import (
    Exam, Subject, Chapter, Question, SourceDocument
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class MasterPipeline:
    """Main pipeline to process PYQ PDFs into structured database."""

    def __init__(self, pyq_data_path: str):
        """
        Initialize master pipeline.

        Args:
            pyq_data_path: Path to pyq_collector/data/ directory
        """
        self.pyq_data_path = pyq_data_path
        self.pdf_extractor = PDFExtractor(use_ocr=True)
        self.question_segmenter = QuestionSegmenter()
        self.topic_tagger = TopicTagger()

    def process_exam(
        self,
        exam_name: str,
        subject_name: str = None,
        limit: int = None
    ) -> Dict[str, any]:
        """
        Process all PDFs for a given exam.

        Args:
            exam_name: Name of exam (UPSC, CBSE, JEE_MAIN)
            subject_name: Optional filter for specific subject
            limit: Limit number of PDFs to process (for testing)

        Returns:
            Processing statistics
        """
        logger.info(f"Starting pipeline for {exam_name}")

        exam_path = os.path.join(self.pyq_data_path, exam_name)

        if not os.path.exists(exam_path):
            logger.error(f"Exam path not found: {exam_path}")
            return {"error": "Exam path not found"}

        # Get all PDF files
        pdf_files = self._find_pdfs(exam_path, subject_name)

        if limit:
            pdf_files = pdf_files[:limit]

        logger.info(f"Found {len(pdf_files)} PDFs to process")

        stats = {
            "total_pdfs": len(pdf_files),
            "processed": 0,
            "failed": 0,
            "total_questions": 0,
            "by_subject": {}
        }

        with get_db_context() as db:
            # Get or create exam
            exam = db.query(Exam).filter(Exam.name == exam_name).first()
            if not exam:
                logger.error(f"Exam {exam_name} not found in database")
                return {"error": "Exam not found in database"}

            for pdf_file in pdf_files:
                try:
                    result = self._process_single_pdf(
                        pdf_file,
                        exam_name,
                        exam.id,
                        db
                    )

                    if result["success"]:
                        stats["processed"] += 1
                        stats["total_questions"] += result["question_count"]

                        subject = result.get("subject", "Unknown")
                        if subject not in stats["by_subject"]:
                            stats["by_subject"][subject] = 0
                        stats["by_subject"][subject] += result["question_count"]
                    else:
                        stats["failed"] += 1
                        logger.error(f"Failed to process {pdf_file}: {result.get('error')}")

                except Exception as e:
                    stats["failed"] += 1
                    logger.error(f"Error processing {pdf_file}: {e}")

            db.commit()

        logger.info(f"Pipeline complete. Processed: {stats['processed']}, Failed: {stats['failed']}")
        return stats

    def _find_pdfs(self, base_path: str, subject_filter: str = None) -> List[str]:
        """Find all PDF files in directory tree."""
        pdf_files = []

        for root, dirs, files in os.walk(base_path):
            for file in files:
                if file.lower().endswith('.pdf'):
                    # Optional subject filter
                    if subject_filter and subject_filter.lower() not in root.lower():
                        continue

                    full_path = os.path.join(root, file)
                    pdf_files.append(full_path)

        return sorted(pdf_files)

    def _process_single_pdf(
        self,
        pdf_path: str,
        exam_name: str,
        exam_id: int,
        db
    ) -> Dict[str, any]:
        """Process a single PDF file."""
        logger.info(f"Processing: {pdf_path}")

        # Extract metadata from file path
        path_parts = Path(pdf_path).parts
        metadata = self._parse_file_path(pdf_path, exam_name)

        year = metadata.get("year")
        subject_name = metadata.get("subject", "General")

        # Step 1: Extract text
        extraction = self.pdf_extractor.extract_text(pdf_path)

        if not extraction["success"]:
            return {
                "success": False,
                "error": extraction["error"]
            }

        # Step 2: Segment questions
        questions = self.question_segmenter.segment(
            extraction["total_text"],
            exam_type=exam_name
        )

        logger.info(f"Extracted {len(questions)} questions")

        # Step 3: Tag topics
        questions = self.topic_tagger.batch_tag(
            questions,
            exam=exam_name,
            subject=subject_name
        )

        # Step 4: Save to database
        self._save_to_database(
            db,
            exam_id,
            subject_name,
            questions,
            pdf_path,
            year,
            metadata
        )

        return {
            "success": True,
            "question_count": len(questions),
            "subject": subject_name,
            "year": year
        }

    def _parse_file_path(self, pdf_path: str, exam_name: str) -> Dict[str, any]:
        """Extract metadata from file path."""
        # Example path: data/JEE/Main/2024/Jan/Shift1/Physics.pdf
        path = Path(pdf_path)
        parts = path.parts

        metadata = {
            "filename": path.name,
            "subject": None,
            "year": None,
            "session": None,
            "shift": None
        }

        # Try to extract year (4-digit number)
        for part in parts:
            if part.isdigit() and len(part) == 4:
                metadata["year"] = int(part)
                break

        # Extract subject from filename
        filename_base = path.stem
        metadata["subject"] = filename_base

        # Extract session (Jan, Apr, etc.)
        for part in parts:
            if part in ["Jan", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]:
                metadata["session"] = part

        # Extract shift
        for part in parts:
            if "shift" in part.lower():
                metadata["shift"] = part

        return metadata

    def _save_to_database(
        self,
        db,
        exam_id: int,
        subject_name: str,
        questions: List[Dict],
        pdf_path: str,
        year: int,
        metadata: Dict
    ):
        """Save questions to database."""
        # Get or create subject
        subject = db.query(Subject).filter(
            Subject.exam_id == exam_id,
            Subject.name == subject_name
        ).first()

        if not subject:
            subject = Subject(
                exam_id=exam_id,
                name=subject_name,
                code=subject_name[:10].upper()
            )
            db.add(subject)
            db.flush()

        # Save questions
        for q in questions:
            # Get or create chapter
            chapter_name = q.get("chapter", "Unknown")
            chapter = db.query(Chapter).filter(
                Chapter.subject_id == subject.id,
                Chapter.name == chapter_name
            ).first()

            if not chapter:
                chapter = Chapter(
                    subject_id=subject.id,
                    name=chapter_name
                )
                db.add(chapter)
                db.flush()

            # Create question record
            question = Question(
                pdf_source=pdf_path,
                year=year or 2020,  # Default year if not found
                exam_id=exam_id,
                subject_id=subject.id,
                chapter_id=chapter.id,
                question_text=q["question_text"][:1000],  # Limit length
                marks=q.get("estimated_marks", 1),
                topics=json.dumps(q.get("topics", [])),
                metadata=json.dumps(metadata)
            )
            db.add(question)


def main():
    """Main entry point for pipeline."""
    import argparse

    parser = argparse.ArgumentParser(description="Process PYQ PDFs")
    parser.add_argument("--exam", required=True, help="Exam name (UPSC, CBSE, JEE_MAIN)")
    parser.add_argument("--subject", help="Filter by subject")
    parser.add_argument("--limit", type=int, help="Limit number of PDFs")
    parser.add_argument("--data-path", default="../../pyq_collector/data", help="Path to PYQ data")

    args = parser.parse_args()

    pipeline = MasterPipeline(args.data_path)
    stats = pipeline.process_exam(
        exam_name=args.exam,
        subject_name=args.subject,
        limit=args.limit
    )

    print("\n" + "="*50)
    print("PIPELINE COMPLETE")
    print("="*50)
    print(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main()
