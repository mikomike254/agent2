import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectId } = body;

        if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

        // Fetch project metadata for "analysis"
        const { data: project, error } = await supabaseAdmin!
            .from('projects')
            .select(`
                *,
                milestones:project_milestones(*),
                sessions:work_sessions(*)
            `)
            .eq('id', projectId)
            .single();

        if (error || !project) throw new Error('Project not found');

        // --- Simulated AI Analysis Logic ---
        // In a real scenario, we would send this data to GPT-4o or Gemini 1.5 Pro

        const healthScore = project.health_score || 100;
        const milestoneCount = project.milestones?.length || 0;
        const sessionCount = project.sessions?.length || 0;
        const completedMilestones = project.milestones?.filter((m: any) => m.status === 'completed').length || 0;

        let riskLevel = 'Low';
        let sentiment = 'The project node is operating within optimal industrial parameters.';
        let recommendations = ['Continue current development velocity.'];

        if (healthScore < 80) {
            riskLevel = 'Moderate';
            sentiment = 'Velocity fluctuations detected. Recommended to verify milestone dependencies.';
            recommendations.push('Request developer stand-up for milestone ' + (completedMilestones + 1));
        }

        if (sessionCount === 0 && milestoneCount > 0) {
            riskLevel = 'High';
            sentiment = 'Critical: No industrial work-sessions recorded despite active milestones.';
            recommendations.push('Immediate audit of developer activity required.');
        }

        const report = {
            timestamp: new Date().toISOString(),
            riskLevel,
            sentiment,
            recommendations,
            signals: {
                health: healthScore,
                activity: sessionCount > 5 ? 'High' : 'Low',
                alignment: completedMilestones / milestoneCount > 0.5 ? 'Excellent' : 'Pending'
            }
        };

        return NextResponse.json({
            success: true,
            data: report,
            message: 'AI Audit specialized for Node ' + projectId.slice(0, 8)
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
