// Webhook: Paystack Payment Events
import { NextRequest, NextResponse } from 'next/server';
import { paystackPayments } from '@/lib/payments/paystack';
import { supabaseAdmin, db } from '@/lib/db';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }
    try {
        const body = await request.text();
        const signature = request.headers.get('x-paystack-signature');

        if (!signature) {
            return NextResponse.json({ error: 'No signature' }, { status: 401 });
        }

        // Verify webhook signature
        const isValid = paystackPayments.verifyWebhookSignature(signature, body);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);

        // Handle successful payment
        if (event.event === 'charge.success') {
            const data = event.data;
            const reference = data.reference;
            const projectId = data.metadata?.project_id;

            // Find payment record by reference in raw_payload
            // Note: Since we store reference in raw_payload, we might need a better query
            // but for now we look for project and status
            const { data: payment } = await supabaseAdmin
                .from('payments')
                .select('*')
                .eq('project_id', projectId)
                .eq('gateway', 'paystack')
                .eq('status', 'pending_verification')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (payment) {
                // 1. Update payment to VERIFIED immediately (Auto-Verify)
                await supabaseAdmin
                    .from('payments')
                    .update({
                        tx_hash: reference,
                        status: 'verified',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', payment.id);

                // 2. Update lead status
                await supabaseAdmin
                    .from('leads')
                    .update({ status: 'deposit_paid' })
                    .eq('id', projectId);

                // 3. COMMISSION DISTRIBUTION LOGIC
                try {
                    // Fetch Project to get Commissioner
                    const { data: project } = await supabaseAdmin
                        .from('projects')
                        .select('commissioner_id, title')
                        .eq('id', projectId)
                        .single();

                    if (project?.commissioner_id) {
                        const amountPaid = data.amount / 100; // Convert kobo/cents to main currency

                        // Fetch Commissioner Details (including parent for override)
                        const { data: commissioner } = await supabaseAdmin
                            .from('commissioners')
                            .select('id, user_id, tier, parent_commissioner_id')
                            .eq('id', project.commissioner_id)
                            .single();

                        if (commissioner) {
                            // A. Direct Commission (10%)
                            const directRate = 0.10;
                            const directComm = amountPaid * directRate;

                            await supabaseAdmin.from('commissions').insert({
                                commissioner_id: commissioner.id,
                                project_id: projectId,
                                amount: directComm,
                                status: 'pending', // Pending real payout release
                                note: `Direct Commission (10%) for ${project.title}`
                            });

                            // Notify Commissioner
                            await db.createNotification(
                                commissioner.user_id,
                                'financial',
                                'Commission Earned! 💰',
                                `You earned KES ${directComm.toLocaleString()} from ${project.title}.`
                            );

                            // B. Override Commission (5%) if Parent exists
                            if (commissioner.parent_commissioner_id) {
                                // Fetch Parent User ID for notification
                                const { data: parent } = await supabaseAdmin
                                    .from('commissioners')
                                    .select('id, user_id')
                                    .eq('id', commissioner.parent_commissioner_id)
                                    .single();

                                if (parent) {
                                    const overrideRate = 0.05;
                                    const overrideComm = amountPaid * overrideRate;

                                    await supabaseAdmin.from('commissions').insert({
                                        commissioner_id: parent.id,
                                        project_id: projectId,
                                        amount: overrideComm,
                                        status: 'pending',
                                        note: `Override Commission (5%) from downline project: ${project.title}`
                                    });

                                    // Notify Parent
                                    await db.createNotification(
                                        parent.user_id,
                                        'financial',
                                        'Override Commission! 🚀',
                                        `You earned KES ${overrideComm.toLocaleString()} from your team's activity.`
                                    );
                                }
                            }
                        }
                    }
                } catch (commError) {
                    console.error('Commission Calculation Failed:', commError);
                    // Don't fail the webhook, just log it. Admin can fix manually.
                }

                // Create audit log
                await db.createAuditLog(
                    payment.payer_id || projectId,
                    'client',
                    'payment_verified_auto',
                    { payment_id: payment.id, gateway: 'paystack', reference, amount: data.amount / 100 }
                );

                // Send email receipt
                await emailService.sendPaymentReceipt(
                    data.customer.email,
                    `Project Deposit`,
                    data.amount / 100,
                    data.currency,
                    reference
                );

                // Notify admins
                const { data: admins } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('role', 'admin');

                if (admins) {
                    for (const admin of admins) {
                        await db.createNotification(
                            admin.id,
                            'in_app',
                            'Payment Verified & Commissions Distributed',
                            `Deposit of ${data.currency} ${data.amount / 100} received and commissions allocated.`
                        );
                    }
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Paystack webhook error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
