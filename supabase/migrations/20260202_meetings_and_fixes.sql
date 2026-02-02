-- Migration: Projects and Meetings fixes
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type VARCHAR(50) DEFAULT 'open';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'general';

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commissioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    meeting_link TEXT,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Policies for meetings
CREATE POLICY "Users can view their own meetings" ON meetings
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = commissioner_id);

CREATE POLICY "Users can insert their own meetings" ON meetings
    FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = commissioner_id);

CREATE POLICY "Users can update their own meetings" ON meetings
    FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = commissioner_id);
