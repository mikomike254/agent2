import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const { id } = await params;

        const { data, error } = await supabaseAdmin
            .from('client_onboarding_sessions')
            .select(`
                *,
                commissioner:commissioners(
                    id,
                    user:users(name, avatar_url, email, phone)
                )
            `)
            .eq('id', id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Onboarding session not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Public Onboarding Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const { id } = await params;
        const body = await req.json();

        // Allow updating specific fields from the client side
        const { client_email, client_phone, project_scope, metadata, progress_percent, status } = body;

        const { data, error } = await supabaseAdmin
            .from('client_onboarding_sessions')
            .update({
                client_email,
                client_phone,
                project_scope,
                metadata,
                progress_percent,
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Public Onboarding Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
