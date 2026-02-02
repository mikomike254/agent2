import { supabaseAdmin } from '../db';

/**
 * Sentinel: The Autonomous Watcher
 * Periodically scans for high-risk projects and triggers system alerts.
 */
export const runSentinelAudit = async () => {
    try {
        if (!supabaseAdmin) return { success: false, error: 'Supabase Admin not initialized' };

        // 1. Fetch high-risk candidates
        // Criteria: Health < 50 OR Status is 'in_dispute'
        const { data: risks, error } = await supabaseAdmin
            .from('projects')
            .select(`
                id,
                title,
                health_score,
                status,
                commissioner:commissioners(user_id),
                client:clients(user_id)
            `)
            .or('health_score.lt.50,status.eq.in_dispute');

        if (error) throw error;
        if (!risks || risks.length === 0) return { success: true, message: 'Platform integrity verified. No critical risks detected.' };

        // 2. Process each risk
        for (const project of risks) {
            // Check if alert already exists (anti-spam)
            const { data: existing } = await supabaseAdmin
                .from('notifications')
                .select('id')
                .eq('metadata->projectId', project.id)
                .eq('title', 'Sentinel Risk Alert')
                .limit(1);

            if (existing && existing.length > 0) continue;

            const alertTitle = 'Sentinel Risk Alert';
            const alertBody = `Project "${project.title}" (Node ${project.id.slice(0, 8)}) has a critical stability rating of ${project.health_score}%. Immediate intervention recommended.`;

            // Notify Admin (Assume admin user ID exists or broadcast to admin role)
            // Fetch all admins
            const { data: admins } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('role', 'admin');

            if (admins) {
                for (const admin of admins) {
                    await supabaseAdmin.from('notifications').insert({
                        user_id: admin.id,
                        title: alertTitle,
                        body: alertBody,
                        channel: 'system',
                        metadata: { projectId: project.id, level: 'critical' }
                    });
                }
            }

            // Also notify Commissioner
            const commUserId = Array.isArray(project.commissioner)
                ? project.commissioner[0]?.user_id
                : (project.commissioner as any)?.user_id;

            if (commUserId) {
                await supabaseAdmin.from('notifications').insert({
                    user_id: commUserId,
                    title: 'System Stability Warning',
                    body: `Your project "${project.title}" is showing signs of high risk. AI Audit recommends a sync with your developer.`,
                    channel: 'system',
                    metadata: { projectId: project.id, type: 'stability_warning' }
                });
            }
        }

        return { success: true, processed: risks.length };

    } catch (err) {
        console.error('Sentinel Audit Failed:', err);
        return { success: false, error: err };
    }
};
