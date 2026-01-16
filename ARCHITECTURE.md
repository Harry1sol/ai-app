# ExamTrend AI - System Architecture

## Overview
A data-driven exam analytics platform that analyzes real Previous Year Questions (PYQs) to predict topic probabilities and trends.

## System Components

### 1. Data Collection Layer (Python - Existing)
**Location:** `pyq_collector/` (separate directory)

```
pyq_collector/
├── data/
│   ├── UPSC/          # 661 PDFs
│   ├── CBSE/          # 171 PDFs
│   └── JEE/Main/      # Structured PDFs
├── sources/
│   ├── upsc.py
│   ├── cbse.py
│   └── jee_organizer.py
└── master.py
```

**Status:** ✅ Complete
- UPSC: 661 papers auto-scraped
- CBSE: 171 papers (Class 10 & 12)
- JEE: Manual PDFs + auto-organizer

---

### 2. Data Processing Pipeline (Python - To Build)
**Location:** `backend/pipeline/`

#### Stage 1: PDF Extraction
- **Tool:** PyMuPDF (fast) or pdfplumber
- **OCR:** Tesseract for scanned PDFs
- **Output:** Raw text per PDF

#### Stage 2: Question Segmentation
- Regex patterns to detect question boundaries
- Question numbering detection (Q1, Q2, etc.)
- Multi-part question handling (a, b, c)
- **Output:** Individual questions with metadata

#### Stage 3: Topic Classification
- **Method:** Hybrid approach
  - Rule-based: Keyword matching from curriculum
  - ML-based: spaCy NER + custom training
  - LLM-assisted: Gemini for ambiguous cases (batch processing)
- **Output:** Questions tagged with topics/chapters

#### Stage 4: Knowledge Graph Construction
```
Exam → Subject → Chapter → Topic → Sub-topic → Question
```
- Build hierarchical taxonomy per exam
- Store relationships in graph structure

---

### 3. Database Schema (SQLite)
**Location:** `backend/database/pyq.db`

#### Tables:

**exams**
```sql
id, name, full_name, category (board/competitive)
```

**subjects**
```sql
id, exam_id, name, code
```

**chapters**
```sql
id, subject_id, name, weightage_marks
```

**questions**
```sql
id, pdf_source, year, exam_id, subject_id, chapter_id,
question_text, marks, difficulty, topics (JSON),
metadata (JSON: shift, session, paper_code)
```

**topic_frequency**
```sql
id, exam_id, subject_id, chapter_id, topic, year, count, total_marks
```

**predictions**
```sql
id, exam_id, subject_id, chapter_id, topic,
predicted_probability, confidence_score,
reasoning (JSON), last_updated
```

---

### 4. Analytics Engine (Python)
**Location:** `backend/engine/`

#### Modules:

**frequency_analyzer.py**
- Count questions per topic/year
- Calculate year-wise distribution
- Identify gaps and patterns

**trend_predictor.py**
- Time-series analysis
- Markov chain modeling
- Bayesian probability updates
- Gap-based prediction (if not asked for N years, probability increases)

**weightage_calculator.py**
- Marks-based importance
- Historical weightage trends
- Expected value per topic

**confidence_scorer.py**
- Data quality score (how many years of data)
- Prediction reliability
- Variance analysis

---

### 5. Backend API (FastAPI)
**Location:** `backend/api/`

#### Endpoints:

**GET /api/exams**
- List all available exams

**GET /api/exams/{exam_id}/subjects**
- Get subjects for an exam

**GET /api/subjects/{subject_id}/chapters**
- Get chapters for a subject

**POST /api/analyze**
```json
{
  "exam": "JEE Main",
  "subject": "Physics",
  "chapter": "Thermodynamics",
  "level": "Class 12"
}
```
**Returns:**
```json
{
  "yearWiseData": [...],
  "predictions": [...],
  "sourceDocuments": [...],
  "totalQuestionsAnalyzed": 147,
  "mostFrequentTopic": "First Law of Thermodynamics",
  "confidenceScore": 0.85,
  "dataQuality": "high"
}
```

**GET /api/questions/search**
- Search questions by topic/year/difficulty

**GET /api/stats/{exam_id}**
- Overall statistics for an exam

---

### 6. Frontend (React + TypeScript)
**Location:** `ai-app/` (current directory)

