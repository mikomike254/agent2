// app/api/admin/approval-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin, db } from '@/lib/db';

// GET: List all approval requests
export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = (session.user as any).role;

        // Only admins can view approval requests
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');

        let query = supabaseAdmin
            .from('admin_approval_requests')
            .select(`
                *,
                commissioner:commissioners (
                    id,
                    user:users (name, email, avatar_url)
                ),
                client:clients (
                    id,
                    company_name,
                    user:users (name, email)
                ),
                project:projects (
                    id,
                    title,
                    status
                ),
                approver:users!approved_by (name, email)
            `);

        if (status) {
            query = query.eq('status', status);
        }

        if (type) {
            query = query.eq('request_type', type);
        }

        const { data: approvals, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data: approvals || [] });

    } catch (error: any) {
        console.error('Error fetching approval requests:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create new approval request
export async function POST(req: NextRequest) {
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

        if (role !== 'commissioner' && role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const body = await req.json();
        const {
            requestType,
            subject,
            message,
            clientId,
            projectId
        } = body;

        // Validation
        if (!requestType || !subject || !message) {
            return NextResponse.json({ error: 'Request type, subject, and message are required' }, { status: 400 });
        }

        // Get commissioner ID
        const { data: commissioner } = await supabaseAdmin
            .from('commissioners')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!commissioner) {
            return NextResponse.json({ error: 'Commissioner profile not found' }, { status: 400 });
        }

        // Create approval request
        const { data: approval, error } = await supabaseAdmin
            .from('admin_approval_requests')
            .insert({
                commissioner_id: commissioner.id,
                client_id: clientId || null,
                project_id: projectId || null,
                request_type: requestType,
                subject,
                message,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        // Send notification to admin
        // Note: Real email sending would go here via EmailJS or similar if configured for admin alerts
        const { data: admins } = await supabaseAdmin.from('users').select('id').eq('role', 'admin');
        if (admins) {
            for (const admin of admins) {
                await db.createNotification(admin.id, 'system', 'New Approval Request', `A new ${requestType} request requires review.`);
            }
        }
        // await sendAdminApprovalEmail(approval);

        return NextResponse.json({ success: true, data: approval });

    } catch (error: any) {
        console.error('Error creating approval request:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
