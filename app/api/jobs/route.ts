// API Route: Job Posting
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ success: false, message: 'Supabase Admin not initialized' }, { status: 500 });
    }
    try {
        // Public endpoint - anyone can view jobs
        const { data: jobs, error } = await supabaseAdmin
            .from('leads')
            .select(`
                *,
                client:clients(name, company_name),
                claimed_by:commissioners(user_id, users(name))
            `)
            .eq('status', 'open')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: jobs });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ success: false, message: 'Supabase Admin not initialized' }, { status: 500 });
    }
    try {
        const session = await getServerSession();

        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, budget, timeline, requirements, category, commissioner_id } = await req.json();

        // Get client ID from session
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('id, role')
            .eq('email', session.user.email)
            .single();

        if (!userData || userData.role !== 'client') {
            return NextResponse.json({ success: false, message: 'Only clients can post jobs' }, { status: 403 });
        }

        // Get or create client record
        let { data: client } = await supabaseAdmin
            .from('clients')
            .select('id')
            .eq('user_id', userData.id)
            .single();

        if (!client) {
            const { data: newClient } = await supabaseAdmin
                .from('clients')
                .insert({ user_id: userData.id })
                .select()
                .single();
            client = newClient;
        }

        // Create the job as a lead
        const { data: newLead, error } = await supabaseAdmin
            .from('leads')
            .insert({
                client_id: client!.id,
                commissioner_id: commissioner_id || null,
                title,
                description,
                budget,
                timeline,
                requirements,
                category: category || 'general',
                status: 'open',
                source: 'client_posted'
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        // Create audit log
        await supabaseAdmin.from('audit_logs').insert({
            actor_id: userData.id,
            actor_role: 'client',
            action: 'job_posted',
            details: { lead_id: newLead.id, title }
        });

        return NextResponse.json({
            success: true,
            data: newLead,
            message: 'Job posted successfully! It is now visible in the public job board.'
        });

    } catch (error: any) {
        console.error('Job posting error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
