// app/api/admin/approval-requests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

// PUT: Approve or reject approval request
export async function PUT(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        // Only admins can approve/reject
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const params = await props.params;
        const id = params.id;
        const body = await req.json();
        const { status, adminNotes } = body;

        // Validation
        if (!status || (status !== 'approved' && status !== 'rejected')) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Update approval request
        const { data: approval, error } = await supabaseAdmin
            .from('admin_approval_requests')
            .update({
                status,
                admin_notes: adminNotes || null,
                approved_by: userId,
                approved_at: new Date().toISOString()
            })
            .eq('id', id)
            .select(`
                *,
                commissioner:commissioners (
                    user:users (name, email)
                ),
                client:clients (
                    user:users (name, email)
                ),
                project:projects (
                    title
                )
            `)
            .single();

        if (error) throw error;

        // TODO: Send email notification to commissioner
        // await sendApprovalDecisionEmail(approval);

        // If it's a payment verification and approved, update the payment status
        if (status === 'approved' && approval.request_type === 'payment_verification' && approval.project_id) {
            await supabaseAdmin
                .from('projects')
                .update({ status: 'active', escrow_status: 'deposit_verified' })
                .eq('id', approval.project_id);
        }

        return NextResponse.json({ success: true, data: approval });

    } catch (error: any) {
        console.error('Error updating approval request:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
