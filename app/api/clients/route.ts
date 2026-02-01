import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'commissioner') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch clients with user details
        const { data: clients, error } = await supabaseAdmin
            .from('clients')
            .select(`
                id,
                contact_person,
                company_name,
                user:users (
                    id,
                    name,
                    email,
                    avatar_url
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data: clients });
    } catch (error: any) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}
