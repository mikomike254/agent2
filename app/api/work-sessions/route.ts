import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId');
        const developerId = searchParams.get('developerId');

        let query = supabaseAdmin!
            .from('work_sessions')
            .select(`
                *,
                developer:developers(user:users(name, avatar_url)),
                milestone:project_milestones(title)
            `)
            .order('created_at', { ascending: false });

        if (projectId) query = query.eq('project_id', projectId);
        if (developerId) query = query.eq('developer_id', developerId);

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { action, projectId, milestoneId, notes, sessionId } = body;
        const userId = (session.user as any).id;

        // Get developer profile
        const { data: dev } = await supabaseAdmin!
            .from('developers')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!dev && action !== 'stop') {
            return NextResponse.json({ error: 'Only developers can start sessions' }, { status: 403 });
        }

        if (action === 'start') {
            if (!dev) return NextResponse.json({ error: 'Developer profile not found' }, { status: 404 });

            // Check if there's already an active session for this dev
            const { data: existing } = await supabaseAdmin!
                .from('work_sessions')
                .select('id')
                .eq('developer_id', dev.id)
                .eq('status', 'active')
                .single();

            if (existing) {
                return NextResponse.json({ error: 'You already have an active session running.' }, { status: 409 });
            }

            const { data, error } = await supabaseAdmin!
                .from('work_sessions')
                .insert({
                    project_id: projectId,
                    developer_id: dev.id,
                    milestone_id: milestoneId,
                    notes,
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, data });

        } else if (action === 'stop') {
            const { data, error } = await supabaseAdmin!
                .from('work_sessions')
                .update({
                    end_time: new Date().toISOString(),
                    status: 'completed',
                    notes: notes // Update final notes if provided
                })
                .eq('id', sessionId)
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
