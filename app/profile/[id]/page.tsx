'use client';

import { useState, useEffect } from 'react';
import {
    Star,
    Briefcase,
    Zap,
    Calendar,
    ChevronRight,
    Search,
    Code,
    MessageSquare,
    Link as LinkIcon,
    ArrowUpRight,
    MapPin,
    ShieldCheck
} from 'lucide-react';
import { useParams } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';
import { UniversalProjectModal } from '@/components/projects/UniversalProjectModal';

export default function PublicProfile() {
    const { id } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/profile/${id}`);
                const data = await res.json();
                if (data.success) {
                    setProfile(data.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    if (!profile) return (
        <div className="text-center py-20">Profile not found.</div>
    );

    const isCommissioner = profile.role === 'commissioner';
    const roleData = profile.roleData || {};

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-12">
            {/* 1. Hero / Header Card */}
            <div className="relative bg-white rounded-[3rem] border border-gray-100 p-8 lg:p-16 shadow-2xl shadow-indigo-100/50 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50/50 to-transparent"></div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start lg:items-center">
                    <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white shrink-0">
                        <UserAvatar user={{ name: profile.name, avatar_url: profile.avatar_url }} size="xl" />
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter">{profile.name}</h1>
                                <ShieldCheck className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
                                <span className="text-indigo-600 font-black">{profile.role}</span>
                                <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Nairobi, Kenya
                                </span>
                                <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                                <span className="flex items-center gap-2 text-amber-500">
                                    <Star className="w-4 h-4 fill-current" /> {roleData.rating || '5.0'}
                                </span>
                            </div>
                        </div>

                        <p className="text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
                            {roleData.bio || 'Veteran digital lead focused on delivering high-impact solutions for startups and enterprise clients across East Africa.'}
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                onClick={() => setIsProjectModalOpen(true)}
                                className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
                            >
                                Start Project with {profile.name.split(' ')[0]}
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/messages', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ recipientId: profile.user_id })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            window.location.href = `/dashboard/messages?conversation=${data.data.id}`;
                                        } else {
                                            alert('Failed to start conversation');
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert('Error starting conversation');
                                    }
                                }}
                                className="px-10 py-5 bg-white border-2 border-indigo-50 text-indigo-600 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
                            >
                                <MessageSquare className="w-4 h-4" /> Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Stats & Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Completed Projects', value: roleData.projects_completed || '47', icon: Briefcase, color: 'indigo' },
                    { label: 'Success Rate', value: '100%', icon: Zap, color: 'blue' },
                    { label: 'Avg. Delivery', value: '4 Weeks', icon: Calendar, color: 'purple' },
                    { label: 'Reliability', value: 'Elite', icon: ShieldCheck, color: 'green' },
                ].map((stat, i) => (
                    <div key={i} className="p-10 bg-white rounded-[2.5rem] border border-gray-100 hover:border-indigo-100 transition-colors group">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors mb-6">
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* 3. Expertise & Portfolio Row */}
            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Core Expertise</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-2xl">
                        {roleData.specialization ? (
                            <div className="p-8 bg-white rounded-3xl border border-gray-50 hover:bg-indigo-50/30 transition-all flex items-center justify-between group col-span-2">
                                <span className="font-extrabold text-gray-700">{roleData.specialization}</span>
                                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600" />
                            </div>
                        ) : (
                            ['Enterprise Web Apps', 'Fintech Infrastructure', 'High-Load Backend', 'E-commerce Ops', 'Cloud Architecture', 'Mobile Strategy'].map((exp) => (
                                <div key={exp} className="p-8 bg-white rounded-3xl border border-gray-50 hover:bg-indigo-50/30 transition-all flex items-center justify-between group">
                                    <span className="font-extrabold text-gray-700">{exp}</span>
                                    <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-10 bg-black rounded-[3rem] text-white space-y-8">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <Zap className="w-6 h-6 text-indigo-400" />
                            Availability
                        </h3>
                        <div className="p-6 bg-white/10 rounded-2xl border border-white/10 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold text-xs uppercase">Current Status</span>
                                <span className="px-3 py-1 bg-green-500 rounded-full text-[10px] font-black uppercase">Active</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold text-xs uppercase">Queue Capacity</span>
                                <span className="text-lg font-black">2 Slots</span>
                            </div>
                        </div>
                        <button className="w-full py-5 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all">
                            Reserve Priority Call
                        </button>
                    </div>
                </div>
            </div>

            <UniversalProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                role="client" // Assuming a visitor is a client or wants to be
            />
        </div>
    );
}
