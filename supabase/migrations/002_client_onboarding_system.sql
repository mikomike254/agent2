-- Tech Developers Kenya & East Africa - Database Schema
-- Migration 002: Client Onboarding System

-- =======================
-- CLIENT ONBOARDING TRACKING
-- =======================

DO $$ BEGIN
    CREATE TYPE onboarding_status AS ENUM ('initiated', 'in_progress', 'documents_pending', 'payment_pending', 'approved', 'active', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS client_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  commissioner_id UUID NOT NULL REFERENCES commissioners(id),
  status onboarding_status DEFAULT 'initiated',
  progress_percent INTEGER DEFAULT 0,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 7,
  onboarding_link TEXT,
  onboarding_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_client ON client_onboarding(client_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_commissioner ON client_onboarding(commissioner_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_token ON client_onboarding(onboarding_token);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON client_onboarding(status);

-- =======================
-- INDIVIDUAL ONBOARDING STEPS
-- =======================

DO $$ BEGIN
    CREATE TYPE step_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS onboarding_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onboarding_id UUID NOT NULL REFERENCES client_onboarding(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  description TEXT,
  status step_status DEFAULT 'pending',
  data JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_steps_onboarding ON onboarding_steps(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_steps_number ON onboarding_steps(step_number);

-- =======================
-- ADMIN APPROVAL REQUESTS
-- =======================

DO $$ BEGIN
    CREATE TYPE approval_request_type AS ENUM ('payment_verification', 'kyc_approval', 'project_approval', 'client_onboarding');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS admin_approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commissioner_id UUID NOT NULL REFERENCES commissioners(id),
  client_id UUID REFERENCES clients(id),
  project_id UUID REFERENCES projects(id),
  request_type approval_request_type NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status approval_status DEFAULT 'pending',
  admin_notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_commissioner ON admin_approval_requests(commissioner_id);
CREATE INDEX IF NOT EXISTS idx_approval_client ON admin_approval_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_approval_status ON admin_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_type ON admin_approval_requests(request_type);

-- =======================
-- UPDATE EXISTING TABLES
-- =======================

-- Add fields to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS project_scope TEXT,
ADD COLUMN IF NOT EXISTS budget_range VARCHAR(100),
ADD COLUMN IF NOT EXISTS timeline VARCHAR(100),
ADD COLUMN IF NOT EXISTS assigned_commissioner_id UUID REFERENCES commissioners(id);

CREATE INDEX IF NOT EXISTS idx_clients_commissioner ON clients(assigned_commissioner_id);

-- Add fields to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS budget DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS timeline VARCHAR(100),
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS project_type VARCHAR(50) DEFAULT 'commissioner_led',
ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id);

CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_lead ON projects(lead_id);

-- Add status field to users table if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- =======================
-- TRIGGERS
-- =======================

-- Update trigger for client_onboarding
CREATE TRIGGER update_client_onboarding_updated_at BEFORE UPDATE ON client_onboarding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for admin_approval_requests
CREATE TRIGGER update_admin_approval_requests_updated_at BEFORE UPDATE ON admin_approval_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =======================
-- FUNCTIONS
-- =======================

-- Function to automatically update progress percentage based on completed steps
CREATE OR REPLACE FUNCTION update_onboarding_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_steps INTEGER;
    completed_steps INTEGER;
    new_progress INTEGER;
BEGIN
    -- Get total steps
    SELECT total_steps INTO total_steps
    FROM client_onboarding
    WHERE id = NEW.onboarding_id;

    -- Count completed steps
    SELECT COUNT(*) INTO completed_steps
    FROM onboarding_steps
    WHERE onboarding_id = NEW.onboarding_id
    AND status = 'completed';

    -- Calculate progress percentage
    new_progress := (completed_steps * 100) / total_steps;

    -- Update client_onboarding table
    UPDATE client_onboarding
    SET progress_percent = new_progress,
        current_step = NEW.step_number + 1,
        updated_at = NOW()
    WHERE id = NEW.onboarding_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update progress when step is completed
CREATE TRIGGER trigger_update_onboarding_progress
AFTER UPDATE ON onboarding_steps
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE FUNCTION update_onboarding_progress();
