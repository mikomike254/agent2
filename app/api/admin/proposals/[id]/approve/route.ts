import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: proposalId } = await params;

        // 1. Fetch Proposal
        const { data: proposal, error: propError } = await supabaseAdmin
            .from('proposals')
            .select('*')
            .eq('id', proposalId)
            .single();

        if (propError || !proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        if (proposal.status === 'approved') return NextResponse.json({ error: 'Proposal already approved' }, { status: 400 });

        // 2. Ensure Client User exists
        let userId;
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', proposal.client_email)
            .single();

        if (existingUser) {
            userId = existingUser.id;
        } else {
            // Create user for client
            const { data: newUser, error: userError } = await supabaseAdmin
                .from('users')
                .insert({
                    email: proposal.client_email,
                    name: proposal.client_name,
                    phone: proposal.client_phone,
                    role: 'client',
                    status: 'active'
                })
                .select('id')
                .single();

            if (userError) throw userError;
            userId = newUser.id;

            // Create client profile
            await supabaseAdmin.from('clients').insert({
                user_id: userId,
                company_name: proposal.client_name
            });
        }

        const { data: client } = await supabaseAdmin
            .from('clients')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!client) throw new Error('Client profile could not be created or found');

        // 3. Create Project
        const { data: project, error: projectError } = await supabaseAdmin
            .from('projects')
            .insert({
                title: proposal.project_title,
                description: proposal.project_description,
                total_value: proposal.budget || 0,
                client_id: client.id,
                commissioner_id: (proposal.commissioner_id && proposal.commissioner_id !== '') ? proposal.commissioner_id : null,
                status: 'deposit_pending',
                escrow_status: 'no_deposit'
            })
            .select()
            .single();

        if (projectError) throw projectError;

        // 4. Create Milestones (Standard 43%/57%)
        const milestones = [
            {
                project_id: project.id,
                title: 'Initial Security Deposit (43%)',
                percent_amount: 43,
                status: 'pending'
            },
            {
                project_id: project.id,
                title: 'Final Delivery (57%)',
                percent_amount: 57,
                status: 'pending'
            }
        ];

        await supabaseAdmin.from('project_milestones').insert(milestones);

        // 5. Update Proposal
        await supabaseAdmin
            .from('proposals')
            .update({
                status: 'approved',
                admin_notes: 'Approved and project created by admin.'
            })
            .eq('id', proposalId);

        // Update Onboarding Session if linked
        await supabaseAdmin
            .from('client_onboarding_sessions')
            .update({ project_id: project.id })
            .eq('proposal_id', proposalId);

        // 6. Audit Log
        await supabaseAdmin.from('audit_logs').insert({
            actor_id: (session.user as any).id,
            actor_role: 'admin',
            action: 'proposal_approved',
            details: { proposal_id: proposalId, project_id: project.id }
        });

        return NextResponse.json({
            success: true,
            projectId: project.id,
            message: 'Proposal approved and project created successfully.'
        });

    } catch (error: any) {
        console.error('Proposal Approval Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
