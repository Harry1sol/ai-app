"""Question segmentation module to identify and extract individual questions from text."""
import re
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class QuestionSegmenter:
    """Segment extracted text into individual questions."""

    def __init__(self):
        """Initialize question segmenter with regex patterns."""
        # Common question patterns
        self.patterns = [
            # Pattern 1: Q1, Q2, Q.1, Q.2
            r'(?:^|\n)\s*[Qq]\.?\s*(\d+)\.?\s*',
            # Pattern 2: 1., 2., 3.
            r'(?:^|\n)\s*(\d+)\.\s+',
            # Pattern 3: Question 1, Question 2
            r'(?:^|\n)\s*[Qq]uestion\s+(\d+)\.?\s*',
            # Pattern 4: [1], [2], [3]
            r'(?:^|\n)\s*\[(\d+)\]\s*',
            # Pattern 5: (1), (2), (3)
            r'(?:^|\n)\s*\((\d+)\)\s*',
        ]

    def segment(self, text: str, exam_type: str = "general") -> List[Dict[str, any]]:
        """
        Segment text into individual questions.

        Args:
            text: Extracted text from PDF
            exam_type: Type of exam (for custom patterns)

        Returns:
            List of question dictionaries
        """
        questions = []

        # Try each pattern
        for pattern in self.patterns:
            matches = list(re.finditer(pattern, text))

            if len(matches) >= 2:  # Need at least 2 matches to segment
                logger.info(f"Using pattern: {pattern} (found {len(matches)} matches)")

                for i, match in enumerate(matches):
                    question_num = int(match.group(1))
                    start_pos = match.end()

                    # End position is the start of the next question
                    end_pos = matches[i + 1].start() if i < len(matches) - 1 else len(text)

                    question_text = text[start_pos:end_pos].strip()

                    # Basic validation - skip very short questions
                    if len(question_text) < 10:
                        continue

                    questions.append({
                        "question_number": question_num,
                        "question_text": question_text,
                        "has_sub_parts": self._detect_sub_parts(question_text),
                        "estimated_marks": self._estimate_marks(question_text),
                        "length": len(question_text)
                    })

                break  # Use first matching pattern

        if not questions:
            logger.warning("No questions found with standard patterns, using fallback")
            # Fallback: Split by paragraphs
            questions = self._fallback_segmentation(text)

        return questions

    def _detect_sub_parts(self, text: str) -> bool:
        """
        Detect if a question has sub-parts (a, b, c, etc.).

        Args:
            text: Question text

        Returns:
            True if sub-parts detected
        """
        sub_part_patterns = [
            r'\([a-e]\)',  # (a), (b), (c)
            r'[a-e]\)',    # a), b), c)
            r'\b[a-e]\.\s', # a. b. c.
        ]

        for pattern in sub_part_patterns:
            if len(re.findall(pattern, text)) >= 2:
                return True

        return False

    def _estimate_marks(self, text: str) -> Optional[int]:
        """
        Estimate marks for a question based on text clues.

        Args:
            text: Question text

        Returns:
            Estimated marks or None
        """
        # Look for marks indicators
        marks_patterns = [
            r'[\[\(](\d+)\s*marks?[\]\)]',  # [5 marks], (3 marks)
            r'(\d+)\s*marks?',               # 5 marks
            r'Marks?\s*:\s*(\d+)',           # Marks: 5
        ]

        for pattern in marks_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))

        # Heuristic based on length
        word_count = len(text.split())
        if word_count < 20:
            return 1
        elif word_count < 50:
            return 2
        elif word_count < 100:
            return 3
        else:
            return 5

    def _fallback_segmentation(self, text: str) -> List[Dict[str, any]]:
        """
        Fallback segmentation when no clear pattern is found.

        Args:
            text: Extracted text

        Returns:
            List of question dictionaries
        """
        # Split by double newlines (paragraphs)
        paragraphs = re.split(r'\n\s*\n', text)

        questions = []
        for i, para in enumerate(paragraphs):
            para = para.strip()
            if len(para) >= 20:  # Minimum length filter
                questions.append({
                    "question_number": i + 1,
                    "question_text": para,
                    "has_sub_parts": self._detect_sub_parts(para),
                    "estimated_marks": self._estimate_marks(para),
                    "length": len(para)
                })

        return questions

    def clean_question_text(self, text: str) -> str:
        """
        Clean and normalize question text.

        Args:
            text: Raw question text

        Returns:
            Cleaned text
        """
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)

        # Remove page numbers (common pattern)
        text = re.sub(r'Page\s+\d+\s+of\s+\d+', '', text, flags=re.IGNORECASE)

        # Remove headers/footers (common patterns)
        text = re.sub(r'(?:^|\n)www\.\S+', '', text)

        return text.strip()


if __name__ == "__main__":
    # Test the segmenter
    logging.basicConfig(level=logging.INFO)
    segmenter = QuestionSegmenter()

    sample_text = """
    Q1. What is the capital of India?
    Delhi is the capital of India.

    Q2. Explain the first law of thermodynamics.
    The first law states that energy cannot be created or destroyed.

    Q3. Write a short note on photosynthesis. [5 marks]
    Photosynthesis is the process by which plants make food.
    """

    questions = segmenter.segment(sample_text)
    for q in questions:
        print(f"Q{q['question_number']}: {q['question_text'][:50]}... (Marks: {q['estimated_marks']})")
