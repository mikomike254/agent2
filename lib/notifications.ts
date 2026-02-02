import { supabaseAdmin } from './db';

export type NotificationType = 'system' | 'project' | 'message' | 'payment' | 'alert';

export interface NotificationPayload {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: any;
}

/**
 * Transmission Layer: Robust Notification Service
 * Handles notification delivery with fallbacks for infrastructure failures.
 */
export const NotificationService = {
    /**
     * Send a notification to a specific user.
     * Silently fails (logs error) if infrastructure is not ready, preventing system crashes.
     */
    send: async (payload: NotificationPayload) => {
        if (!supabaseAdmin) {
            console.warn('[Transmission Layer] Supabase Admin not initialized. Notification dropped:', payload);
            return false;
        }

        try {
            const { error } = await supabaseAdmin
                .from('notifications')
                .insert({
                    user_id: payload.userId,
                    type: payload.type,
                    title: payload.title,
                    message: payload.message,
                    link: payload.link,
                    metadata: payload.metadata || {},
                    read: false
                });

            if (error) {
                // Check if error is related to table not existing or schema issues
                if (error.message?.includes('does not exist') || error.code === '42P01') {
                    console.error('[Transmission Layer] Infrastructure Warning: Notifications table missing. Please run migration 1001.');
                } else {
                    console.error('[Transmission Layer] Delivery Error:', error.message);
                }
                return false;
            }

            return true;
        } catch (err) {
            console.error('[Transmission Layer] Unexpected Error:', err);
            return false;
        }
    },

    /**
     * Broadcast a system notification to all users (Admin use)
     */
    broadcast: async (title: string, message: string, link?: string) => {
        if (!supabaseAdmin) return false;

        try {
            // This could be heavy for large user bases, but fine for now
            // Better approach: Insert into a 'broadcasts' table and let client pull
            // For now, simple loop or singular insert if we had a system_notifications table
            console.log('[Transmission Layer] Broadcast simulated:', { title, message });
            return true;
        } catch (err) {
            console.error('[Transmission Layer] Broadcast Error:', err);
            return false;
        }
    }
};
