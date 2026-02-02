-- Trigger function for User Signups
CREATE OR REPLACE FUNCTION log_user_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO nexus_activity_logs (
        actor_id, actor_email, actor_role, action, entity_type, entity_id, details
    )
    VALUES (
        NEW.id, NEW.email, NEW.role::text, 'USER_SIGNUP', 'user', NEW.id,
        json_build_object('name', NEW.name, 'role', NEW.role)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for Project Status Changes
CREATE OR REPLACE FUNCTION log_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO nexus_activity_logs (
            actor_id, actor_role, action, entity_type, entity_id, details
        )
        VALUES (
            NEW.client_id, -- Default to client as actor, though effectively system/admin might trigger it
            'system', -- Or derive from auth.uid() if possible, but triggers run as system usually
            'PROJECT_STATUS_CHANGE', 
            'project', 
            NEW.id,
            json_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'title', NEW.title,
                'value', NEW.total_value
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for New Payments
CREATE OR REPLACE FUNCTION log_payment_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO nexus_activity_logs (
        actor_id, action, entity_type, entity_id, details
    )
    VALUES (
        NEW.payer_id, 
        'PAYMENT_INITIATED', 
        'payment', 
        NEW.id,
        json_build_object(
            'amount', NEW.amount,
            'currency', NEW.currency,
            'method', NEW.method
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for New Disputes
CREATE OR REPLACE FUNCTION log_dispute_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO nexus_activity_logs (
        actor_id, action, entity_type, entity_id, details
    )
    VALUES (
        NEW.raised_by, 
        'DISPUTE_RAISED', 
        'dispute', 
        NEW.id,
        json_build_object(
            'reason', NEW.reason,
            'project_id', NEW.project_id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Triggers
DROP TRIGGER IF EXISTS trg_log_user_signup ON users;
CREATE TRIGGER trg_log_user_signup
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION log_user_signup();

DROP TRIGGER IF EXISTS trg_log_project_status ON projects;
CREATE TRIGGER trg_log_project_status
    AFTER UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION log_project_status_change();

DROP TRIGGER IF EXISTS trg_log_payment_creation ON payments;
CREATE TRIGGER trg_log_payment_creation
    AFTER INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION log_payment_creation();

DROP TRIGGER IF EXISTS trg_log_dispute_creation ON disputes;
CREATE TRIGGER trg_log_dispute_creation
    AFTER INSERT ON disputes
    FOR EACH ROW EXECUTE FUNCTION log_dispute_creation();
