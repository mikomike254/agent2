import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { emailjsService } from '@/lib/emailjs';

export async function POST(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'commissioner') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const commissionerUserId = (session.user as any).id;
        const commissionerName = session.user.name || 'Your Commissioner';
        const body = await req.json();
        const {
            clientName,
            clientEmail,
            projectTitle,
            projectDescription,
            budget,
            service,
            milestones,
            projectType = 'direct'
        } = body;

        if (!clientEmail || !projectTitle) {
            return NextResponse.json({ error: 'Client email and project title are required' }, { status: 400 });
        }

        // 1. Resolve Commissioner ID
        const { data: commissioner } = await supabaseAdmin
            .from('commissioners')
            .select('id')
            .eq('user_id', commissionerUserId)
            .single();

        if (!commissioner) {
            return NextResponse.json({ error: 'Commissioner profile not found' }, { status: 404 });
        }

        // 2. Check if client user exists
        let { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id, name')
            .eq('email', clientEmail)
            .single();

        let clientRecord;
        if (existingUser) {
            // Check if they have a client record
            const { data: existingClient } = await supabaseAdmin
                .from('clients')
                .select('id')
                .eq('user_id', existingUser.id)
                .single();
            clientRecord = existingClient;
        }

        // 3. Create user/client if doesn't exist (simulated onboarding)
        // In a real app, you might send an invite email
        if (!existingUser) {
            const { data: newUser, error: userError } = await supabaseAdmin
                .from('users')
                .insert({
                    email: clientEmail,
                    name: clientName,
                    role: 'client',
                    // Note: In a production app, we'd handle password/auth separately (e.g., magic link)
                })
                .select()
                .single();
            if (userError) throw userError;
            existingUser = newUser;
        }

        if (!clientRecord && existingUser) {
            const { data: newClient, error: clientError } = await supabaseAdmin
                .from('clients')
                .insert({
                    user_id: existingUser.id,
                    contact_person: clientName
                })
                .select()
                .single();
            if (clientError) throw clientError;
            clientRecord = newClient;
        }

        // 4. Create Project with 'proposed' status
        const projectId = clientRecord.id;
        const commId = commissioner.id;

        const { data: project, error: projectError } = await supabaseAdmin
            .from('projects')
            .insert({
                client_id: projectId,
                commissioner_id: commId,
                title: projectTitle,
                description: projectDescription,
                total_value: budget || 0,
                status: 'proposed',
                project_type: projectType,
                category: 'general',
                onboarding_email: clientEmail,
                onboarding_name: clientName,
                proposed_service: service,
                currency: 'KES'
            })
            .select()
            .single();

        if (projectError) throw projectError;

        // 5. Create Milestones if provided
        if (milestones && Array.isArray(milestones) && milestones.length > 0) {
            const { error: milestoneError } = await supabaseAdmin
                .from('project_milestones')
                .insert(
                    milestones.map((m: any, index: number) => ({
                        project_id: project.id,
                        title: m.title,
                        description: m.description || '',
                        percent_amount: m.percent_amount || 0,
                        order_index: index,
                        status: 'pending'
                    }))
                );
            if (milestoneError) {
                console.error('Milestone creation error:', milestoneError);
            }
        }

        // 6. Send Invitation Email via EmailJS
        await emailjsService.sendUniversalEmail({
            subject: `Welcome to Tech Developers - Project Proposal from ${commissionerName}`,
            client_name: clientName,
            to_email: clientEmail,
            message_body: `Hello ${clientName}, ${commissionerName} has created a new project proposal for you: "${projectTitle}". You can review the details, milestones, and budget on your private dashboard.`,
            call_to_action_link: `${process.env.NEXTAUTH_URL}/login`
        });

        return NextResponse.json({
            success: true,
            data: project,
            message: 'Onboarding request sent successfully'
        });

    } catch (error: any) {
        console.error('Onboarding error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
