-- Migration 015: Work Sessions (Time Intelligence)

CREATE TABLE IF NOT EXISTS work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES developers(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, completed
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_sessions_project ON work_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_developer ON work_sessions(developer_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_status ON work_sessions(status);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE work_sessions;
