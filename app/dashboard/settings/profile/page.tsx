'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import AvatarUpload from '@/components/AvatarUpload';
import { User, Mail, Phone, Briefcase, Save } from 'lucide-react';

export default function ProfileSettingsPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        avatar_url: '',
        specialization: '',
        mpesa_number: '',
        company_size: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile');
                const data = await res.json();
                if (data.success) {
                    setProfile(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchProfile();
        }
    }, [session]);

    const handleSave = async () => {
        setSaving(true);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });

            const result = await res.json();

            if (result.success) {
                alert('Profile updated successfully!');
            } else {
                alert(result.message || 'Failed to update profile');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-1">Manage your personal information and profile picture</p>
            </div>

            <div className="grid md:grid-cols-[300px_1fr] gap-6">
                {/* Avatar Section */}
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Profile Picture</h3>
                    <div className="flex flex-col items-center">
                        <AvatarUpload
                            currentAvatar={profile.avatar_url}
                            userName={profile.name}
                            size="lg"
                            onUploadSuccess={(url) => setProfile({ ...profile, avatar_url: url })}
                        />
                    </div>
                </Card>

                {/* Profile Info */}
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-6">Personal Information</h3>

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={profile.phone || ''}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                                    placeholder="+254 700 000 000"
                                />
                            </div>
                        </div>

                        {/* Specialization (for Commissioners/Developers) */}
                        {((session?.user as any).role === 'commissioner' || (session?.user as any).role === 'developer') && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Specialization / Expertise
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profile.specialization || ''}
                                        onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                                        placeholder="e.g. Full Stack Web Development"
                                    />
                                </div>
                            </div>
                        )}

                        {/* M-Pesa Number (Kenyan Payments) */}
                        {(session?.user as any).role !== 'client' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    M-Pesa Number (for Payouts)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profile.mpesa_number || ''}
                                        onChange={(e) => setProfile({ ...profile, mpesa_number: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                                        placeholder="07XX XXX XXX"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Company Size (for Clients) */}
                        {(session?.user as any).role === 'client' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Company Size
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        value={profile.company_size || ''}
                                        onChange={(e) => setProfile({ ...profile, company_size: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none bg-white font-medium"
                                    >
                                        <option value="">Select Size</option>
                                        <option value="1-10">1-10 Employees</option>
                                        <option value="11-50">11-50 Employees</option>
                                        <option value="51-200">51-200 Employees</option>
                                        <option value="201-500">201-500 Employees</option>
                                        <option value="500+">500+ Employees</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Profile Bio
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    value={profile.bio || ''}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none min-h-[120px]"
                                    placeholder="Tell the community about your expertise and background..."
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
