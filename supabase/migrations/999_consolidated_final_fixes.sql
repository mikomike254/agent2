-- Consolidated Final Schema Fixes Migration
-- Run this migration to ensure all required columns exist across role tables

-- ==============================================
-- 1. PROJECTS TABLE
-- ==============================================

-- Add category column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='projects' AND column_name='category') THEN
        ALTER TABLE projects ADD COLUMN category VARCHAR(100) DEFAULT 'general';
    END IF;
END $$;

-- ==============================================
-- 2. COMMISSIONERS TABLE
-- ==============================================

-- Standardize completed count (Adding both synonyms to prevent failures)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commissioners' AND column_name='projects_completed') THEN
        ALTER TABLE commissioners ADD COLUMN projects_completed INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commissioners' AND column_name='completed_count') THEN
        ALTER TABLE commissioners ADD COLUMN completed_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add profile fields
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commissioners' AND column_name='bio') THEN
        ALTER TABLE commissioners ADD COLUMN bio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commissioners' AND column_name='specialization') THEN
        ALTER TABLE commissioners ADD COLUMN specialization VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commissioners' AND column_name='rating') THEN
        ALTER TABLE commissioners ADD COLUMN rating NUMERIC(3,2) DEFAULT 5.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commissioners' AND column_name='tier') THEN
        ALTER TABLE commissioners ADD COLUMN tier VARCHAR(50) DEFAULT 'bronze';
    END IF;
END $$;

-- ==============================================
-- 3. DEVELOPERS TABLE
-- ==============================================

-- Standardize metrics
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='developers' AND column_name='rating') THEN
        ALTER TABLE developers ADD COLUMN rating NUMERIC(3,2) DEFAULT 5.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='developers' AND column_name='projects_completed') THEN
        ALTER TABLE developers ADD COLUMN projects_completed INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='developers' AND column_name='bio') THEN
        ALTER TABLE developers ADD COLUMN bio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='developers' AND column_name='specialization') THEN
        ALTER TABLE developers ADD COLUMN specialization VARCHAR(255);
    END IF;
END $$;

-- ==============================================
-- 4. USERS TABLE
-- ==============================================

-- Ensure avatar_url exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- ==============================================
-- 5. PERFORMANCE INDEXES
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_commissioners_tier ON commissioners(tier);
CREATE INDEX IF NOT EXISTS idx_commissioners_rating ON commissioners(rating);
CREATE INDEX IF NOT EXISTS idx_developers_rating ON developers(rating);

-- ==============================================
-- 6. DATA CONSOLIDATION & ONBOARDING SUPPORT
-- ==============================================
DO $$ 
BEGIN 
    -- Onboarding metadata for projects
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='proposed_service') THEN
        ALTER TABLE projects ADD COLUMN proposed_service VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='onboarding_email') THEN
        ALTER TABLE projects ADD COLUMN onboarding_email VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='onboarding_name') THEN
        ALTER TABLE projects ADD COLUMN onboarding_name VARCHAR(255);
    END IF;
END $$;

UPDATE commissioners SET tier = 'bronze' WHERE tier IS NULL;
UPDATE commissioners SET rating = 5.00 WHERE rating IS NULL;
UPDATE developers SET rating = 5.00 WHERE rating IS NULL;
UPDATE developers SET projects_completed = 0 WHERE projects_completed IS NULL;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Consolidated schema migration standard (Nexus Universal) completed successfully';
END $$;
