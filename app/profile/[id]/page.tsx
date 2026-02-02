'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Verify,
    Star,
    MapPin,
    Link as LinkIcon,
    Twitter,
    Github,
    Briefcase,
    Calendar,
    MessageSquare,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PublicProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/profiles/${id}`);
                const data = await res.json();
                if (data.success) {
                    setProfile(data.data);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfile();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-app)] p-4 text-center">
            <h1 className="text-6xl font-black text-gray-200 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-900">Profile Not Found</h2>
            <p className="text-gray-500 mt-2 mb-8">The profile you're looking for doesn't exist or has been moved.</p>
            <button onClick={() => router.push('/')} className="btn-primary px-8 py-3 rounded-2xl font-bold">Return Home</button>
        </div>
    );

    const isCommissioner = profile.role === 'commissioner';
    const detail = profile.profile || {};

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header / Banner */}
            <div className="h-64 bg-[var(--primary)] relative">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                <button
                    onClick={() => router.back()}
                    className="absolute top-8 left-8 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all border border-white/20"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-32 relative pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar: Profile Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white text-center">
                            <div className="relative inline-block mb-6">
                                <img
                                    src={profile.avatar_url || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg'}
                                    alt={profile.name}
                                    className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white shadow-xl"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-[var(--primary)] p-2 rounded-xl text-white shadow-lg">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
                                {profile.name}
                                <Verify className="w-5 h-5 text-blue-500 fill-current" />
                            </h1>
                            <p className="text-sm font-bold text-[var(--primary)] uppercase tracking-widest mt-1">
                                {detail.niche_expertise || (isCommissioner ? 'Platform Commissioner' : 'Development Partner')}
                            </p>

                            <div className="flex items-center justify-center gap-1 mt-4">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className="w-4 h-4 text-orange-400 fill-current" />
                                ))}
                                <span className="text-xs font-bold text-gray-400 ml-1">5.0 (24 reviews)</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Projects</p>
                                    <p className="text-lg font-black text-gray-900">42</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Reliability</p>
                                    <p className="text-lg font-black text-gray-900">99%</p>
                                </div>
                            </div>

                            <div className="mt-8 space-y-3">
                                <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Send Message
                                </button>
                                <button
                                    onClick={() => router.push(`/dashboard/client/new-project?commissionerId=${id}&name=${encodeURIComponent(profile.name)}`)}
                                    className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                >
                                    <Briefcase className="w-5 h-5" />
                                    Book Direct
                                </button>
                            </div>
                        </Card>

                        <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Contact & Social</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium">{detail.location || 'Nairobi, Kenya'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <LinkIcon className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium text-[var(--primary)] cursor-pointer hover:underline">portfolio.ke</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Twitter className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium">@creative_expert</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="p-10 border-none shadow-xl rounded-[2.5rem] bg-white">
                            <h2 className="text-2xl font-black text-gray-900 mb-6 font-primary">About {profile.name}</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {detail.bio || `${profile.name} is a verified ${profile.role} on the creative.ke platform, specializing in high-quality software delivery and project management. Committed to excellence and transparent communication.`}
                            </p>

                            <div className="mt-10 grid md:grid-cols-2 gap-8">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        Verified Role
                                    </h4>
                                    <p className="text-xs text-gray-500">Identity and qualifications verified by creative.ke quality assurance team.</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-[var(--primary)]" />
                                        Availability
                                    </h4>
                                    <p className="text-xs text-gray-500">Available for new direct bookings starting this week.</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-10 border-none shadow-xl rounded-[2.5rem] bg-white">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-black text-gray-900">Experience</h2>
                                <span className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-500">6 Years Exp.</span>
                            </div>

                            <div className="space-y-10 border-l-2 border-gray-100 ml-4 pl-8 relative">
                                {[1, 2].map(i => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-10 top-0 w-4 h-4 bg-[var(--primary)] rounded-full border-4 border-white shadow-md"></div>
                                        <h4 className="font-bold text-gray-900">Lead Project Commissioner</h4>
                                        <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-tighter">creative.ke • 2022 - Present</p>
                                        <p className="text-sm text-gray-600 leading-loose">
                                            Managing end-to-end delivery of complex software projects, ensuring 100% client satisfaction and technical excellence.
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
