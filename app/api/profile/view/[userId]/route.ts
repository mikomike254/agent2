// API Route: View Public Profile
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        // Fetch user basic info
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select(`  
                id,
                name,
                email,
                phone,
                role,
                bio,
                created_at,
                verified_at
            `)
            .eq('id', userId)
            .single();

        if (error || !user) {
            return NextResponse.json(
                { success: false, message: 'Profile not found' },
                { status: 404 }
            );
        }

        // If commissioner, fetch additional info
        if (user.role === 'commissioner') {
            const { data: commData } = await supabaseAdmin
                .from('commissioners')
                .select('tier, verified_at, company_name')
                .eq('user_id', userId)
                .single();

            if (commData) {
                (user as any).tier = commData.tier;
                (user as any).verified_at = commData.verified_at;
                (user as any).company_name = commData.company_name;
            }
        }

        // If client, fetch company info
        if (user.role === 'client') {
            const { data: clientData } = await supabaseAdmin
                .from('clients')
                .select('company_name')
                .eq('user_id', userId)
                .single();

            if (clientData) {
                (user as any).company_name = clientData.company_name;
            }
        }

        return NextResponse.json({ success: true, data: user });

    } catch (error: any) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
