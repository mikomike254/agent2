-- Universal activity logging system
CREATE TABLE IF NOT EXISTS nexus_activity_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    actor_id UUID REFERENCES users(id),
    actor_email TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast feed generation
CREATE INDEX IF NOT EXISTS idx_nexus_activity_logs_created_at ON nexus_activity_logs(created_at DESC);

-- Function to handle conflict resolution updates
CREATE OR REPLACE FUNCTION resolve_dispute(
    dispute_id UUID,
    admin_id UUID,
    resolution_text TEXT,
    new_status dispute_status
) RETURNS VOID AS $$
BEGIN
    UPDATE disputes
    SET 
        status = new_status,
        resolution = resolution_text,
        resolved_at = NOW(),
        investigator_notes = investigator_notes || '\n--- Resolved by admin ' || admin_id || ' ---\n' || resolution_text
    WHERE id = dispute_id;

    INSERT INTO nexus_activity_logs (actor_id, action, entity_type, entity_id, details)
    VALUES (admin_id, 'RESOLVE_DISPUTE', 'dispute', dispute_id, json_build_object('status', new_status, 'resolution', resolution_text));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
