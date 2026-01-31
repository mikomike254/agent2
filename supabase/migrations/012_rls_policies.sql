-- Migration: Row Level Security (RLS) Policies
-- Security policies for all new tables

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- ============================================
-- LEADS/JOBS POLICIES
-- ============================================

-- Anyone can view open jobs
CREATE POLICY "Anyone can view open leads" ON leads
    FOR SELECT
    USING (status = 'open');

-- Clients can create leads
CREATE POLICY "Clients can create leads" ON leads
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            JOIN clients c ON c.user_id = u.id
            WHERE u.id = auth.uid() AND c.id = client_id
        )
    );

-- Clients can update their own leads
CREATE POLICY "Clients can update their leads" ON leads
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN clients c ON c.user_id = u.id
            WHERE u.id = auth.uid() AND c.id = client_id
        )
    );

-- Commissioners can claim leads
CREATE POLICY "Commissioners can update leads" ON leads
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN commissioners comm ON comm.user_id = u.id
            WHERE u.id = auth.uid()
        )
    );

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- Users can view projects they're involved in
CREATE POLICY "Users can view their projects" ON projects
    FOR SELECT
    USING (
        client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
        OR commissioner_id IN (SELECT id FROM commissioners WHERE user_id = auth.uid())
        OR id IN (SELECT project_id FROM project_participants WHERE user_id = auth.uid())
    );

-- Clients and commissioners can create projects
CREATE POLICY "Authorized users can create projects" ON projects
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('client', 'commissioner', 'admin')
        )
    );

-- Project participants can update projects
CREATE POLICY "Participants can update projects" ON projects
    FOR UPDATE
    USING (
        client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
        OR commissioner_id IN (SELECT id FROM commissioners WHERE user_id = auth.uid())
        OR id IN (SELECT project_id FROM project_participants WHERE user_id = auth.uid())
    );

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Project participants can view messages
CREATE POLICY "Participants can view messages" ON messages
    FOR SELECT
    USING (
        project_id IN (
            SELECT project_id FROM project_participants WHERE user_id = auth.uid()
        )
        OR project_id IN (
            SELECT p.id FROM projects p
            JOIN clients c ON c.id = p.client_id
            WHERE c.user_id = auth.uid()
        )
        OR project_id IN (
            SELECT p.id FROM projects p
            JOIN commissioners comm ON comm.id = p.commissioner_id
            WHERE comm.user_id = auth.uid()
        )
    );

-- Participants can send messages
CREATE POLICY "Participants can send messages" ON messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND (
            project_id IN (
                SELECT project_id FROM project_participants WHERE user_id = auth.uid()
            )
            OR project_id IN (
                SELECT p.id FROM projects p
                JOIN clients c ON c.id = p.client_id
                WHERE c.user_id = auth.uid()
            )
            OR project_id IN (
                SELECT p.id FROM projects p
                JOIN commissioners comm ON comm.id = p.commissioner_id
                WHERE comm.user_id = auth.uid()
            )
        )
    );

-- ============================================
-- PROJECT PARTICIPANTS POLICIES
-- ============================================

-- Anyone can view project participants
CREATE POLICY "Anyone can view participants" ON project_participants
    FOR SELECT
    USING (true);

-- Project owners can add participants
CREATE POLICY "Owners can add participants" ON project_participants
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN clients c ON c.id = p.client_id
            WHERE c.user_id = auth.uid()
        )
        OR project_id IN (
            SELECT p.id FROM projects p
            JOIN commissioners comm ON comm.id = p.commissioner_id
            WHERE comm.user_id = auth.uid()
        )
    );

-- ============================================
-- JOB VIEWS POLICIES
-- ============================================

-- Anyone can log job views
CREATE POLICY "Anyone can create job views" ON job_views
    FOR INSERT
    WITH CHECK (true);

-- Users can view their own view history
CREATE POLICY "Users can view their history" ON job_views
    FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- PROFILE VIEWS POLICIES
-- ============================================

-- Anyone can log profile views
CREATE POLICY "Anyone can create profile views" ON profile_views
    FOR INSERT
    WITH CHECK (true);

-- Users can see who viewed their profile
CREATE POLICY "Users can see their profile views" ON profile_views
    FOR SELECT
    USING (profile_user_id = auth.uid());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users view own notifications" ON notifications
    FOR SELECT
    USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT
    WITH CHECK (true);

-- Users can update their notifications (mark as read)
CREATE POLICY "Users can update notifications" ON notifications
    FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================
-- CLIENTS POLICIES
-- ============================================

-- Anyone can view client info (for public profiles)
CREATE POLICY "Anyone can view clients" ON clients
    FOR SELECT
    USING (true);

-- Users can create their client profile
CREATE POLICY "Users can create client profile" ON clients
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their client profile
CREATE POLICY "Users can update client profile" ON clients
    FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 012: RLS Policies - COMPLETED';
END $$;
