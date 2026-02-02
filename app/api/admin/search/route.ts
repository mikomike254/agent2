import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ success: true, results: [] });
        }

        // Parallel search across tables
        const [usersSearch, projectsSearch, leadsSearch, paymentsSearch] = await Promise.all([
            supabaseAdmin
                .from('users')
                .select('id, name, email, role')
                .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
                .limit(5),
            supabaseAdmin
                .from('projects')
                .select('id, title, status')
                .ilike('title', `%${query}%`)
                .limit(5),
            supabaseAdmin
                .from('leads')
                .select('id, name, title, status')
                .or(`name.ilike.%${query}%,title.ilike.%${query}%`)
                .limit(5),
            supabaseAdmin
                .from('payments')
                .select('id, amount, status, reference')
                .or(`reference.ilike.%${query}%`)
                .limit(5)
        ]);

        const results = [
            ...(usersSearch.data?.map(u => ({ ...u, type: 'user' })) || []),
            ...(projectsSearch.data?.map(p => ({ ...p, type: 'project' })) || []),
            ...(leadsSearch.data?.map(l => ({ ...l, type: 'lead' })) || []),
            ...(paymentsSearch.data?.map(pay => ({ ...pay, type: 'payment' })) || [])
        ];

        return NextResponse.json({
            success: true,
            results,
            count: results.length
        });

    } catch (error: any) {
        console.error('Admin search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
