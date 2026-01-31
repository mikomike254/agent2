// API: Convert Job/Lead to Project
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { leadId, title, description, budget } = await req.json();

        // Get user data
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('id, role')
            .eq('email', session.user.email)
            .single();

        if (!userData) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Get lead data
        const { data: lead, error: leadError } = await supabaseAdmin
            .from('leads')
            .select('*, client_id, claimed_by')
            .eq('id', leadId)
            .single();

        if (leadError || !lead) {
            return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
        }

        // Verify permissions (client who created it OR commissioner who claimed it)
        const canConvert =
            (userData.role === 'client' && lead.client_id) ||
            (userData.role === 'commissioner' && lead.claimed_by);

        if (!canConvert) {
            return NextResponse.json({
                success: false,
                message: 'Only the client or assigned commissioner can convert this to a project'
            }, { status: 403 });
        }

        // Create project
        const { data: project, error: projectError } = await supabaseAdmin
            .from('projects')
            .insert({
                title: title || lead.title,
                description: description || lead.description,
                budget: budget || lead.budget,
                client_id: lead.client_id,
                commissioner_id: lead.claimed_by,
                status: 'planning'
            })
            .select()
            .single();

        if (projectError) {
            return NextResponse.json({
                success: false,
                message: `Failed to create project: ${projectError.message}`
            }, { status: 500 });
        }

        // Update lead status
        await supabaseAdmin
            .from('leads')
            .update({
                status: 'converted',
                project_id: project.id
            })
            .eq('id', leadId);

        // Create audit log
        await supabaseAdmin.from('audit_logs').insert({
            actor_id: userData.id,
            actor_role: userData.role,
            action: 'project_created_from_lead',
            details: { lead_id: leadId, project_id: project.id }
        });

        return NextResponse.json({
            success: true,
            data: project,
            message: 'Project created successfully! You can now add milestones and team members.'
        });

    } catch (error: any) {
        console.error('Project creation error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
