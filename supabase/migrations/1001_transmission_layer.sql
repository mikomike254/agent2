-- Migration 1001: Transmission Layer & Schema Fixes
-- Standardized for Web-App Synchronization

-- 1. Standardize Notifications Table
-- We drop and recreate to ensure perfect alignment with NotificationMenu.tsx
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL, -- 'system', 'project', 'message', 'payment'
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    link VARCHAR(255),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- 2. Align Role Tables (Consolidated Fixes)
DO $$ 
BEGIN 
    -- Clients Alignment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='phone') THEN
        ALTER TABLE clients ADD COLUMN phone VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='bio') THEN
        ALTER TABLE clients ADD COLUMN bio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='company_name') THEN
        ALTER TABLE clients ADD COLUMN company_name VARCHAR(255) DEFAULT 'Independent';
    END IF;

    -- Escrow Ledger Hardening
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='escrow_ledger' AND column_name='description') THEN
        ALTER TABLE escrow_ledger ADD COLUMN description TEXT;
    END IF;
END $$;

-- 3. Reload Schema Cache
NOTIFY pgrst, 'reload config';
