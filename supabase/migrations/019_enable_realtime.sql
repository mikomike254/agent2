-- Migration 019: Enable Realtime on relevant tables
-- This migration enables Supabase Realtime functionality for live synchronization

-- Enable Realtime on core tables for live updates across dashboards

-- User management tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE commissioners;
ALTER PUBLICATION supabase_realtime ADD TABLE developers;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;

-- Lead and project tables
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE project_milestones;

-- Financial tables
ALTER PUBLICATION supabase_realtime ADD TABLE commissions;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE payouts;

-- Communication tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Activity tracking
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;

-- Dispute management
ALTER PUBLICATION supabase_realtime ADD TABLE disputes;

-- Optional: Enable on additional tables
-- ALTER PUBLICATION supabase_realtime ADD TABLE escrow_ledger;
-- ALTER PUBLICATION supabase_realtime ADD TABLE files;

-- Note: RLS policies already exist on these tables from previous migrations
-- Realtime will respect existing RLS policies automatically
-- Users will only receive real-time updates for rows they have access to

-- Create a helper function to check if realtime is enabled
CREATE OR REPLACE FUNCTION is_realtime_enabled(table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = table_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_realtime_enabled(text) TO authenticated;
