-- Migration: Project Onboarding and Lifecycle
-- Description: Adds proposed status, project messages, and onboarding support.

-- 1. Create Project Messages table for communication
CREATE TABLE IF NOT EXISTS project_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ensure project_milestones has comprehensive tracking
ALTER TABLE project_milestones ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'; -- pending, in_progress, completed, approved
ALTER TABLE project_milestones ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE project_milestones ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE project_milestones ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- 3. Update projects table for onboarding
-- Add client_email and client_name for onboarding new clients who don't have accounts yet
ALTER TABLE projects ADD COLUMN IF NOT EXISTS onboarding_email VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS onboarding_name VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS proposed_service VARCHAR(255);

-- 4. Set RLS for project messages
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their projects"
ON project_messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_messages.project_id
        AND (
            p.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()) OR
            p.commissioner_id IN (SELECT id FROM commissioners WHERE user_id = auth.uid()) OR
            p.developer_id IN (SELECT id FROM developers WHERE user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
        )
    )
);

CREATE POLICY "Users can send messages to their projects"
ON project_messages FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_messages.project_id
        AND (
            p.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()) OR
            p.commissioner_id IN (SELECT id FROM commissioners WHERE user_id = auth.uid()) OR
            p.developer_id IN (SELECT id FROM developers WHERE user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
        )
    )
);

-- 5. Add notifications for project acceptance
CREATE OR REPLACE FUNCTION notify_on_project_proposal()
RETURNS TRIGGER AS $$
BEGIN
    -- If it's a proposal and has an onboarding email, we'll send it later via API
    -- But we can still log a system notification if a user matches
    INSERT INTO notifications (user_id, channel, title, body, metadata)
    SELECT u.id, 'dashboard', 'New Project Proposal', 'You have a new project proposal for ' || NEW.title, json_build_object('project_id', NEW.id)
    FROM users u
    JOIN clients c ON c.user_id = u.id
    WHERE c.id = NEW.client_id AND NEW.status = 'proposed';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_project_proposal ON projects;
CREATE TRIGGER on_project_proposal
AFTER INSERT ON projects
FOR EACH ROW
WHEN (NEW.status = 'proposed')
EXECUTE FUNCTION notify_on_project_proposal();
