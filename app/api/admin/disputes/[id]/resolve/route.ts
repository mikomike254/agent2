import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { logCreativeActivity } from '@/lib/audit';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: disputeId } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { resolution, status, action } = await req.json();

        if (!disputeId) return NextResponse.json({ error: 'Dispute ID required' }, { status: 400 });

        // Fetch dispute to get project info
        const { data: dispute, error: fetchError } = await supabaseAdmin!
            .from('disputes')
            .select('*, project:projects(*)')
            .eq('id', disputeId)
            .single();

        if (fetchError || !dispute) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });

        // Update dispute
        const { error: updateError } = await supabaseAdmin!
            .from('disputes')
            .update({
                status,
                resolution,
                resolved_at: new Date().toISOString(),
                investigator_notes: (dispute.investigator_notes || '') + `\n[Admin ${session.user.email}]: ${resolution}`
            })
            .eq('id', disputeId);

        if (updateError) throw updateError;

        // Log the arbitration activity
        await logCreativeActivity({
            actor_id: (session.user as any).id,
            actor_email: session.user.email || undefined,
            actor_role: 'admin',
            action: `RESOLVE_DISPUTE_${status.toUpperCase()}`,
            entity_type: 'dispute',
            entity_id: disputeId,
            details: { resolution, projectId: dispute.project_id }
        });

        // If action includes auto-handling escrow (Optional enhancement)
        if (action === 'release_escrow' && dispute.project?.id) {
            // Logic to release to developer
        } else if (action === 'refund_client' && dispute.project?.id) {
            // Logic to refund client
        }

        return NextResponse.json({ success: true, message: 'Dispute updated successfully' });

    } catch (error: any) {
        console.error('Dispute resolution error:', error);
        return NextResponse.json({ error: 'Failed to resolve dispute' }, { status: 500 });
    }
}
