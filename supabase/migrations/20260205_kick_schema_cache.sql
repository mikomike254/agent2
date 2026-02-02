-- Migration: Kick Schema Cache
-- Description: Triggers a reload of the PostgREST schema cache to ensure new columns like 'category' are recognized.

COMMENT ON TABLE projects IS 'Creative Agency Projects - Refreshed ' || now();
COMMENT ON COLUMN projects.category IS 'Project category for marketplace filtering';

-- Ensure permissions are solid
GRANT SELECT, INSERT, UPDATE ON TABLE projects TO anon, authenticated, service_role;
