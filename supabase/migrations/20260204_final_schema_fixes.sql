-- Migration: Final Schema & Infrastructure Fixes
-- Description: Ensures the category column exists in projects and adds support for commissioner profile metrics.

-- 1. Ensure projects.category exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='category') THEN
        ALTER TABLE projects ADD COLUMN category VARCHAR(100) DEFAULT 'general';
    END IF;
END $$;

-- 2. Add commissioner bio and metrics if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commissioners' AND column_name='bio') THEN
        ALTER TABLE commissioners ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commissioners' AND column_name='specialization') THEN
        ALTER TABLE commissioners ADD COLUMN specialization VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commissioners' AND column_name='projects_completed') THEN
        ALTER TABLE commissioners ADD COLUMN projects_completed INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commissioners' AND column_name='rating') THEN
        ALTER TABLE commissioners ADD COLUMN rating NUMERIC(3, 2) DEFAULT 5.00;
    END IF;
END $$;

-- 3. Ensure users have avatar_url (Client visibility)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 4. Re-grant permissions for schema cache refresh
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
