import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        let query = supabaseAdmin
            .from('project_milestones')
            .select(`
                *,
                project:projects(title, id)
            `)
            .neq('status', 'completed')
            .order('due_date', { ascending: true });

        // Filter based on role connection to project
        if (role === 'client') {
            const { data: client } = await supabaseAdmin.from('clients').select('id').eq('user_id', userId).single();
            if (client) query = query.eq('project.client_id', client.id);
        } else if (role === 'developer') {
            const { data: developer } = await supabaseAdmin.from('developers').select('id').eq('user_id', userId).single();
            if (developer) query = query.eq('project.developer_id', developer.id);
        } else if (role === 'commissioner') {
            const { data: comm } = await supabaseAdmin.from('commissioners').select('id').eq('user_id', userId).single();
            if (comm) query = query.eq('project.commissioner_id', comm.id);
        }

        const { data: milestones, error } = await query;

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: milestones || []
        });

    } catch (error: any) {
        console.error('Milestones fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
    }
}
