import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const role = (session.user as any).role;

        if (!query || query.length < 2) {
            return NextResponse.json({ success: true, results: [] });
        }

        const results: any[] = [];

        // 1. Search Projects
        const { data: projects } = await supabaseAdmin!
            .from('projects')
            .select('id, title, project_type')
            .ilike('title', `%${query}%`)
            .limit(5);

        if (projects) {
            results.push(...projects.map(p => ({
                id: p.id,
                title: p.title,
                type: 'project',
                url: `/dashboard/${role}/projects/${p.id}`,
                meta: p.project_type
            })));
        }

        // 2. Search Users (Admin Only)
        if (role === 'admin') {
            const { data: users } = await supabaseAdmin!
                .from('users')
                .select('id, name, email, role')
                .ilike('name', `%${query}%`)
                .limit(5);

            if (users) {
                results.push(...users.map(u => ({
                    id: u.id,
                    title: u.name,
                    type: 'user',
                    url: `/dashboard/admin/users/${u.id}`,
                    meta: u.role
                })));
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
