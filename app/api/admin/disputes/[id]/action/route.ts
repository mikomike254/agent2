import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { smsService } from '@/lib/sms';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { action } = await req.json();

        // 1. Fetch Dispute & Project Details
        const { data: dispute, error: disputeError } = await supabaseAdmin!
            .from('disputes')
            .select(`
                *,
                project:projects(*),
                client:users!disputes_raised_by_fkey(*)
            `)
            .eq('id', id)
            .single();

        if (disputeError) throw disputeError;

        // 2. Execute Action on Escrow / Database
        let statusUpdate = 'resolved';
        let customMessage = '';

        if (action === 'refund_client') {
            customMessage = 'Arbitration closed: Full refund issued to client.';
            await supabaseAdmin!.from('projects').update({ status: 'cancelled' }).eq('id', dispute.project_id);
        } else if (action === 'release_developer') {
            customMessage = 'Arbitration closed: Funds released to developer.';
            await supabaseAdmin!.from('projects').update({ status: 'completed' }).eq('id', dispute.project_id);
        } else if (action === 'split') {
            customMessage = 'Arbitration closed: Escrow split 50/50 between parties.';
            await supabaseAdmin!.from('projects').update({ status: 'completed' }).eq('id', dispute.project_id);
        }

        // 3. Update Dispute Record
        const { error: updateError } = await supabaseAdmin!
            .from('disputes')
            .update({
                status: 'resolved',
                resolution: customMessage,
                resolved_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // 4. Send Notifications (SMS Simulation)
        if (dispute.client?.phone) {
            await smsService.sendAlert({
                to: dispute.client.phone,
                message: `[CREATIVE.KE] Dispute Resolved: ${customMessage}`
            });
        }

        return NextResponse.json({ success: true, message: customMessage });

    } catch (error: any) {
        console.error('Dispute action error:', error);
        return NextResponse.json({ error: 'Failed to process arbitration' }, { status: 500 });
    }
}
