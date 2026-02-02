import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Fetch articles
export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const publishedOnly = searchParams.get('publishedOnly') !== 'false';

        let query = supabaseAdmin
            .from('knowledge_base')
            .select('*')
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (publishedOnly) {
            query = query.eq('is_published', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error: any) {
        console.error('Error fetching KB articles:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create article (Admin only)
export async function POST(req: NextRequest) {
    if (!supabaseAdmin) return NextResponse.json({ error: 'No DB' }, { status: 500 });
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, content, category, is_published } = body;

        // Generate slug from title
        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

        const { data, error } = await supabaseAdmin
            .from('knowledge_base')
            .insert({
                title,
                content,
                category,
                is_published,
                slug,
                author_id: (session.user as any).id
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update article (Admin only)
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
            .from('knowledge_base')
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

// DELETE: Remove article (Admin only)
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
            .from('knowledge_base')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
