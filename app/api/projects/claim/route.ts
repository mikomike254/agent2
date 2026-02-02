import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin, db } from '@/lib/db';

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
        const userRole = (session.user as any).role;

        if (userRole !== 'developer') {
            return NextResponse.json({ error: 'Only developers can claim projects' }, { status: 403 });
        }

        const { projectId } = await req.json();
        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        // 1. Get Developer ID
        const { data: developer } = await supabaseAdmin
            .from('developers')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!developer) {
            return NextResponse.json({ error: 'Developer profile not found' }, { status: 404 });
        }

        // 2. Verify Project is claimable
        const { data: project, error: fetchError } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (fetchError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.project_type !== 'open') {
            return NextResponse.json({ error: 'This project is not open for public claiming' }, { status: 400 });
        }

        if (project.developer_id) {
            return NextResponse.json({ error: 'This project has already been claimed' }, { status: 409 });
        }

        // 3. Claim the project
        const { data: updatedProject, error: claimError } = await supabaseAdmin
            .from('projects')
            .update({
                developer_id: developer.id,
                status: 'active',
                project_type: 'active', // Mark as no longer in pool
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId)
            .select()
            .single();

        if (claimError) throw claimError;

        // 4. Add to Project Members
        await supabaseAdmin.from('project_members').insert({
            project_id: projectId,
            user_id: userId,
            role: 'developer'
        });

        // 5. Audit Log
        await db.createAuditLog(
            userId,
            'developer',
            'project_claimed',
            { project_id: projectId, title: project.title }
        );

        return NextResponse.json({
            success: true,
            data: updatedProject,
            message: 'Project claimed successfully! It is now in your active pipeline.'
        });

    } catch (error: any) {
        console.error('Error claiming project:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
