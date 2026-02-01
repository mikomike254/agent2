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
        if (!session || (session.user as any).role !== 'commissioner') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const {
            sessionId,
            client_name,
            client_email,
            client_phone,
            project_title,
            project_description,
            budget
        } = body;

        // Get Commissioner ID
        const { data: commissioner } = await supabaseAdmin
            .from('commissioners')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!commissioner) {
            return NextResponse.json({ error: 'Commissioner profile not found' }, { status: 404 });
        }

        // Create Proposal
        const { data: proposal, error: propError } = await supabaseAdmin
            .from('proposals')
            .insert({
                commissioner_id: commissioner.id,
                client_name,
                client_email,
                client_phone,
                project_title,
                project_description,
                budget,
                status: 'pending_admin_approval'
            })
            .select()
            .single();

        if (propError) throw propError;

        // Link to Onboarding Session if provided
        if (sessionId) {
            await supabaseAdmin
                .from('client_onboarding_sessions')
                .update({
                    proposal_id: proposal.id,
                    status: 'converted'
                })
                .eq('id', sessionId);
        }

        // Create Audit Log
        await supabaseAdmin.from('audit_logs').insert({
            actor_id: userId,
            actor_role: 'commissioner',
            action: 'proposal_submitted',
            details: { proposal_id: proposal.id, session_id: sessionId }
        });

        return NextResponse.json({ success: true, data: proposal });
    } catch (error: any) {
        console.error('Proposal Creation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'commissioner') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const { data: commissioner } = await supabaseAdmin
            .from('commissioners')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!commissioner) {
            return NextResponse.json({ error: 'Commissioner profile not found' }, { status: 404 });
        }

        const { data, error } = await supabaseAdmin
            .from('proposals')
            .select('*')
            .eq('commissioner_id', commissioner.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
