-- Migration: Enhanced Job and Project System
-- Ensures all tables for job posting, project creation, and messaging are properly structured

-- ============================================
-- JOBS/LEADS ENHANCEMENTS
-- ============================================

-- Ensure leads table has all necessary columns for job board
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Add index for faster job board queries
CREATE INDEX IF NOT EXISTS idx_leads_status_open ON leads(status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- ============================================
-- PROJECTS ENHANCEMENTS
-- ============================================

-- Ensure projects table has all columns
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS commissioner_id UUID REFERENCES commissioners(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS timeline VARCHAR(255);

-- Add indexes for project queries
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_commissioner ON projects(commissioner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ============================================
-- USERS/PROFILES ENHANCEMENTS
-- ============================================

-- Ensure users table has bio field for public profiles
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- Add indexes for profile lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- CLIENTS TABLE
-- ============================================

-- Ensure clients table exists and has company info
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    industry VARCHAR(100),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);

-- ============================================
-- COMMISSIONERS ENHANCEMENTS
-- ============================================

-- Ensure commissioners table has necessary fields
ALTER TABLE commissioners
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website VARCHAR(255);

-- ============================================
-- MESSAGES TABLE
-- ============================================

-- Ensure messages table exists for project chat
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    CONSTRAINT messages_content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- ============================================
-- PROJECT PARTICIPANTS TABLE
-- ============================================

-- Track all participants in a project
CREATE TABLE IF NOT EXISTS project_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'client', 'commissioner', 'developer'
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_participants_project ON project_participants(project_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_user ON project_participants(user_id);

-- ============================================
-- JOB VIEWS (ANALYTICS)
-- ============================================

-- Track job board views for analytics
CREATE TABLE IF NOT EXISTS job_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET
);

CREATE INDEX IF NOT EXISTS idx_job_views_lead ON job_views(lead_id);
CREATE INDEX IF NOT EXISTS idx_job_views_user ON job_views(user_id);

-- ============================================
-- PROFILE VIEWS (ANALYTICS)
-- ============================================

-- Track profile views
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    viewer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMP DEFAULT NOW(),
    referrer VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_views(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

-- System notifications for users
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'job_posted', 'project_created', 'message_received', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- ============================================
-- UPDATE TIMESTAMPS FUNCTION
-- ============================================

-- Function to auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'Migration 011: Enhanced Job and Project System - COMPLETED';
END $$;
