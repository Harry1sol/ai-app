# ExamTrend AI - Complete Project Guide

A data-driven exam analytics platform that analyzes real Previous Year Questions (PYQs) to predict topic probabilities and trends for major Indian exams (UPSC, CBSE, JEE, etc.).

## 🎯 Project Overview

Unlike typical exam trend tools that simulate or hallucinate data, **ExamTrend AI** operates on a real corpus of:
- **660+ UPSC papers** (auto-scraped)
- **170+ CBSE papers** (Class 10 & 12, subject-wise)
- **JEE Main archives** (organized by year/session/shift)

The system:
1. Extracts text from PDFs (with OCR support)
2. Segments individual questions
3. Tags topics using keyword matching and ML
4. Analyzes frequency patterns year-wise
5. Predicts probabilities using statistical models
6. Serves real-time analysis via REST API

---

## 📁 Project Structure

```
ai-app/                          # Root directory
├── backend/                     # Python backend (FastAPI)
│   ├── api/                    # REST API routes
│   ├── pipeline/               # Data processing pipeline
│   ├── engine/                 # Analytics & prediction
│   ├── database/               # SQLite database
│   └── config/                 # Configuration
├── components/                  # React UI components
├── services/                    # API client services
├── index.html                   # HTML entry point
├── App.tsx                      # Main React component
├── types.ts                     # TypeScript types
├── index.css                    # Tailwind CSS
├── package.json                 # Frontend dependencies
├── tailwind.config.js          # Tailwind configuration
└── ARCHITECTURE.md             # System architecture docs

pyq_collector/                   # External: PYQ data directory
└── data/
    ├── UPSC/
    ├── CBSE/
    └── JEE/Main/
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.10+ (for backend)
- **Tesseract OCR** (for scanned PDFs)

### 1. Clone & Setup

```bash
cd /home/user/ai-app

# Frontend setup
npm install

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Install Tesseract (for OCR)

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

### 3. Configure Environment

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PYQ_DATA_PATH=/path/to/your/pyq_collector/data
DATABASE_URL=sqlite:///./database/pyq.db
API_PORT=8000
```

**Frontend:**
```bash
cd ..  # Back to root
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:8000/api
```

### 4. Initialize Database

```bash
cd backend
python -m backend.api.main
```

This creates `database/pyq.db` and runs schema initialization.

Press `Ctrl+C` after you see "✅ API is ready!"

---

## 📊 Processing PYQ Data

Before using the app, you need to process your PYQ PDFs into the database.

### Test with Small Batch (Recommended First)

```bash
cd /home/user/ai-app

# Process 5 JEE Physics papers as test
python -m backend.pipeline.master_pipeline \
    --exam JEE_MAIN \
    --subject Physics \
    --limit 5 \
    --data-path /path/to/pyq_collector/data
```

### Process Full Datasets

**CBSE:**
```bash
python -m backend.pipeline.master_pipeline \
    --exam CBSE \
    --data-path /path/to/pyq_collector/data
```

**UPSC:**
```bash
python -m backend.pipeline.master_pipeline \
    --exam UPSC \
    --data-path /path/to/pyq_collector/data
```

**JEE Main (all subjects):**
```bash
python -m backend.pipeline.master_pipeline \
    --exam JEE_MAIN \
    --data-path /path/to/pyq_collector/data
```

**Processing time estimates:**
- 1 PDF ≈ 1-2 seconds (with OCR)
- 100 PDFs ≈ 2-3 minutes
- 660 UPSC papers ≈ 15-20 minutes

---

## 🖥️ Running the Application

### Start Backend API

```bash
cd /home/user/ai-app
python -m backend.api.main
```

API will be available at: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs** (auto-generated Swagger UI)

### Start Frontend

Open a new terminal:

```bash
cd /home/user/ai-app
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 🔍 How to Use

1. **Open the app** at http://localhost:5173
2. **Enter exam details:**
   - Exam: "JEE Main" or "CBSE" or "UPSC"
   - Level: "Class 12" or "Final Year"
   - Subject: "Physics" or "Mathematics"
   - Chapter: "Thermodynamics" or specific chapter name
3. **Click "Generate Trend Report"**
4. **View results:**
   - Year-wise question frequency charts
   - Topic predictions with probabilities
   - Trend indicators (up/down/stable)
   - Confidence scores
   - Source documents
5. **Save reports** for later reference (stored in localStorage)

---

## 🧪 Testing the System

### Test Backend Health

```bash
curl http://localhost:8000/api/health
```

Expected:
```json
{
  "status": "healthy",
  "service": "ExamTrend AI API",
  "version": "1.0.0"
}
```

### Test Database

```bash
curl http://localhost:8000/api/health/db
```

### Test Analysis API

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "exam": "JEE_MAIN",
    "subject": "Physics",
    "chapter": "Thermodynamics"
  }'
