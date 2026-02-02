import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { action, amount, projectId, description, transactionType } = body;

        // Common validation
        if (action === 'manual_entry' && (!amount || !description || !transactionType)) {
            return NextResponse.json({ error: 'Missing required fields for manual entry' }, { status: 400 });
        }

        // 1. Get current balance
        const { data: lastEntry } = await supabaseAdmin
            .from('escrow_ledger')
            .select('balance_after')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        const currentBalance = lastEntry?.balance_after || 0;
        const newBalance = Number(currentBalance) + Number(amount);

        // 2. Insert override record
        const { data, error } = await supabaseAdmin
            .from('escrow_ledger')
            .insert({
                project_id: projectId || null,
                amount: amount,
                balance_after: newBalance,
                description: `[ADMIN OVERRIDE] ${description}`,
                transaction_type: transactionType || 'adjustment',
                metadata: {
                    admin_id: (session.user as any).id,
                    reason: 'Manual Admin override',
                    timestamp: new Date().toISOString()
                }
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data,
            message: 'Financial override successful'
        });

    } catch (error: any) {
        console.error('Financial override error:', error);
        return NextResponse.json({ error: error.message || 'Override failed' }, { status: 500 });
    }
}
