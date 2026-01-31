-- Migration: Helper Functions for Platform Features
-- Utility functions for common operations

-- ============================================
-- NOTIFICATION HELPER FUNCTION
-- ============================================

-- Function to create notifications easily
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_link VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (p_user_id, p_type, p_title, p_message, p_link)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUTO-NOTIFY ON NEW MESSAGE
-- ============================================

-- Trigger to notify project participants of new messages
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
    v_participant RECORD;
    v_sender_name VARCHAR;
BEGIN
    -- Get sender name
    SELECT name INTO v_sender_name FROM users WHERE id = NEW.sender_id;
    
    -- Notify all project participants except sender
    FOR v_participant IN
        SELECT DISTINCT user_id
        FROM (
            -- Get participants from project_participants table
            SELECT user_id FROM project_participants WHERE project_id = NEW.project_id
            UNION
            -- Get client
            SELECT c.user_id FROM projects p
            JOIN clients c ON c.id = p.client_id
            WHERE p.id = NEW.project_id
            UNION
            -- Get commissioner
            SELECT comm.user_id FROM projects p
            JOIN commissioners comm ON comm.id = p.commissioner_id
            WHERE p.id = NEW.project_id
        ) AS all_participants
        WHERE user_id != NEW.sender_id
    LOOP
        PERFORM create_notification(
            v_participant.user_id,
            'message_received',
            'New Message',
            v_sender_name || ' sent a message in your project',
            '/dashboard/projects/' || NEW.project_id::TEXT
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_on_message ON messages;
CREATE TRIGGER trigger_notify_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_new_message();

-- ============================================
-- AUTO-NOTIFY ON JOB POSTED
-- ============================================

-- Trigger to notify commissioners when jobs are posted
CREATE OR REPLACE FUNCTION notify_on_job_posted()
RETURNS TRIGGER AS $$
DECLARE
    v_commissioner RECORD;
BEGIN
    -- Only notify when job is opened
    IF NEW.status = 'open' THEN
        -- Notify all verified commissioners
        FOR v_commissioner IN
            SELECT u.id FROM users u
            JOIN commissioners c ON c.user_id = u.id
            WHERE c.verified_at IS NOT NULL
        LOOP
            PERFORM create_notification(
                v_commissioner.id,
                'job_posted',
                'New Job Available',
                'A new job "' || NEW.title || '" has been posted',
                '/jobs'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_on_job ON leads;
CREATE TRIGGER trigger_notify_on_job
    AFTER INSERT ON leads
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_job_posted();

-- ============================================
-- AUTO-NOTIFY ON PROJECT CREATED
-- ============================================

-- Trigger to notify participants when project is created
CREATE OR REPLACE FUNCTION notify_on_project_created()
RETURNS TRIGGER AS $$
DECLARE
    v_client_user_id UUID;
    v_commissioner_user_id UUID;
BEGIN
    -- Get client user ID
    SELECT user_id INTO v_client_user_id
    FROM clients WHERE id = NEW.client_id;
    
    -- Get commissioner user ID
    SELECT user_id INTO v_commissioner_user_id
    FROM commissioners WHERE id = NEW.commissioner_id;
    
    -- Notify client
    IF v_client_user_id IS NOT NULL THEN
        PERFORM create_notification(
            v_client_user_id,
            'project_created',
            'Project Created',
            'Your project "' || NEW.title || '" has been created',
            '/dashboard/projects/' || NEW.id::TEXT
        );
    END IF;
    
    -- Notify commissioner
    IF v_commissioner_user_id IS NOT NULL THEN
        PERFORM create_notification(
            v_commissioner_user_id,
            'project_created',
            'New Project Assigned',
            'You have been assigned to project "' || NEW.title || '"',
            '/dashboard/projects/' || NEW.id::TEXT
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_on_project ON projects;
CREATE TRIGGER trigger_notify_on_project
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_project_created();

-- ============================================
-- GET USER'S UNREAD NOTIFICATION COUNT
-- ============================================

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM notifications
    WHERE user_id = p_user_id AND read_at IS NULL;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MARK ALL NOTIFICATIONS AS READ
-- ============================================

CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications
    SET read_at = NOW()
    WHERE user_id = p_user_id AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET PROJECT STATISTICS
-- ============================================

CREATE OR REPLACE FUNCTION get_project_statistics(p_project_id UUID)
RETURNS JSON AS $$
DECLARE
    v_stats JSON;
BEGIN
    SELECT json_build_object(
        'total_messages', (SELECT COUNT(*) FROM messages WHERE project_id = p_project_id),
        'total_participants', (
            SELECT COUNT(DISTINCT user_id) FROM (
                SELECT user_id FROM project_participants WHERE project_id = p_project_id
                UNION
                SELECT c.user_id FROM projects p
                JOIN clients c ON c.id = p.client_id
                WHERE p.id = p_project_id
                UNION
                SELECT comm.user_id FROM projects p
                JOIN commissioners comm ON comm.id = p.commissioner_id
                WHERE p.id = p_project_id
            ) AS all_users
        ),
        'created_at', (SELECT created_at FROM projects WHERE id = p_project_id),
        'last_activity', (SELECT MAX(created_at) FROM messages WHERE project_id = p_project_id)
    ) INTO v_stats;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 013: Helper Functions and Triggers - COMPLETED';
END $$;
