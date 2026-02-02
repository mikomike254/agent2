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
            .from('nexus_activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (role) query = query.eq('actor_role', role);
        if (action) query = query.ilike('action', `%${action}%`);

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ success: true, activities: data });

    } catch (error: any) {
        console.error('Activity fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
    }
}
