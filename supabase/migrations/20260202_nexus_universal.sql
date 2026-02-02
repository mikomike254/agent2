-- Migration: Nexus Universal Modules (Marketing & KB)
-- Date: 2026-02-02

-- 1. Marketing Assets Table
CREATE TABLE IF NOT EXISTS marketing_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type VARCHAR(50) NOT NULL, -- 'banner', 'email_swipe', 'social_post', 'video'
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    tier_required VARCHAR(50) DEFAULT 'tier1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Knowledge Base Table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    author_id UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Restore Referral Columns to USERS (for general tracking)
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES users(id);

-- 4. Ensure Commissioners have referral_code and parent mapping
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commissioners' AND column_name='referral_code') THEN
        ALTER TABLE commissioners ADD COLUMN referral_code VARCHAR(50) UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commissioners' AND column_name='parent_commissioner_id') THEN
        ALTER TABLE commissioners ADD COLUMN parent_commissioner_id UUID REFERENCES commissioners(id);
    END IF;
END $$;

-- 5. Triggers for updated_at
CREATE TRIGGER update_marketing_assets_updated_at BEFORE UPDATE ON marketing_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
