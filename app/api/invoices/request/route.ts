// API Route: Request Invoice via Email
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { sendEmail } from '@/lib/emailjs';

export async function POST(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
        }
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { payment_id, email } = body;

        if (!payment_id || !email) {
            return NextResponse.json({ error: 'Payment ID and email are required' }, { status: 400 });
        }

        // Fetch payment details
        const { data: payment, error } = await supabaseAdmin
            .from('payments')
            .select('*, projects(title)')
            .eq('id', payment_id)
            .single();

        if (error || !payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // Create invoice record
        const { data: invoice, error: invoiceError } = await supabaseAdmin
            .from('invoices')
            .insert({
                payment_id,
                email,
                status: 'pending',
                amount: payment.amount,
            })
            .select()
            .single();

        if (invoiceError) throw invoiceError;

        // Send invoice email
        try {
            await sendEmail({
                to_email: email,
                to_name: session.user.name || 'Client',
                subject: `Invoice for ${payment.projects?.title || 'Your Project'}`,
                message: `Your invoice for KES ${payment.amount.toLocaleString()} has been generated. Please check your dashboard for details.`,
            });
        } catch (emailError) {
            console.error('Failed to send invoice email:', emailError);
            // Continue even if email fails
        }

        return NextResponse.json({
            success: true,
            message: 'Invoice request submitted successfully',
            data: invoice,
        });
    } catch (error: any) {
        console.error('Error requesting invoice:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to request invoice' },
            { status: 500 }
        );
    }
}
