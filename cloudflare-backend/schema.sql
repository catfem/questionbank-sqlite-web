-- Cloudflare D1 Database Schema for Question Bank System

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    picture TEXT,
    google_id TEXT UNIQUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stem TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('single', 'multiple', 'true_false')),
    correct_answer TEXT NOT NULL, -- JSON array of correct option indices
    explanation TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_by INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users (id)
);

-- Options table
CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    label TEXT NOT NULL CHECK (label IN ('A', 'B', 'C', 'D')),
    order_index INTEGER NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL
);

-- Question tags junction table
CREATE TABLE IF NOT EXISTS question_tags (
    question_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (question_id, tag_id),
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    question_ids TEXT NOT NULL, -- JSON array of question IDs
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users (id)
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quiz_id INTEGER NOT NULL,
    selected_answers TEXT NOT NULL, -- JSON object mapping question IDs to selected answers
    score REAL NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    completed_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
);

-- Import reports table
CREATE TABLE IF NOT EXISTS import_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    total_lines INTEGER NOT NULL,
    successful_imports INTEGER NOT NULL,
    failed_imports INTEGER NOT NULL,
    errors TEXT, -- JSON array of import errors
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users (id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions (question_type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions (created_by);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON options (question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts (quiz_id);
CREATE INDEX IF NOT EXISTS idx_import_reports_created_by ON import_reports (created_by);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags (name);

-- Insert some sample data
INSERT OR IGNORE INTO tags (name, created_at) VALUES 
('Mathematics', datetime('now')),
('Science', datetime('now')),
('History', datetime('now')),
('Geography', datetime('now')),
('Literature', datetime('now'));

INSERT OR IGNORE INTO questions (stem, question_type, correct_answer, explanation, difficulty, created_at, updated_at) VALUES 
('What is the capital of France?', 'single', '["C"]', 'Paris is the capital and largest city of France.', 'easy', datetime('now'), datetime('now')),
('Which of the following are programming languages?', 'multiple', '["A", "C"]', 'Python and Java are both popular programming languages.', 'medium', datetime('now'), datetime('now')),
('The Earth is flat.', 'true_false', '["False"]', 'The Earth is a sphere, not flat.', 'easy', datetime('now'), datetime('now'));

-- Insert options for the questions
INSERT OR IGNORE INTO options (question_id, text, label, order_index) VALUES 
(1, 'London', 'A', 0),
(1, 'Berlin', 'B', 1),
(1, 'Paris', 'C', 2),
(1, 'Madrid', 'D', 3),
(2, 'Python', 'A', 0),
(2, 'HTML', 'B', 1),
(2, 'Java', 'C', 2),
(2, 'CSS', 'D', 3),
(3, 'True', 'A', 0),
(3, 'False', 'B', 1);

-- Link questions to tags
INSERT OR IGNORE INTO question_tags (question_id, tag_id) VALUES 
(1, (SELECT id FROM tags WHERE name = 'Geography')),
(2, (SELECT id FROM tags WHERE name = 'Science')),
(3, (SELECT id FROM tags WHERE name = 'Science'));