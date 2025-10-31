-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    picture TEXT,
    google_id VARCHAR(255) UNIQUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    stem TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false')),
    correct_answer TEXT[] NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Options table
CREATE TABLE options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    label VARCHAR(10) NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question tags junction table
CREATE TABLE question_tags (
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

-- Quizzes table
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    question_ids INTEGER[] NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    quiz_id INTEGER REFERENCES quizzes(id),
    selected_answers JSONB,
    score DECIMAL(5,2),
    total_questions INTEGER,
    correct_answers INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Import reports table
CREATE TABLE import_reports (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    total_lines INTEGER,
    successful_imports INTEGER DEFAULT 0,
    failed_imports INTEGER DEFAULT 0,
    errors JSONB,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_options_question_id ON options(question_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);
CREATE INDEX idx_import_reports_created_by ON import_reports(created_by);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = google_id);

-- Everyone can read questions (for quizzes)
CREATE POLICY "Everyone can read questions" ON questions
    FOR SELECT USING (true);

-- Authenticated users can create questions
CREATE POLICY "Authenticated users can create questions" ON questions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Question creators can update their own questions
CREATE POLICY "Users can update own questions" ON questions
    FOR UPDATE USING (auth.uid()::text IN (
        SELECT google_id FROM users WHERE id = created_by
    ));

-- Everyone can read options
CREATE POLICY "Everyone can read options" ON options
    FOR SELECT USING (true);

-- Everyone can read tags
CREATE POLICY "Everyone can read tags" ON tags
    FOR SELECT USING (true);

-- Authenticated users can create tags
CREATE POLICY "Authenticated users can create tags" ON tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Everyone can read quizzes
CREATE POLICY "Everyone can read quizzes" ON quizzes
    FOR SELECT USING (true);

-- Authenticated users can create quizzes
CREATE POLICY "Authenticated users can create quizzes" ON quizzes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can read their own quiz attempts
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid()::text IN (
        SELECT google_id FROM users WHERE id = user_id
    ));

-- Users can create their own quiz attempts
CREATE POLICY "Users can create own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid()::text IN (
        SELECT google_id FROM users WHERE id = user_id
    ));

-- Users can read their own import reports
CREATE POLICY "Users can view own import reports" ON import_reports
    FOR SELECT USING (auth.uid()::text IN (
        SELECT google_id FROM users WHERE id = created_by
    ));

-- Users can create their own import reports
CREATE POLICY "Users can create own import reports" ON import_reports
    FOR INSERT WITH CHECK (auth.uid()::text IN (
        SELECT google_id FROM users WHERE id = created_by
    ));

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();