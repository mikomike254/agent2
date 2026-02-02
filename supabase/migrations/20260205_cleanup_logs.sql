-- Migration: Cleanup Redundant Logs
-- Description: Drops the unused 'nexus_activity_logs' table in favor of 'audit_logs'.

DROP TABLE IF EXISTS nexus_activity_logs;

-- Ensure audit_logs has all needed columns (just in case)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='metadata') THEN
        ALTER TABLE audit_logs ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;
