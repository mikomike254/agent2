// app/api/onboarding/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

// GET: Get onboarding session by token
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    try {
        const { token } = await params;

        const { data: onboarding, error } = await supabaseAdmin
            .from('client_onboarding')
            .select(`
                *,
                client:clients (
                    *,
                    user:users (name, email, phone)
                ),
                commissioner:commissioners (
                    *,
                    user:users (name, email, phone, avatar_url)
                ),
                steps:onboarding_steps (*)
            `)
            .eq('onboarding_token', token)
            .single();

        if (error || !onboarding) {
            return NextResponse.json({ error: 'Onboarding session not found' }, { status: 404 });
        }

        // Check if expired
        if (new Date(onboarding.expires_at) < new Date()) {
            await supabaseAdmin
                .from('client_onboarding')
                .update({ status: 'expired' })
                .eq('id', onboarding.id);

            return NextResponse.json({ error: 'Onboarding link has expired' }, { status: 410 });
        }

        return NextResponse.json({ success: true, data: onboarding });

    } catch (error: any) {
        console.error('Error fetching onboarding session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update onboarding session status
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    try {
        const { token } = await params;
        const body = await req.json();
        const { status, currentStep } = body;

        // Get onboarding session
        const { data: onboarding } = await supabaseAdmin
            .from('client_onboarding')
            .select('*')
            .eq('onboarding_token', token)
            .single();

        if (!onboarding) {
            return NextResponse.json({ error: 'Onboarding session not found' }, { status: 404 });
        }

        // Update session
        const updateData: any = {};
        if (status) updateData.status = status;
        if (currentStep) updateData.current_step = currentStep;

        if (status === 'active' || status === 'approved') {
            updateData.completed_at = new Date().toISOString();
        }

        const { data: updated, error } = await supabaseAdmin
            .from('client_onboarding')
            .update(updateData)
            .eq('id', onboarding.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: updated });

    } catch (error: any) {
        console.error('Error updating onboarding session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
