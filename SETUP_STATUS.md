# 🚀 ExamTrend AI - System Status

## ✅ Currently Running

### Backend API (FastAPI)
- **URL:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Status:** ✅ Running
- **Database:** SQLite (initialized with sample data)

### Frontend (React + Vite)
- **URL:** http://localhost:5173
- **Status:** ✅ Running
- **Connected to:** Backend API at localhost:8000

---

## 📊 Database Status

✅ **Initialized** with:
- 3 Exams (UPSC, CBSE, JEE Main)
- 10 Subjects
- 10 Chapters

**Note:** No actual PYQ data loaded yet (waiting for your PDFs from Mac)

---

## 🧪 Test the System

### 1. Test Backend API

```bash
# Health check
curl http://localhost:8000/api/health

# List exams
curl http://localhost:8000/api/exams

# API Documentation (open in browser)
open http://localhost:8000/docs
```

### 2. Test Frontend

Open in browser: **http://localhost:5173**

Try searching for:
- Exam: CBSE or JEE Main
- Subject: Mathematics or Physics
- Chapter: Algebra or Thermodynamics

**Expected:** You'll get an error "No questions found" - this is correct since we haven't processed any PDFs yet.

---

## 📁 Next Steps

### Option A: Add Your Real PYQ Data

1. **Transfer data from your Mac to here:**
   ```bash
   # On your Mac:
   scp -r /Users/guggu/pyq_collector/data user@this-server:/home/user/ai-app/backend/sample_data
   ```

2. **Update backend/.env:**
   ```
   PYQ_DATA_PATH=./sample_data
   ```

3. **Process the PDFs:**
   ```bash
   cd backend
   source venv/bin/activate
   PYTHONPATH=/home/user/ai-app python -m backend.pipeline.master_pipeline \
       --exam CBSE \
       --limit 10
   ```

### Option B: Use the System on Your Mac

1. Clone the repo on your Mac
2. Follow the setup instructions in README_FULL.md
3. Point `PYQ_DATA_PATH` to `/Users/guggu/pyq_collector/data`

---

## 🛠️ Useful Commands

### Stop Servers
```bash
# Find process IDs
ps aux | grep "uvicorn\|vite"

# Kill them
pkill -f uvicorn
pkill -f vite
```

### Restart Servers
```bash
# Backend
cd backend
source venv/bin/activate
PYTHONPATH=/home/user/ai-app python -m backend.api.main

# Frontend (new terminal)
npm run dev
```

### View Logs
```bash
# Backend logs
tail -f /tmp/claude/-home-user-ai-app/tasks/bd8c4b6.output

# Frontend logs
tail -f /tmp/claude/-home-user-ai-app/tasks/bec20c0.output
```

---

## 🐛 Troubleshooting

### "Unable to connect to analysis server"
- Check if backend is running: `curl http://localhost:8000/api/health`
- Restart backend if needed

### "No questions found"
- This is expected - no PDFs have been processed yet
- Load sample data or process real PDFs

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill

# Kill process on port 5173
lsof -ti:5173 | xargs kill
```

---

## 📈 System Architecture

```
┌─────────────────┐
│ React Frontend  │ http://localhost:5173
│ (Vite)          │
└────────┬────────┘
         │
         │ API calls
         ▼
┌─────────────────┐
│ FastAPI Backend │ http://localhost:8000
│ (Python)        │
└────────┬────────┘
         │
         │ SQLAlchemy ORM
         ▼
┌─────────────────┐
│ SQLite Database │ backend/database/pyq.db
│ (Local Storage) │
└─────────────────┘
```

---

## 🎯 Current Limitation

**No PYQ data loaded yet.** The system is ready but needs:
- Your 660+ UPSC papers
- Your 170+ CBSE papers
- JEE Main papers

Once loaded, it will analyze them and provide real predictions!
