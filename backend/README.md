# ExamTrend AI - Backend

Real PYQ analysis backend powered by FastAPI.

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Install System Dependencies

For OCR support:

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:
- `PYQ_DATA_PATH`: Path to your `pyq_collector/data/` directory
- `GEMINI_API_KEY`: (Optional) For LLM-assisted tagging

### 5. Initialize Database

```bash
python -m backend.api.main
```

This will create `database/pyq.db` automatically.

## Usage

### Start API Server

```bash
cd /home/user/ai-app
python -m backend.api.main
```

API will be available at: http://localhost:8000

API Documentation: http://localhost:8000/docs

### Process PYQ Data

Process JEE Main papers (test with 5 PDFs):

```bash
python -m backend.pipeline.master_pipeline \
    --exam JEE_MAIN \
    --subject Physics \
    --limit 5 \
    --data-path /path/to/pyq_collector/data
```

Process all CBSE papers:

```bash
python -m backend.pipeline.master_pipeline \
    --exam CBSE \
    --data-path /path/to/pyq_collector/data
```

Process UPSC papers:

```bash
python -m backend.pipeline.master_pipeline \
    --exam UPSC \
    --data-path /path/to/pyq_collector/data
```

### Analyze Frequency and Generate Predictions

After processing, run frequency analysis:

```bash
python -c "
from backend.database.connection import get_db_context
from backend.engine.frequency_analyzer import FrequencyAnalyzer
from backend.engine.trend_predictor import TrendPredictor

with get_db_context() as db:
    analyzer = FrequencyAnalyzer(db)

    # Analyze for exam_id=3 (JEE_MAIN), subject_id=1, chapter_id=1
    stats = analyzer.analyze_and_store(
        exam_id=3,
        subject_id=1,
        chapter_id=1
    )

    print('Frequency analysis complete:', stats)
"
```

## API Endpoints

### Health

- `GET /api/health` - Basic health check
- `GET /api/health/db` - Database health check

### Exams

- `GET /api/exams` - List all exams
- `GET /api/exams/{exam_id}/subjects` - Get subjects for exam
- `GET /api/subjects/{subject_id}/chapters` - Get chapters for subject

### Analysis

- `POST /api/analyze` - Main analysis endpoint

```json
{
  "exam": "JEE Main",
  "subject": "Physics",
  "chapter": "Thermodynamics",
  "level": "Class 12"
}
```

Returns:
```json
{
  "yearWiseData": [...],
  "predictions": [...],
  "sourceDocuments": [...],
  "totalQuestionsAnalyzed": 147,
  "mostFrequentTopic": "First Law",
  "confidenceScore": 0.85,
  "dataQuality": "high"
}
```

- `GET /api/stats/{exam_name}` - Get overall exam statistics

## Project Structure

```
backend/
├── api/
│   ├── main.py              # FastAPI app
│   └── routes/
│       ├── analysis.py      # Analysis endpoints
│       ├── exams.py         # Exam/subject/chapter endpoints
│       └── health.py        # Health checks
├── pipeline/
│   ├── pdf_extractor.py     # PDF text extraction + OCR
│   ├── question_segmenter.py # Question segmentation
│   ├── topic_tagger.py      # Topic tagging
│   └── master_pipeline.py   # End-to-end pipeline
├── engine/
│   ├── frequency_analyzer.py # Frequency analysis
│   └── trend_predictor.py    # Probability calculation
├── database/
│   ├── schema.sql           # Database schema
│   ├── models.py            # SQLAlchemy models
│   └── connection.py        # Database connection
├── config/
│   └── settings.py          # Configuration
└── requirements.txt

## Development

### Run Tests

```bash
pytest
```

### Format Code

```bash
black .
```

### Check API Docs

Start server and visit: http://localhost:8000/docs

## Architecture Flow

```
1. PDF Files (pyq_collector/data/)
        ↓
2. PDF Extraction (PyMuPDF + OCR)
        ↓
3. Question Segmentation (Regex patterns)
        ↓
4. Topic Tagging (Keyword matching)
        ↓
5. Database Storage (SQLite)
        ↓
6. Frequency Analysis
        ↓
7. Trend Prediction
        ↓
8. API Response
```

## Troubleshooting

### Database Locked Error

SQLite doesn't handle concurrent writes well. Solution:
- Use a single process for data import
- Consider PostgreSQL for production

### OCR Not Working

Check Tesseract installation:

```bash
tesseract --version
```

If not found, reinstall Tesseract.

### Import Errors

Make sure you run commands from the parent directory (`/home/user/ai-app`), not from `backend/`:

```bash
cd /home/user/ai-app
python -m backend.api.main
```

## Next Steps

1. Process your PYQ data with the master pipeline
2. Run frequency analysis
3. Start the API server
4. Update frontend to call the API
5. Test end-to-end with real data

## Performance

- Processing speed: ~1-2 PDFs per second (with OCR)
- Database size: ~100MB for 1000 PDFs
- API response time: <100ms for analysis queries
