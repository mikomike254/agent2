'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Award, DollarSign, MapPin, Save, Loader2, Globe, Linkedin, Github, Twitter, Bell, Shield, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AvatarUpload } from '@/components/ui/AvatarUpload';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'role', 'settings'
    const [mpesaError, setMpesaError] = useState('');

    // Comprehensive Profile State
    const [profile, setProfile] = useState({
        // Basic
        name: '',
        email: '',
        phone: '',
        bio: '',
        avatar_url: '',
        location: '',
        timezone: 'UTC',
        preferred_language: 'en',

        // Social
        linkedin_url: '',
        github_url: '',
        twitter_url: '',
        website_url: '',

        // Role-specific
        company: '', // Client
        industry: '', // Client
        company_size: '', // Client

        skills: '', // Developer
        hourly_rate: '', // Developer
        portfolio_url: '', // Developer

        mpesa_number: '', // Commissioner
        referral_code: '', // Commissioner
        specialization: '', // Commissioner
        years_experience: 0, // Commissioner

        // Settings
        settings: {
            email_notifications: true,
            push_notifications: true,
            sms_notifications: false,
            notify_new_message: true,
            notify_project_update: true,
            notify_payment: true,
            theme: 'light',
            profile_public: false,
            show_email: false,
            show_phone: false
        }
    });

    const userRole = (session?.user as any)?.role;

    useEffect(() => {
        if (session?.user) {
            fetchProfile();
        }
    }, [session]);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile');
            const result = await response.json();
            if (result.success) {
                const { user, roleData, settings } = result.data;

                setProfile({
                    // User fields
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    bio: user.bio || '',
                    avatar_url: user.avatar_url || '',
                    location: user.location || '',
                    timezone: user.timezone || 'UTC',
                    preferred_language: user.preferred_language || 'en',

                    // Social
                    linkedin_url: user.linkedin_url || '',
                    github_url: user.github_url || '',
                    twitter_url: user.twitter_url || '',
                    website_url: user.website_url || '',

                    // Role fields (merge based on role)
                    company: roleData.company_name || roleData.company || '', // Handle different naming conventions if any
                    industry: roleData.industry || '',
                    company_size: roleData.company_size || '',

                    skills: roleData.skills || '',
                    hourly_rate: roleData.hourly_rate || '',
                    portfolio_url: roleData.portfolio_url || '',

                    mpesa_number: roleData.mpesa_number || '',
                    referral_code: roleData.referral_code || '',
                    specialization: roleData.specialization || '',
                    years_experience: roleData.years_experience || 0,

                    // Settings
                    settings: {
                        email_notifications: settings.email_notifications ?? true,
                        push_notifications: settings.push_notifications ?? true,
                        sms_notifications: settings.sms_notifications ?? false,
                        notify_new_message: settings.notify_new_message ?? true,
                        notify_project_update: settings.notify_project_update ?? true,
                        notify_payment: settings.notify_payment ?? true,
                        theme: settings.theme || 'light',
                        profile_public: settings.profile_public ?? false,
                        show_email: settings.show_email ?? false,
                        show_phone: settings.show_phone ?? false
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateMpesa = (number: string): boolean => {
        if (!number) return true; // Allow empty
        const cleaned = number.replace(/\s/g, '');
        return /^(07|01)\d{8}$/.test(cleaned);
    };

    const handleMpesaChange = (value: string) => {
        setProfile(prev => ({ ...prev, mpesa_number: value }));
        if (value && !validateMpesa(value)) {
            setMpesaError('M-Pesa number must be 10 digits starting with 07 or 01');
        } else {
            setMpesaError('');
        }
    };

    const handleSave = async () => {
        if (userRole === 'commissioner' && profile.mpesa_number && !validateMpesa(profile.mpesa_number)) {
            alert('Please enter a valid M-Pesa number');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });

            if (response.ok) {
                alert('Profile updated successfully!');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = (url: string) => {
        setProfile(prev => ({ ...prev, avatar_url: url }));
    };

    const updateSetting = (key: string, value: any) => {
        setProfile(prev => ({
            ...prev,
            settings: { ...prev.settings, [key]: value }
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header with Save Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 bg-[var(--bg-primary)] z-10 py-4 border-b border-[var(--bg-input)]">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Profile Settings</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Manage your identity and preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg w-full sm:w-auto justify-center"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Mobile-Responsive Tabs */}
            <div className="flex border-b border-[var(--bg-input)] overflow-x-auto no-scrollbar">
                {[
                    { id: 'profile', label: 'Profile', icon: User },
                    { id: 'role', label: 'Role Details', icon: Briefcase },
                    { id: 'settings', label: 'Settings', icon: Bell }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'border-[var(--primary)] text-[var(--primary)] font-medium'
                                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Areas */}
            <div className="space-y-6">

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Avatar Section */}
                        <Card className="p-8">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Profile Picture</h2>
                            <AvatarUpload
                                currentAvatar={profile.avatar_url}
                                onUpload={handleAvatarUpload}
                                userId={(session?.user as any)?.id}
                            />
                        </Card>

                        {/* Basic Information */}
                        <Card className="p-8">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Basic Information</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl bg-[var(--bg-input)] text-[var(--text-secondary)] cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        <MapPin className="w-4 h-4 inline mr-2" />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.location}
                                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                        className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                        placeholder="City, Country"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Social Links */}
                        <Card className="p-8">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Social Profiles</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        <Linkedin className="w-4 h-4 inline mr-2 text-blue-600" />
                                        LinkedIn URL
                                    </label>
                                    <input
                                        type="url"
                                        value={profile.linkedin_url}
                                        onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                                        className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        <Github className="w-4 h-4 inline mr-2" />
                                        GitHub URL
                                    </label>
                                    <input
                                        type="url"
                                        value={profile.github_url}
                                        onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                                        className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        <Twitter className="w-4 h-4 inline mr-2 text-blue-400" />
                                        Twitter URL
                                    </label>
                                    <input
                                        type="url"
                                        value={profile.twitter_url}
                                        onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                                        className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                        placeholder="https://twitter.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        <Globe className="w-4 h-4 inline mr-2 text-[var(--primary)]" />
                                        Personal Website
                                    </label>
                                    <input
                                        type="url"
                                        value={profile.website_url}
                                        onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                                        className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                        placeholder="https://yoursite.com"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                )}


                {/* ROLE DETAILS TAB */}
                {activeTab === 'role' && (
                    <div className="space-y-6 animate-in fade-in duration-300">

                        {/* Clients */}
                        {userRole === 'client' && (
                            <Card className="p-8">
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Company Information</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                            <Briefcase className="w-4 h-4 inline mr-2" />
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.company}
                                            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                            Industry
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.industry}
                                            onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                            placeholder="e.g., Technology, Finance"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                            Company Size
                                        </label>
                                        <select
                                            value={profile.company_size}
                                            onChange={(e) => setProfile({ ...profile, company_size: e.target.value })}
                                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                        >
                                            <option value="">Select size...</option>
                                            <option value="1-10">1-10 Employees</option>
                                            <option value="11-50">11-50 Employees</option>
                                            <option value="51-200">51-200 Employees</option>
                                            <option value="201-500">201-500 Employees</option>
                                            <option value="500+">500+ Employees</option>
                                        </select>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Developers */}
                        {userRole === 'developer' && (
                            <Card className="p-8">
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Professional Details</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                            <Award className="w-4 h-4 inline mr-2" />
                                            Skills
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.skills}
                                            onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                            placeholder="e.g., React, Node.js, Python, AWS"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                            <DollarSign className="w-4 h-4 inline mr-2" />
                                            Hourly Rate (KES)
                                        </label>
                                        <input
                                            type="number"
                                            value={profile.hourly_rate}
                                            onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })}
                                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                            Portfolio URL
                                        </label>
                                        <input
                                            type="url"
                                            value={profile.portfolio_url}
                                            onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                            placeholder="https://your-portfolio.com"
                                        />
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Commissioners */}
                        {userRole === 'commissioner' && (
                            <Card className="p-8">
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Commission & Stats</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                            <Phone className="w-4 h-4 inline mr-2" />
                                            M-Pesa Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={profile.mpesa_number}
                                            onChange={(e) => handleMpesaChange(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none bg-[var(--bg-card)] text-[var(--text-primary)] ${mpesaError ? 'border-red-500 focus:ring-red-500' : 'border-[var(--bg-input)] focus:ring-[var(--primary)]'}`}
                                            placeholder="07XXXXXXXX or 01XXXXXXXX"
                                            maxLength={10}
                                        />
                                        {mpesaError && (
                                            <p className="text-red-500 text-xs mt-1">{mpesaError}</p>
                                        )}
                                        <p className="text-[var(--text-secondary)] text-xs mt-1">
                                            Required for receiving commission payouts
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                            Referral Code
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.referral_code}
                                            disabled
                                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl bg-[var(--bg-input)] text-[var(--text-secondary)] cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                            Specialization
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.specialization}
                                            onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                            placeholder="e.g. Enterprise Sales, Tech Startups"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                            Years Experience
                                        </label>
                                        <input
                                            type="number"
                                            value={profile.years_experience}
                                            onChange={(e) => setProfile({ ...profile, years_experience: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-[var(--text-primary)]"
                                        />
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="space-y-6 animate-in fade-in duration-300">

                        {/* Notification Settings */}
                        <Card className="p-8">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Notifications
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                                    <div>
                                        <h3 className="font-medium text-[var(--text-primary)]">Email Notifications</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">Receive updates via email</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={profile.settings.email_notifications}
                                            onChange={(e) => updateSetting('email_notifications', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-[var(--bg-input)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                                    <div>
                                        <h3 className="font-medium text-[var(--text-primary)]">Browser Notifications</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">Get push messages in browser</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={profile.settings.push_notifications}
                                            onChange={(e) => updateSetting('push_notifications', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-[var(--bg-input)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                    </label>
                                </div>
                            </div>
                        </Card>

                        {/* Privacy Settings */}
                        <Card className="p-8">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Privacy
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                                    <div>
                                        <h3 className="font-medium text-[var(--text-primary)]">Public Profile</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">Allow others to see your profile</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={profile.settings.profile_public}
                                            onChange={(e) => updateSetting('profile_public', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-[var(--bg-input)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                                    <div>
                                        <h3 className="font-medium text-[var(--text-primary)]">Show Email</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">Display email on public profile</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={profile.settings.show_email}
                                            onChange={(e) => updateSetting('show_email', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-[var(--bg-input)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                    </label>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
