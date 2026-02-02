// app/api/onboarding/accept/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { projectId } = body;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        // 1. Verify user is the client for this project
        const { data: project } = await supabaseAdmin
            .from('projects')
            .select('*, client:clients(*)')
            .eq('id', projectId)
            .single();

        if (!project || project.client.user_id !== userId) {
            return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
        }

        if (project.status !== 'proposed') {
            return NextResponse.json({ error: 'Project is already processed' }, { status: 400 });
        }

        // 2. Accept project - Change status to 'active' or 'deposit_pending'
        // For our flow, let's go to 'deposit_pending' to ensure commitment
        const { data: updatedProject, error: updateError } = await supabaseAdmin
            .from('projects')
            .update({ status: 'deposit_pending', accepted_at: new Date().toISOString() })
            .eq('id', projectId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 3. Create initial milestones (optional, but good practice)
        await supabaseAdmin.from('project_milestones').insert([
            { project_id: projectId, title: 'Project Kickoff', description: 'Initial briefing and repository setup.', status: 'pending', order_index: 0 },
            { project_id: projectId, title: 'UI/UX Design Phase', description: 'Drafting high-fidelity mockups.', status: 'pending', order_index: 1 },
            { project_id: projectId, title: 'Final Review', description: 'Testing and client approval.', status: 'pending', order_index: 2 }
        ]);

        return NextResponse.json({
            success: true,
            data: updatedProject,
            message: 'Project accepted successfully! Proceed to deposit.'
        });

    } catch (error: any) {
        console.error('Accept error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
