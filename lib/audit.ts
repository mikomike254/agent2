import { supabaseAdmin } from './db';

interface ActivityLog {
    actor_id?: string;
    actor_email?: string;
    actor_role?: string;
    action: string;
    entity_type?: string;
    entity_id?: string;
    details?: any;
    ip_address?: string;
    user_agent?: string;
}

export async function logCreativeActivity(log: ActivityLog) {
    if (!supabaseAdmin) {
        console.warn('Logging attempt failed: Supabase Admin not initialized');
        return;
    }

    try {
        const { error } = await supabaseAdmin
            .from('nexus_activity_logs')
            .insert({
                actor_id: log.actor_id,
                actor_email: log.actor_email,
                actor_role: log.actor_role,
                action: log.action,
                entity_type: log.entity_type,
                entity_id: log.entity_id,
                details: log.details || {},
                ip_address: log.ip_address,
                user_agent: log.user_agent
            });

        if (error) {
            console.error('Database logging error:', error);
        }
    } catch (err) {
        console.error('Creative audit logging failed unexpectedly:', err);
    }
}
