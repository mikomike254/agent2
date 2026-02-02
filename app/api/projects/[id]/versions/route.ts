import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { emailjsService } from '@/lib/emailjs';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!supabaseAdmin) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: versions, error } = await supabaseAdmin
            .from('project_versions')
            .select('*')
            .eq('project_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ success: true, data: versions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!supabaseAdmin) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { version_label, review_url, description } = body;

        // 1. Insert version
        const { data: version, error } = await supabaseAdmin
            .from('project_versions')
            .insert({
                project_id: id,
                developer_id: (session.user as any).id,
                version_label,
                review_url,
                description,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Fetch project and client details for notification
        const { data: projectData } = await supabaseAdmin
            .from('projects')
            .select(`
                title,
                client:clients!inner(
                    user:users!inner(id, email, name)
                )
            `)
            .eq('id', id)
            .single();

        const project = projectData as any;

        if (project?.client?.user) {
            const client = project.client.user;

            // 3. Send notification via EmailJS
            await emailjsService.sendUniversalEmail({
                subject: `New Development Version Ready: ${project.title}`,
                client_name: client.name || 'Client',
                to_email: client.email!,
                message_body: `A new version (${version_label}) of your project "${project.title}" has been submitted for your review. Description: ${description}`,
                call_to_action_link: `${process.env.NEXTAUTH_URL}/dashboard/client/projects/${id}`
            });
        }

        return NextResponse.json({ success: true, data: version });
    } catch (error: any) {
        console.error('Error submitting version:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
