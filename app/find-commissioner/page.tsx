'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, ShieldCheck, ChevronLeft } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

const MOCK_COMMISSIONERS = [
    { id: '1', name: 'Althea Mwangi', specialization: 'Fintech & Mobile Ops', rating: 5.0, projects: 48, location: 'Nairobi', avatar_url: '' },
    { id: '2', name: 'David Omondi', specialization: 'Enterprise Web Apps', rating: 4.9, projects: 32, location: 'Mombasa', avatar_url: '' },
    { id: '3', name: 'Sarah Chepkirui', specialization: 'E-commerce Platforms', rating: 5.0, projects: 12, location: 'Kisumu', avatar_url: '' },
    { id: '4', name: 'James Kamau', specialization: 'Custom CRM Infrastructure', rating: 4.8, projects: 65, location: 'Nairobi', avatar_url: '' },
];

export default function FindCommissionerPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="min-h-screen bg-[#f8f9ff]">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors mb-12 uppercase tracking-widest">
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="mb-16">
                    <h1 className="text-5xl lg:text-8xl font-black text-[#1a1c3d] tracking-tighter mb-6">
                        Verified Partners
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl font-medium leading-relaxed">
                        Connect with specialized Commissioners who translate your business vision into technical reality and manage your project end-to-end.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-12 max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 py-6 bg-white rounded-[2rem] border-none shadow-xl shadow-indigo-100/50 outline-none font-bold text-lg focus:ring-2 focus:ring-indigo-600 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {MOCK_COMMISSIONERS.map((comm) => (
                        <div key={comm.id} className="bg-white p-8 lg:p-12 rounded-[3.5rem] border border-white shadow-2xl shadow-indigo-100/50 flex flex-col md:flex-row gap-8 items-center group hover:scale-[1.01] transition-transform">
                            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white shrink-0">
                                <UserAvatar user={{ name: comm.name, avatar_url: comm.avatar_url }} size="xl" />
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-2xl font-black text-gray-900">{comm.name}</h3>
                                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                </div>
                                <p className="text-indigo-600 font-black uppercase text-[10px] tracking-widest">{comm.specialization}</p>

                                <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> {comm.location}
                                    </span>
                                    <span className="flex items-center gap-2 text-amber-500">
                                        <Star className="w-4 h-4 fill-current" /> {comm.rating}
                                    </span>
                                    <span>{comm.projects} Projects</span>
                                </div>

                                <div className="pt-4">
                                    <Link
                                        href={`/profile/${comm.id}`}
                                        className="inline-block px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-colors"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-6">Want to join these professionals?</p>
                    <Link href="/join" className="text-indigo-600 font-black text-xl hover:underline italic">
                        Become a CREATIVE.KE Commissioner →
                    </Link>
                </div>
            </div>
        </div>
    );
}
