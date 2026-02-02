-- Migration: Commissioner Branding Extension
ALTER TABLE commissioners 
ADD COLUMN IF NOT EXISTS branding_config JSONB DEFAULT '{
    "primaryColor": "#5347CE",
    "logoUrl": null,
    "displayName": null,
    "theme": "onyx"
}';

-- Index for branding lookups
CREATE INDEX IF NOT EXISTS idx_commissioners_branding ON commissioners USING GIN (branding_config);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
