import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const role = searchParams.get('role');
        const action = searchParams.get('action');

        let query = supabaseAdmin!
            .from('audit_logs')
            .select('*, actor:users(email, name)')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (role) query = query.eq('actor_role', role);
        if (action) query = query.ilike('action', `%${action}%`);

        const { data, error } = await query;

        if (error) throw error;

        // Map standard audit_logs to frontend expected format
        const activities = data.map((log: any) => ({
            id: log.id,
            action: log.action,
            actor_role: log.actor_role,
            actor_email: log.actor?.email || 'System',
            actor_name: log.actor?.name,
            entity_type: log.details?.gateway ? 'payment' : 'unknown', // Simple heuristic
            entity_id: log.details?.payment_id || log.details?.project_id,
            created_at: log.created_at,
            details: log.details
        }));

        return NextResponse.json({ success: true, activities });

    } catch (error: any) {
        console.error('Activity fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
    }
}
