'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Star,
    MapPin,
    Briefcase,
    Clock,
    CheckCircle,
    MessageSquare,
    Shield,
    Globe,
    Github,
    Linkedin
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { GoldBadge } from '@/components/ui/GoldBadge';

export default function CommissionerProfile({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [commissioner, setCommissioner] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Mock data fallback until API is confirmed
    useEffect(() => {
        const fetchCommissioner = async () => {
            try {
                // Try fetching specific ID (implement getCommissionerById logic if API supports it, or filter list)
                // For now, simulating fetch
                const mock = {
                    id: params.id,
                    name: 'Sarah K.',
                    role: 'Senior UI/UX Designer',
                    tier: 'tier1',
                    rating: 4.9,
                    completed_projects: 42,
                    price_range: '$2,500 - $8,000',
                    hourly_rate: '$65/hr',
                    availability: 'available',
                    bio: 'Experienced product designer specializing in complex SaaS interfaces and mobile applications. I help startups convert vague ideas into pixel-perfect, developer-ready designs.',
                    location: 'Nairobi, Kenya',
                    skills: ['Figma', 'React', 'Design Systems', 'Prototyping', 'User Research'],
                    portfolio: [
                        { title: 'Fintech Dashboard', img: 'https://images.pexels.com/photos/160107/pexels-photo-160107.jpeg?auto=compress&cs=tinysrgb&w=300' },
                        { title: 'E-commerce App', img: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=300' },
                        { title: 'Medical Portal', img: 'https://images.pexels.com/photos/540518/pexels-photo-540518.jpeg?auto=compress&cs=tinysrgb&w=300' }
                    ]
                };
                setTimeout(() => {
                    setCommissioner(mock);
                    setLoading(false);
                }, 500);

            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchCommissioner();
    }, [params.id]);

    if (loading) return <div className="p-10 text-center">Loading Profile...</div>;
    if (!commissioner) return <div className="p-10 text-center">Commissioner not found.</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] mb-6 transition-colors font-medium"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Discovery
            </button>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Sidebar Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="p-6 text-center shadow-lg border-0 bg-white relative overflow-hidden">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center p-1 mb-4">
                            <img
                                src={`https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200`}
                                alt={commissioner.name}
                                className="w-full h-full rounded-full object-cover border-4 border-white shadow-sm"
                            />
                        </div>

                        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center justify-center gap-2 mb-1">
                            {commissioner.name}
                            <GoldBadge tier={commissioner.tier} size="sm" />
                        </h1>
                        <p className="text-[var(--text-secondary)] font-medium mb-4">{commissioner.role}</p>

                        <div className="flex justify-center items-center gap-4 text-sm mb-6">
                            <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                <Star className="w-4 h-4 fill-current" />
                                {commissioner.rating}
                            </div>
                            <span className="text-gray-300">|</span>
                            <div className="text-[var(--text-secondary)]">
                                {commissioner.completed_projects} Projects
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => router.push(`/dashboard/client/new-project?commissionerId=${commissioner.id}&name=${encodeURIComponent(commissioner.name)}`)}
                                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-soft hover:shadow-hover"
                            >
                                Hire This Talent
                            </button>
                            <button className="w-full py-3 bg-white border border-[var(--border-color)] rounded-xl font-bold text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition-all flex items-center justify-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Message
                            </button>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4 shadow-sm border-[var(--border-color)]">
                        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                            <MapPin className="w-4 h-4 text-[var(--primary)]" />
                            {commissioner.location}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                            <Clock className="w-4 h-4 text-[var(--primary)]" />
                            Avg. response: 2 hours
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                            <CheckCircle className="w-4 h-4 text-[var(--primary)]" />
                            Identity Verified
                        </div>
                        <hr className="border-[var(--bg-input)]" />
                        <div className="flex justify-center gap-4 text-[var(--text-muted)]">
                            <Globe className="w-5 h-5 cursor-pointer hover:text-[var(--primary)]" />
                            <Github className="w-5 h-5 cursor-pointer hover:text-[var(--primary)]" />
                            <Linkedin className="w-5 h-5 cursor-pointer hover:text-[var(--primary)]" />
                        </div>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">About</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
                            {commissioner.bio}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Skills & Expertise</h2>
                        <div className="flex flex-wrap gap-2">
                            {commissioner.skills.map((skill: string) => (
                                <span key={skill} className="px-4 py-2 bg-[var(--bg-input)] rounded-full text-sm font-semibold text-[var(--text-primary)]">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Recent Projects</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {commissioner.portfolio.map((item: any, i: number) => (
                                <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer">
                                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-bold">{item.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
