"""Trend prediction and probability calculation engine."""
import numpy as np
from typing import List, Dict, Tuple
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class TrendPredictor:
    """Predict topic probabilities based on historical patterns."""

    def __init__(self):
        """Initialize trend predictor."""
        pass

    def calculate_probabilities(
        self,
        topic_frequencies: List[Dict],
        current_year: int = 2026
    ) -> List[Dict[str, any]]:
        """
        Calculate prediction probabilities for topics.

        Args:
            topic_frequencies: List of {topic, year, count} dictionaries
            current_year: Current year for prediction

        Returns:
            List of predictions with probabilities and reasoning
        """
        # Group by topic
        topic_data = defaultdict(list)

        for freq in topic_frequencies:
            topic = freq["topic"]
            year = freq["year"]
            count = freq["count"]

            topic_data[topic].append({"year": year, "count": count})

        predictions = []

        for topic, data in topic_data.items():
            prob_data = self._calculate_single_topic_probability(
                topic,
                data,
                current_year
            )
            predictions.append(prob_data)

        # Sort by probability descending
        predictions.sort(key=lambda x: x["probability"], reverse=True)

        return predictions

    def _calculate_single_topic_probability(
        self,
        topic: str,
        year_data: List[Dict],
        current_year: int
    ) -> Dict[str, any]:
        """
        Calculate probability for a single topic.

        Uses multiple factors:
        1. Historical frequency
        2. Recency (when last asked)
        3. Gap analysis (if not asked for N years, prob increases)
        4. Trend direction
        """
        if not year_data:
            return {
                "topic": topic,
                "probability": 0.0,
                "confidence": 0.0,
                "trend": "stable",
                "reasoning": "No historical data"
            }

        # Sort by year
        year_data = sorted(year_data, key=lambda x: x["year"])

        years = [d["year"] for d in year_data]
        counts = [d["count"] for d in year_data]

        # Factor 1: Overall frequency (normalized)
        total_count = sum(counts)
        years_covered = len(years)
        avg_frequency = total_count / years_covered if years_covered > 0 else 0

        frequency_score = min(avg_frequency / 5.0, 1.0)  # Normalize to 0-1

        # Factor 2: Recency score
        last_year = years[-1]
        years_since_last = current_year - last_year
        recency_score = max(0, 1.0 - (years_since_last / 5.0))  # Decay over 5 years

        # Factor 3: Gap analysis
        # If topic hasn't appeared for 2+ years, probability increases
        gap_score = 0.0
        if years_since_last >= 2:
            gap_score = min(years_since_last / 3.0, 0.5)  # Up to 0.5 bonus

        # Factor 4: Trend detection
        trend, trend_score = self._detect_trend(counts)

        # Combined probability (weighted average)
        weights = {
            "frequency": 0.35,
            "recency": 0.25,
            "gap": 0.20,
            "trend": 0.20
        }

        probability = (
            weights["frequency"] * frequency_score +
            weights["recency"] * recency_score +
            weights["gap"] * gap_score +
            weights["trend"] * trend_score
        )

        # Confidence based on data quality
        confidence = min(years_covered / 7.0, 1.0)  # More years = more confidence

        # Generate reasoning
        reasoning = self._generate_reasoning(
            topic,
            total_count,
            years_covered,
            last_year,
            years_since_last,
            trend,
            avg_frequency
        )

        return {
            "topic": topic,
            "probability": round(probability, 2),
            "confidence": round(confidence, 2),
            "trend": trend,
            "reasoning": reasoning,
            "stats": {
                "total_occurrences": total_count,
                "years_covered": years_covered,
                "last_seen": last_year,
                "avg_per_year": round(avg_frequency, 2)
            }
        }

    def _detect_trend(self, counts: List[int]) -> Tuple[str, float]:
        """
        Detect trend direction from historical counts.

        Returns:
            Tuple of (trend_label, trend_score)
        """
        if len(counts) < 2:
            return "stable", 0.5

        # Simple linear regression slope
        x = np.arange(len(counts))
        y = np.array(counts)

        # Calculate slope
        slope = np.polyfit(x, y, 1)[0]

        # Determine trend
        if slope > 0.5:
            return "up", 0.7
        elif slope < -0.5:
            return "down", 0.3
        else:
            return "stable", 0.5

    def _generate_reasoning(
        self,
        topic: str,
        total_count: int,
        years_covered: int,
        last_year: int,
        years_since: int,
        trend: str,
        avg_frequency: float
    ) -> str:
        """Generate human-readable reasoning for prediction."""
        parts = []

        # Frequency comment
        if avg_frequency >= 3:
            parts.append(f"High frequency topic (avg {avg_frequency:.1f} questions/year)")
        elif avg_frequency >= 1.5:
            parts.append(f"Moderate frequency ({avg_frequency:.1f} questions/year)")
        else:
            parts.append(f"Low frequency ({avg_frequency:.1f} questions/year)")

        # Recency comment
        if years_since == 0:
            parts.append(f"appeared in {last_year}")
        elif years_since == 1:
            parts.append("last seen 1 year ago")
        elif years_since <= 2:
            parts.append(f"gap of {years_since} years increases probability")
        else:
            parts.append(f"not seen for {years_since} years - due for return")

        # Trend comment
        if trend == "up":
            parts.append("showing upward trend")
        elif trend == "down":
            parts.append("decreasing trend")

        return ". ".join(parts).capitalize() + "."


if __name__ == "__main__":
    # Test the predictor
    logging.basicConfig(level=logging.INFO)
    predictor = TrendPredictor()

    # Sample data
    sample_frequencies = [
        {"topic": "First Law of Thermodynamics", "year": 2019, "count": 3},
        {"topic": "First Law of Thermodynamics", "year": 2020, "count": 2},
        {"topic": "First Law of Thermodynamics", "year": 2021, "count": 4},
        {"topic": "First Law of Thermodynamics", "year": 2022, "count": 3},
        {"topic": "First Law of Thermodynamics", "year": 2023, "count": 5},

        {"topic": "Carnot Cycle", "year": 2019, "count": 1},
        {"topic": "Carnot Cycle", "year": 2021, "count": 2},
        {"topic": "Carnot Cycle", "year": 2023, "count": 1},
    ]

    predictions = predictor.calculate_probabilities(sample_frequencies, current_year=2026)

    for pred in predictions:
        print(f"\nTopic: {pred['topic']}")
        print(f"Probability: {pred['probability']:.2f} (Confidence: {pred['confidence']:.2f})")
        print(f"Trend: {pred['trend']}")
        print(f"Reasoning: {pred['reasoning']}")