#### Changes Needed:
1. **Remove:** Gemini AI service (simulation)
2. **Add:** API client for real backend
3. **Fix:** Tailwind CSS setup (currently broken)
4. **Enhance:**
   - Data quality indicators
   - Confidence scores
   - Real source PDF links
   - Download PYQ button
   - Comparison view (multiple chapters)

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. PDF Collection (pyq_collector/)                     │
│     UPSC: 661 | CBSE: 171 | JEE: Manual                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. Processing Pipeline                                 │
│     Extract → Segment → Tag → Structure                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  3. Database (SQLite)                                   │
│     Questions | Topics | Frequency | Metadata          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  4. Analytics Engine                                    │
│     Frequency → Trends → Probability → Confidence      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  5. FastAPI Backend                                     │
│     REST endpoints for analysis queries                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  6. React Frontend                                      │
│     User queries → Charts → Predictions                │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Data Collection | Python + Requests | Existing, works |
| PDF Processing | PyMuPDF + Tesseract | Fast, reliable OCR |
| NLP/Tagging | spaCy + Regex | Lightweight, accurate |
| Database | SQLite + JSON | Simple, portable, no server |
| Analytics | NumPy, Pandas, scikit-learn | Standard ML stack |
| Backend | FastAPI | Async, fast, auto docs |
| Frontend | React + TypeScript + Vite | Modern, fast |
| Styling | Tailwind CSS | Utility-first (need to fix) |
| Charts | Recharts | React-native, clean |

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up backend project structure
- [ ] Create database schema
- [ ] Build basic PDF text extraction
- [ ] Fix Tailwind CSS in frontend

### Phase 2: Core Pipeline (Week 2)
- [ ] Question segmentation logic
- [ ] Topic tagging system
- [ ] Process 20% of data as test
- [ ] Basic API endpoints

### Phase 3: Analytics (Week 3)
- [ ] Frequency analysis
- [ ] Trend prediction algorithm
- [ ] Confidence scoring
- [ ] Process remaining 80% of data

### Phase 4: Integration (Week 4)
- [ ] Connect frontend to backend
- [ ] Remove Gemini simulation
- [ ] Add real-time search
- [ ] Deploy locally

### Phase 5: Enhancement (Week 5+)
- [ ] Add NEET, CA Foundation data
- [ ] Question-level comparison
- [ ] Export PYQ packs
- [ ] User accounts & saved queries

---

## Key Advantages Over Current System

| Current (Gemini Simulation) | New (Real Data) |
|-----------------------------|-----------------|
| Hallucinated data | Real PYQs |
| No source verification | Direct PDF links |
| Generic predictions | Statistical accuracy |
| API cost per query | One-time processing |
| Unreliable | Reproducible |
| No offline mode | Works offline |
| Limited to AI knowledge | Covers all years |

---

## Next Steps

1. Create `backend/` directory in repo
2. Set up Python environment with dependencies
3. Start with PDF extraction for 10 sample papers
4. Build first API endpoint `/api/analyze`
5. Update frontend to call real API

---

## File Structure (After Implementation)

```
ai-app/                         # Frontend (React)
├── src/
│   ├── components/
│   ├── services/
│   │   ├── apiClient.ts       # NEW: Real API client
│   │   └── geminiService.ts   # DELETE: Remove simulation
│   └── App.tsx
│
backend/                        # NEW: Backend (Python)
├── api/
│   ├── main.py                # FastAPI app
│   ├── routes/
│   └── models/
├── pipeline/
│   ├── pdf_extractor.py
│   ├── question_segmenter.py
│   └── topic_tagger.py
├── engine/
│   ├── frequency_analyzer.py
│   └── trend_predictor.py
├── database/
│   ├── schema.sql
│   ├── models.py
│   └── pyq.db
└── requirements.txt

pyq_collector/                  # Existing: Data collection
└── data/
    ├── UPSC/
    ├── CBSE/
    └── JEE/
```

---

## Questions to Clarify

1. What's the path to your `pyq_collector/` directory?
2. Do the PDFs have consistent naming conventions?
3. Are the PDFs text-based or scanned images?
4. Do you want to start with one exam (e.g., JEE) or all three?
5. Should we use Gemini for topic tagging (batch processing) or pure ML?
