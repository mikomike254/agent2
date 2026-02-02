import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { emailjsService } from '@/lib/emailjs';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> }
) {
    try {
        const { id, versionId } = await params;
        if (!supabaseAdmin) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { status, client_feedback } = body;

        // 1. Update version status
        const { data: version, error } = await supabaseAdmin
            .from('project_versions')
            .update({
                status,
                client_feedback,
                updated_at: new Date().toISOString()
            })
            .eq('id', versionId)
            .select()
            .single();

        if (error) throw error;

        // 2. Fetch project and developer details for notification
        const { data: projectData } = await supabaseAdmin
            .from('projects')
            .select(`
                title,
                developer:developers!inner(
                    user:users!inner(id, email, name)
                )
            `)
            .eq('id', id)
            .single();

        const project = projectData as any;

        if (project?.developer?.user) {
            const developer = project.developer.user;

            // 3. Send notification via EmailJS
            await emailjsService.sendUniversalEmail({
                subject: `Project Update: Version ${status.toUpperCase()} - ${project.title}`,
                client_name: developer.name || 'Developer',
                to_email: developer.email!,
                message_body: `The client has reviewed version ${version.version_label} of "${project.title}". Status: ${status}. Feedback: ${client_feedback || 'No feedback provided.'}`,
                call_to_action_link: `${process.env.NEXTAUTH_URL}/dashboard/developer/projects/${id}`
            });
        }

        return NextResponse.json({ success: true, data: version });
    } catch (error: any) {
        console.error('Error reviewing version:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
