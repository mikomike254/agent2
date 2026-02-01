// app/api/onboarding/[token]/steps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

// POST: Update onboarding step
export async function POST(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    try {
        const { token } = params;
        const body = await req.json();
        const { stepNumber, status, data } = body;

        // Get onboarding session
        const { data: onboarding } = await supabaseAdmin
            .from('client_onboarding')
            .select('id')
            .eq('onboarding_token', token)
            .single();

        if (!onboarding) {
            return NextResponse.json({ error: 'Onboarding session not found' }, { status: 404 });
        }

        // Get the step
        const { data: step } = await supabaseAdmin
            .from('onboarding_steps')
            .select('*')
            .eq('onboarding_id', onboarding.id)
            .eq('step_number', stepNumber)
            .single();

        if (!step) {
            return NextResponse.json({ error: 'Step not found' }, { status: 404 });
        }

        // Update step
        const updateData: any = {};
        if (status) updateData.status = status;
        if (data) updateData.data = data;
        if (status === 'completed') updateData.completed_at = new Date().toISOString();

        const { data: updated, error } = await supabaseAdmin
            .from('onboarding_steps')
            .update(updateData)
            .eq('id', step.id)
            .select()
            .single();

        if (error) throw error;

        // Update onboarding progress if step completed
        if (status === 'completed') {
            // Count completed steps
            const { data: allSteps } = await supabaseAdmin
                .from('onboarding_steps')
                .select('*')
                .eq('onboarding_id', onboarding.id);

            const completedCount = allSteps?.filter(s => s.status === 'completed').length || 0;
            const totalSteps = allSteps?.length || 7;
            const progressPercent = Math.floor((completedCount / totalSteps) * 100);

            await supabaseAdmin
                .from('client_onboarding')
                .update({
                    progress_percent: progressPercent,
                    current_step: stepNumber + 1,
                    status: completedCount === totalSteps ? 'payment_pending' : 'in_progress'
                })
                .eq('id', onboarding.id);
        }

        return NextResponse.json({ success: true, data: updated });

    } catch (error: any) {
        console.error('Error updating onboarding step:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET: Get all steps for an onboarding session
export async function GET(
    req: NextRequest,
    { params }: { params: { token: string } }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    try {
        const { token } = params;

        // Get onboarding session
        const { data: onboarding } = await supabaseAdmin
            .from('client_onboarding')
            .select('id')
            .eq('onboarding_token', token)
            .single();

        if (!onboarding) {
            return NextResponse.json({ error: 'Onboarding session not found' }, { status: 404 });
        }

        // Get all steps
        const { data: steps, error } = await supabaseAdmin
            .from('onboarding_steps')
            .select('*')
            .eq('onboarding_id', onboarding.id)
            .order('step_number', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, data: steps });

    } catch (error: any) {
        console.error('Error fetching onboarding steps:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
