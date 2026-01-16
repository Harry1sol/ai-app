-- ExamTrend AI Database Schema

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'board' or 'competitive'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    UNIQUE(exam_id, name)
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    weightage_marks INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE(subject_id, name)
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pdf_source VARCHAR(500) NOT NULL,
    year INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    chapter_id INTEGER,
    question_text TEXT NOT NULL,
    marks INTEGER DEFAULT 1,
    difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
    topics TEXT, -- JSON array of topics
    metadata TEXT, -- JSON: shift, session, paper_code, etc.
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- Topic Frequency table (aggregated data)
CREATE TABLE IF NOT EXISTS topic_frequency (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    chapter_id INTEGER,
    topic VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    count INTEGER DEFAULT 0,
    total_marks INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id),
    UNIQUE(exam_id, subject_id, chapter_id, topic, year)
);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    chapter_id INTEGER,
    topic VARCHAR(255) NOT NULL,
    predicted_probability REAL NOT NULL, -- 0.0 to 1.0
    confidence_score REAL NOT NULL, -- 0.0 to 1.0
    reasoning TEXT, -- JSON with prediction logic
    trend VARCHAR(20), -- 'up', 'down', 'stable'
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id),
    UNIQUE(exam_id, subject_id, chapter_id, topic)
);

-- Source Documents table (for UI reference)
CREATE TABLE IF NOT EXISTS source_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    exam_name VARCHAR(255) NOT NULL,
    source_label VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    UNIQUE(exam_id, year, source_label)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_year ON questions(year);
CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_topic_frequency_year ON topic_frequency(year);
CREATE INDEX IF NOT EXISTS idx_topic_frequency_chapter ON topic_frequency(chapter_id);

-- Insert initial exam data
INSERT OR IGNORE INTO exams (name, full_name, category, description) VALUES
('UPSC', 'Union Public Service Commission', 'competitive', 'Civil Services and other government exams'),
('CBSE', 'Central Board of Secondary Education', 'board', 'Class 10 and Class 12 board exams'),
('JEE_MAIN', 'Joint Entrance Examination Main', 'competitive', 'Engineering entrance exam for NITs, IIITs, and other institutions');
