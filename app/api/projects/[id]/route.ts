// API Route: Get Individual Project Details
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const projectId = id;

        const { data: project, error } = await supabaseAdmin
            .from('projects')
            .select(`
                *,
                team_members:project_team_members(
                    user:users(name, avatar_url)
                ),
                milestones:project_milestones(id, title, status, deliverable_link, due_date)
            `)
            .eq('id', projectId)
            .single();

        if (error) throw error;

        // --- Predictive Health Logic ---
        let healthScore = 100;
        const now = new Date();

        if (project.milestones) {
            project.milestones.forEach((m: any) => {
                const dueDate = m.due_date ? new Date(m.due_date) : null;
                if (m.status !== 'completed' && dueDate && dueDate < now) {
                    healthScore -= 20; // Overdue penalty
                }
            });
        }

        if (project.status === 'on_hold') healthScore -= 30;
        if (project.status === 'in_dispute') healthScore -= 50;

        // Clamp between 0 and 100
        healthScore = Math.max(0, Math.min(100, healthScore));

        return NextResponse.json({
            success: true,
            data: { ...project, health_score: healthScore }
        });
    } catch (error: any) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch project' },
            { status: 500 }
        );
    }
}
