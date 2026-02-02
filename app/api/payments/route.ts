export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ success: false, message: 'Supabase Admin not initialized' }, { status: 500 });
    }
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { role, id: userId } = session.user as any;

    try {
        let query = supabaseAdmin
            .from('payments')
            .select(`
                *,
                projects (
                    title,
                    client_id,
                    developer_id
                )
            `)
            .order('created_at', { ascending: false });

        if (role === 'admin') {
            // Admin sees everything
        } else if (role === 'client') {
            const { data: client } = await supabaseAdmin
                .from('clients')
                .select('id')
                .eq('user_id', userId)
                .single();
            if (client) {
                // Payments made by this client
                // Assuming payment has project_id which links to client_id
                const { data: projects } = await supabaseAdmin
                    .from('projects')
                    .select('id')
                    .eq('client_id', client.id);
                const projectIds = projects?.map(p => p.id) || [];
                query = query.in('project_id', projectIds);
            }
        } else if (role === 'developer') {
            // Filter by developer assigned projects
            const { data: dev } = await supabaseAdmin
                .from('developers')
                .select('id')
                .eq('user_id', userId)
                .single();
            if (dev) {
                // Find projects where dev is assigned directly or via team
                // Simplified: direct assignment for now or via project_developers table
                // Assuming simple project.developer_id for now based on previous code comment, but schema might be m-n.
                // Reverting to previous logic intent but fixing it:
                // query = query.eq('projects.developer_id', userId); // This won't work easily without inner join setup.
                // Let's use projects subquery
                const { data: projects } = await supabaseAdmin
                    .from('projects')
                    .select('id')
                    .eq('developer_id', dev.id); // Assuming simple 1-1 dev assignment for MVP
                const projectIds = projects?.map(p => p.id) || [];
                query = query.in('project_id', projectIds);
            }
        } else if (role === 'commissioner') {
            const { data: comm } = await supabaseAdmin
                .from('commissioners')
                .select('id')
                .eq('user_id', userId)
                .single();
            if (comm) {
                const { data: projects } = await supabaseAdmin
                    .from('projects')
                    .select('id')
                    .eq('commissioner_id', comm.id);
                const projectIds = projects?.map(p => p.id) || [];
                query = query.in('project_id', projectIds);
            }
        } else {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { data: payments, error } = await query;

        if (error) throw error;

        return NextResponse.json({ success: true, data: payments });
    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
