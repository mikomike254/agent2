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

        if (!supabaseAdmin) throw new Error('Supabase Admin not available');

        // Parallel stats fetching
        const [
            { count: totalUsers },
            { count: pendingUsers },
            { count: totalProjects },
            { count: activeProjects },
            { count: openDisputes },
            { data: revenueData }
        ] = await Promise.all([
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('verified', false),
            supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }).in('status', ['active', 'in_progress']),
            supabaseAdmin.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
            supabaseAdmin.from('payments').select('amount').eq('status', 'completed')
        ]);

        const totalRevenue = revenueData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        return NextResponse.json({
            success: true,
            stats: {
                users: { total: totalUsers || 0, pending: pendingUsers || 0 },
                projects: { total: totalProjects || 0, active: activeProjects || 0 },
                disputes: { open: openDisputes || 0 },
                revenue: { total: totalRevenue }
            }
        });

    } catch (error: any) {
        console.error('Metrics fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }
}
