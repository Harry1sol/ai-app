"""Topic tagging module using keyword matching and optional ML/LLM assistance."""
import re
from typing import List, Dict, Optional
import json
import logging

logger = logging.getLogger(__name__)


class TopicTagger:
    """Tag questions with topics based on content analysis."""

    def __init__(self, curriculum_file: Optional[str] = None):
        """
        Initialize topic tagger.

        Args:
            curriculum_file: Path to JSON file with curriculum topics/keywords
        """
        self.curriculum = self._load_curriculum(curriculum_file)

    def _load_curriculum(self, curriculum_file: Optional[str]) -> Dict:
        """Load curriculum taxonomy from file."""
        if curriculum_file:
            try:
                with open(curriculum_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Could not load curriculum file: {e}")

        # Default curriculum structure (example for JEE Physics)
        return {
            "JEE_MAIN": {
                "Physics": {
                    "Thermodynamics": {
                        "keywords": [
                            "heat", "temperature", "entropy", "enthalpy",
                            "first law", "second law", "carnot", "efficiency",
                            "isothermal", "adiabatic", "isobaric", "isochoric"
                        ],
                        "topics": [
                            "First Law of Thermodynamics",
                            "Second Law of Thermodynamics",
                            "Heat Engines",
                            "Carnot Cycle",
                            "Entropy"
                        ]
                    },
                    "Mechanics": {
                        "keywords": [
                            "force", "motion", "velocity", "acceleration",
                            "newton", "momentum", "energy", "work", "power",
                            "friction", "kinematics", "dynamics"
                        ],
                        "topics": [
                            "Laws of Motion",
                            "Work, Energy, and Power",
                            "Rotational Motion",
                            "Gravitation"
                        ]
                    },
                    "Electromagnetism": {
                        "keywords": [
                            "electric", "magnetic", "field", "charge", "current",
                            "resistance", "capacitor", "inductor", "voltage",
                            "coulomb", "faraday", "ampere", "gauss"
                        ],
                        "topics": [
                            "Electrostatics",
                            "Current Electricity",
                            "Magnetic Effects",
                            "Electromagnetic Induction"
                        ]
                    }
                }
            },
            "CBSE": {
                "Physics": {
                    "Optics": {
                        "keywords": [
                            "light", "reflection", "refraction", "lens",
                            "mirror", "prism", "spectrum", "diffraction",
                            "interference", "polarization"
                        ],
                        "topics": [
                            "Ray Optics",
                            "Wave Optics",
                            "Optical Instruments"
                        ]
                    }
                }
            }
        }

    def tag_question(
        self,
        question_text: str,
        exam: str = "JEE_MAIN",
        subject: str = "Physics"
    ) -> Dict[str, any]:
        """
        Tag a question with relevant topics.

        Args:
            question_text: The question text
            exam: Exam name
            subject: Subject name

        Returns:
            Dictionary with chapter, topics, and confidence scores
        """
        question_lower = question_text.lower()

        # Get curriculum for this exam/subject
        exam_curriculum = self.curriculum.get(exam, {})
        subject_curriculum = exam_curriculum.get(subject, {})

        chapter_scores = {}

        # Score each chapter based on keyword matching
        for chapter_name, chapter_data in subject_curriculum.items():
            keywords = chapter_data.get("keywords", [])
            score = 0

            for keyword in keywords:
                # Count occurrences of keyword
                count = len(re.findall(r'\b' + re.escape(keyword.lower()) + r'\b', question_lower))
                score += count

            if score > 0:
                chapter_scores[chapter_name] = score

        # Determine most likely chapter
        if chapter_scores:
            best_chapter = max(chapter_scores, key=chapter_scores.get)
            confidence = min(chapter_scores[best_chapter] / 5.0, 1.0)  # Normalize

            # Get topics for this chapter
            topics = subject_curriculum[best_chapter].get("topics", [])

            # Filter topics by relevance
            relevant_topics = self._filter_relevant_topics(
                question_lower,
                topics,
                subject_curriculum[best_chapter].get("keywords", [])
            )

            return {
                "chapter": best_chapter,
                "topics": relevant_topics[:3],  # Top 3 topics
                "confidence": round(confidence, 2),
                "all_chapter_scores": chapter_scores
            }
        else:
            return {
                "chapter": "Unknown",
                "topics": [],
                "confidence": 0.0,
                "all_chapter_scores": {}
            }

    def _filter_relevant_topics(
        self,
        question_lower: str,
        topics: List[str],
        keywords: List[str]
    ) -> List[str]:
        """Filter topics by relevance to the question."""
        relevant = []

        for topic in topics:
            # Simple heuristic: topic is relevant if it contains keywords from the question
            topic_lower = topic.lower()
            for keyword in keywords:
                if keyword.lower() in question_lower and keyword.lower() in topic_lower:
                    relevant.append(topic)
                    break

        # If no specific topics match, return all topics
        return relevant if relevant else topics

    def batch_tag(
        self,
        questions: List[Dict],
        exam: str,
        subject: str
    ) -> List[Dict]:
        """
        Tag multiple questions in batch.

        Args:
            questions: List of question dictionaries
            exam: Exam name
            subject: Subject name

        Returns:
            List of questions with topic tags added
        """
        for question in questions:
            tagging = self.tag_question(
                question["question_text"],
                exam=exam,
                subject=subject
            )
            question["chapter"] = tagging["chapter"]
            question["topics"] = tagging["topics"]
            question["tagging_confidence"] = tagging["confidence"]

        return questions

    def add_curriculum_entry(
        self,
        exam: str,
        subject: str,
        chapter: str,
        keywords: List[str],
        topics: List[str]
    ):
        """
        Add a new curriculum entry.

        Args:
            exam: Exam name
            subject: Subject name
            chapter: Chapter name
            keywords: List of keywords
            topics: List of topics
        """
        if exam not in self.curriculum:
            self.curriculum[exam] = {}

        if subject not in self.curriculum[exam]:
            self.curriculum[exam][subject] = {}

        self.curriculum[exam][subject][chapter] = {
            "keywords": keywords,
            "topics": topics
        }

        logger.info(f"Added curriculum entry: {exam} -> {subject} -> {chapter}")


if __name__ == "__main__":
    # Test the tagger
    logging.basicConfig(level=logging.INFO)
    tagger = TopicTagger()

    sample_questions = [
        "Calculate the efficiency of a Carnot engine operating between 300K and 500K.",
        "A force of 10N acts on a mass of 2kg. Calculate the acceleration.",
        "Explain the phenomenon of total internal reflection in optical fibers."
    ]

    for q in sample_questions:
        result = tagger.tag_question(q, exam="JEE_MAIN", subject="Physics")
        print(f"\nQuestion: {q[:60]}...")
        print(f"Chapter: {result['chapter']} (Confidence: {result['confidence']})")
        print(f"Topics: {', '.join(result['topics'])}")
