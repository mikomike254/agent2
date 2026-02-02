import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectDescription, requiredSkills } = body;

        // Fetch all verified developers
        const { data: developers, error } = await supabaseAdmin!
            .from('developers')
            .select('*, user:users(name, avatar_url)')
            .eq('status', 'active');

        if (error) throw error;

        // --- Simulated Matching Intelligence ---
        // We match based on tags/skills similarity (Simulated)
        const matched = developers.map(dev => {
            const devSkills = (dev.skills || '').toLowerCase();
            const desc = (projectDescription || '').toLowerCase();

            let score = Math.floor(Math.random() * 40) + 60; // Base score

            // Skill matching boost
            if (requiredSkills && Array.isArray(requiredSkills)) {
                requiredSkills.forEach(skill => {
                    if (devSkills.includes(skill.toLowerCase())) score += 10;
                });
            }

            return {
                id: dev.id,
                name: dev.user?.name,
                avatar: dev.user?.avatar_url,
                matchScore: Math.min(score, 99),
                tags: dev.skills?.split(',') || []
            };
        }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

        return NextResponse.json({
            success: true,
            results: matched,
            intelligenceModel: 'NodeMatcher-V1'
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