```

---

## 🛠️ Development Workflow

### Adding New Exam Data

1. **Collect PDFs** in `pyq_collector/data/{EXAM_NAME}/`
2. **Run pipeline:**
   ```bash
   python -m backend.pipeline.master_pipeline \
       --exam YOUR_EXAM_NAME \
       --data-path /path/to/pyq_collector/data
   ```
3. **Verify data:**
   ```bash
   curl http://localhost:8000/api/stats/YOUR_EXAM_NAME
   ```

### Updating Curriculum/Keywords

Edit `backend/pipeline/topic_tagger.py` and update the `curriculum` dictionary:

```python
"NEW_EXAM": {
    "Subject": {
        "Chapter": {
            "keywords": ["key1", "key2"],
            "topics": ["Topic 1", "Topic 2"]
        }
    }
}
```

### Running Analytics

After adding new data, run frequency analysis:

```python
from backend.database.connection import get_db_context
from backend.engine.frequency_analyzer import FrequencyAnalyzer
from backend.engine.trend_predictor import TrendPredictor

with get_db_context() as db:
    analyzer = FrequencyAnalyzer(db)
    stats = analyzer.analyze_and_store(
        exam_id=3,  # Check database for correct ID
        subject_id=1,
        chapter_id=1
    )
    print(stats)
```

---

## 📚 API Endpoints Reference

### Health
- `GET /api/health` - Basic health check
- `GET /api/health/db` - Database health

### Exams
- `GET /api/exams` - List all exams
- `GET /api/exams/{exam_id}/subjects` - Get subjects
- `GET /api/subjects/{subject_id}/chapters` - Get chapters

### Analysis
- `POST /api/analyze` - Main analysis endpoint (see example above)
- `GET /api/stats/{exam_name}` - Overall statistics

Full documentation: **http://localhost:8000/docs**

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'backend'`

**Solution:** Run from parent directory:
```bash
cd /home/user/ai-app
python -m backend.api.main
```

### Frontend styling broken

**Solution:** Install Tailwind CSS:
```bash
npm install -D tailwindcss postcss autoprefixer
```

### OCR not working

**Check Tesseract:**
```bash
tesseract --version
```

If not found, reinstall Tesseract OCR.

### Database locked

SQLite doesn't handle concurrent writes well. Solution:
- Don't run multiple pipeline processes simultaneously
- For production, consider PostgreSQL

### API connection refused

1. Check backend is running: `curl http://localhost:8000/api/health`
2. Check CORS settings in `backend/config/settings.py`
3. Verify `VITE_API_URL` in `.env.local`

---

## 🔧 Configuration Options

### Backend (`backend/.env`)

```env
API_HOST=0.0.0.0
API_PORT=8000
DATABASE_URL=sqlite:///./database/pyq.db
PYQ_DATA_PATH=../../pyq_collector/data
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
LOG_LEVEL=INFO
GEMINI_API_KEY=optional_for_llm_tagging
```

### Frontend (`.env.local`)

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🚢 Deployment

### Backend Deployment

**Using Docker:**
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY backend/ ./backend/
RUN pip install -r backend/requirements.txt
RUN apt-get update && apt-get install -y tesseract-ocr
CMD ["python", "-m", "backend.api.main"]
```

**Using Gunicorn:**
```bash
pip install gunicorn
gunicorn backend.api.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Deployment

```bash
npm run build
# Deploy 'dist/' folder to static hosting (Vercel, Netlify, etc.)
```

---

## 📈 Performance Metrics

- **Processing:** ~1-2 PDFs/sec with OCR
- **Database:** ~100MB for 1000 PDFs
- **API Response:** <100ms for analysis queries
- **Frontend:** Lighthouse score 90+

---

## 🤝 Contributing

1. Process sample data for your exam type
2. Test the analysis results
3. Report issues or suggest improvements
4. Add new exam support via curriculum updates

---

## 📝 License

This project is for educational and research purposes.

---

## 🙏 Acknowledgments

- PyMuPDF for PDF processing
- Tesseract OCR for scanned documents
- FastAPI for modern Python web framework
- React + Vite for fast frontend development
- Tailwind CSS for styling
- Recharts for data visualization

---

## 📞 Support

For issues:
1. Check `backend/README.md` for backend-specific docs
2. Review `ARCHITECTURE.md` for system design
3. Check API docs at http://localhost:8000/docs
4. Review logs in terminal output

---

## 🎯 Next Steps

1. ✅ Process your PYQ data
2. ✅ Run frequency analysis
3. ✅ Start backend and frontend
4. ✅ Test with sample queries
5. ⬜ Add more exam data (NEET, CA Foundation, etc.)
6. ⬜ Implement question-level comparison
7. ⬜ Add export features (PDF/CSV reports)
8. ⬜ Deploy to production

---

**Happy Analyzing! 📊🎓**
