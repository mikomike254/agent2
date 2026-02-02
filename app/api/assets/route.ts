import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Fetch assets
export async function GET() {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('marketing_assets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error: any) {
        console.error('Error fetching marketing assets:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create asset (Admin only)
export async function POST(req: NextRequest) {
    if (!supabaseAdmin) return NextResponse.json({ error: 'No DB' }, { status: 500 });
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { data, error } = await supabaseAdmin
            .from('marketing_assets')
            .insert(body)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update asset (Admin only)
export async function PUT(req: NextRequest) {
    if (!supabaseAdmin) return NextResponse.json({ error: 'No DB' }, { status: 500 });
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...updateData } = body;

        const { data, error } = await supabaseAdmin
            .from('marketing_assets')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove asset (Admin only)
export async function DELETE(req: NextRequest) {
    if (!supabaseAdmin) return NextResponse.json({ error: 'No DB' }, { status: 500 });
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { error } = await supabaseAdmin
            .from('marketing_assets')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
