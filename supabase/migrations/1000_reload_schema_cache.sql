-- Reload PostgREST Schema Cache
-- This is required when columns are added but API requests fail with "Could not find the column..."

NOTIFY pgrst, 'reload config';

-- Re-assert column existence just in case, this is idempotent
COMMENT ON COLUMN projects.category IS 'Project category: web_dev, mobile_app, ui_ux, backend, etc.';
