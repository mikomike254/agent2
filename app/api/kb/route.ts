import { supabaseAdmin } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Fallback for static build
const supabase = supabaseAdmin;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const categoryId = searchParams.get('categoryId');

    try {
        if (!supabase) {
            // Return empty/safe response during static build
            return NextResponse.json({ success: true, data: { categories: [], featured: [] } });
        }

        if (slug) {
            const { data, error } = await supabase
                .from('kb_articles')
                .select('*, category:kb_categories(*)')
                .eq('slug', slug)
                .single();

            if (error) throw error;

            // Increment view count (fire and forget)
            supabase.rpc('increment_view_count', { article_id: data.id }).then(() => { });

            return NextResponse.json({ success: true, data });
        }

        if (categoryId) {
            const { data, error } = await supabase
                .from('kb_articles')
                .select('*')
                .eq('category_id', categoryId)
                .eq('is_published', true);

            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        // Default: Get categories and featured articles
        const { data: categories, error: catError } = await supabase
            .from('kb_categories')
            .select('*')
            .order('display_order', { ascending: true });

        const { data: featured, error: featError } = await supabase
            .from('kb_articles')
            .select('*')
            .eq('is_published', true)
            .order('view_count', { ascending: false })
            .limit(5);

        if (catError || featError) throw catError || featError;

        return NextResponse.json({
            success: true,
            data: { categories, featured }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
