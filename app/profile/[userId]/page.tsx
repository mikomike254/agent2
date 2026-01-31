'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { User, Mail, Phone, Briefcase, Star, Shield, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ProfileData {
    name: string;
    email: string;
    phone?: string;
    role: string;
    bio?: string;
    company_name?: string;
    tier?: string;
    verified_at?: string;
    created_at: string;
}

export default function PublicProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/profile/view/${userId}`);
                const data = await res.json();

                if (data.success) {
                    setProfile(data.data);
                } else {
                    setError(data.message || 'Profile not found');
                }
            } catch (err) {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="p-12 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <a href="/" className="text-indigo-600 hover:underline font-semibold">
                        ← Back to home
                    </a>
                </Card>
            </div>
        );
    }

    const getRoleBadge = (role: string) => {
        const badges = {
            admin: { color: 'bg-purple-100 text-purple-800', label: 'Administrator' },
            commissioner: { color: 'bg-blue-100 text-blue-800', label: 'Commissioner' },
            developer: { color: 'bg-green-100 text-green-800', label: 'Developer' },
            client: { color: 'bg-gray-100 text-gray-800', label: 'Client' }
        };
        return badges[role as keyof typeof badges] || badges.client;
    };

    const badge = getRoleBadge(profile.role);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Profile Card */}
                <Card className="p-8 mb-6">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                                {profile.verified_at && (
                                    <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                                        <Shield className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-semibold text-green-700">Verified</span>
                                    </div>
                                )}
                            </div>

                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${badge.color}`}>
                                {badge.label}
                            </div>

                            {profile.company_name && (
                                <p className="text-gray-600 flex items-center gap-2 mb-2">
                                    <Briefcase className="w-4 h-4" />
                                    {profile.company_name}
                                </p>
                            )}

                            <p className="text-gray-600 flex items-center gap-2 mb-2">
                                <Mail className="w-4 h-4" />
                                {profile.email}
                            </p>

                            {profile.phone && (
                                <p className="text-gray-600 flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {profile.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {profile.bio && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h2 className="font-semibold text-gray-900 mb-2">About</h2>
                            <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                        </div>
                    )}

                    {profile.tier && profile.role === 'commissioner' && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h2 className="font-semibold text-gray-900 mb-3">Tier Level</h2>
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <span className="font-semibold text-gray-900 capitalize">{profile.tier}</span>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </Card>

                {/* Contact Button */}
                <div className="text-center">
                    <a
                        href={`/dashboard`}
                        className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        Contact {profile.name.split(' ')[0]}
                    </a>
                </div>
            </div>
        </div>
    );
}
