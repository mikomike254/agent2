import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, value } = await req.json();
        const { id: userId } = await params;

        let updateData: any = {};
        let message = '';

        switch (action) {
            case 'set-role':
                updateData.role = value;
                message = `User role updated to ${value}`;
                break;
            case 'set-status':
                updateData.status = value;
                message = `User status updated to ${value}`;
                break;
            case 'verify':
                updateData.verified = value;
                message = value ? 'User verified successfully' : 'User unverified';
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', userId);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message
        });

    } catch (error: any) {
        console.error('Admin user action error:', error);
        return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
    }
}
