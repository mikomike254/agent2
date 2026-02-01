import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

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

        // Get Commissioner ID
        const { data: commissioner } = await supabaseAdmin
            .from('commissioners')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!commissioner) {
            return NextResponse.json({ error: 'Commissioner profile not found' }, { status: 404 });
        }

        // Fetch onboarding sessions
        const { data, error } = await supabaseAdmin
            .from('client_onboarding_sessions')
            .select('*')
            .eq('commissioner_id', commissioner.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Onboarding Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

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
        const { client_name, client_email, client_phone, project_scope } = body;

        if (!client_name) {
            return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
        }

        // Get Commissioner ID
        const { data: commissioner } = await supabaseAdmin
            .from('commissioners')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!commissioner) {
            return NextResponse.json({ error: 'Commissioner profile not found' }, { status: 404 });
        }

        // Create onboarding session
        const { data, error } = await supabaseAdmin
            .from('client_onboarding_sessions')
            .insert({
                commissioner_id: commissioner.id,
                client_name,
                client_email,
                client_phone,
                project_scope,
                status: 'pending',
                progress_percent: 0
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Onboarding Create Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
