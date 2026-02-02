-- Migration: Project Version Reviews
-- Description: Adds project_versions table to track developer submissions and client feedback.

CREATE TABLE IF NOT EXISTS project_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES users(id), -- The developer who submitted this version
    version_label VARCHAR(50) NOT NULL, -- e.g., "v1.0.0", "Draft 1"
    review_url TEXT, -- Link to the preview/demo site
    description TEXT, -- What's new in this version
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
    client_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view versions for their projects"
ON project_versions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_versions.project_id
        AND (
            p.client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()) OR
            p.commissioner_id IN (SELECT id FROM commissioners WHERE user_id = auth.uid()) OR
            p.developer_id IN (SELECT id FROM developers WHERE user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
        )
    )
);

CREATE POLICY "Developers can submit versions to their projects"
ON project_versions FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects p
        JOIN developers d ON d.id = p.developer_id
        WHERE p.id = project_versions.project_id
        AND d.user_id = auth.uid()
    )
);

CREATE POLICY "Clients can update version status and feedback"
ON project_versions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects p
        JOIN clients c ON c.id = p.client_id
        WHERE p.id = project_versions.project_id
        AND c.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects p
        JOIN clients c ON c.id = p.client_id
        WHERE p.id = project_versions.project_id
        AND c.user_id = auth.uid()
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_project_versions_updated_at 
BEFORE UPDATE ON project_versions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
