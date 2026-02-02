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
        const status = searchParams.get('status');

        let query = supabaseAdmin!
            .from('disputes')
            .select(`
                *,
                project:projects(title, id),
                raised_by_user:users!disputes_raised_by_fkey(email, name)
            `)
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);

        const { data: disputes, error } = await query;

        if (error) throw error;

        // Flatten data for UI
        const formatted = disputes.map(d => ({
            ...d,
            project_title: d.project?.title,
            raised_by_email: d.raised_by_user?.email,
            raised_by_name: d.raised_by_user?.name
        }));

        return NextResponse.json({ success: true, disputes: formatted });

    } catch (error: any) {
        console.error('Disputes fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
    }
}
