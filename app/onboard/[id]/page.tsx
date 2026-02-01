'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    CheckCircle2,
    ChevronRight,
    User,
    Mail,
    Phone,
    Briefcase,
    Send,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PublicClientOnboarding() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sessionData, setSessionData] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        client_name: '',
        client_email: '',
        client_phone: '',
        project_scope: '',
    });

    useEffect(() => {
        if (id) fetchSession();
    }, [id]);

    const fetchSession = async () => {
        try {
            const res = await fetch(`/api/onboarding/${id}`);
            const data = await res.json();
            if (data.success) {
                setSessionData(data.data);
                setFormData({
                    client_name: data.data.client_name || '',
                    client_email: data.data.client_email || '',
                    client_phone: data.data.client_phone || '',
                    project_scope: data.data.project_scope || '',
                });
            }
        } catch (err) {
            console.error('Failed to fetch session', err);
        } finally {
            setLoading(false);
        }
    };

    const updateSession = async (newData: any, nextStep?: number) => {
        setSaving(true);
        try {
            // Calculate progress based on step
            const progress = Math.min(100, Math.round((step / 3) * 100));

            await fetch(`/api/onboarding/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newData,
                    progress_percent: progress,
                    status: progress === 100 ? 'completed' : 'in_progress'
                })
            });

            if (nextStep) setStep(nextStep);
        } catch (err) {
            console.error('Failed to update session', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
                <div className="space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-gray-500 font-medium">Securing your session...</p>
                </div>
            </div>
        );
    }

    if (!sessionData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
                <Card className="max-w-md p-8 border-none shadow-xl">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">Link Expired or Invalid</h1>
                    <p className="text-gray-500 mt-2">The onboarding link you're trying to use is no longer active. Please contact your coordinator.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-2xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 mb-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Onboarding Assistant</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome, {formData.client_name}!</h1>
                    <p className="text-gray-500">Let's get your project started. Your assistant is <strong>{sessionData.commissioner?.user?.name}</strong>.</p>
                </div>

                {/* Progress Tracker */}
                <div className="flex items-center justify-between px-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step >= s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border border-gray-200 text-gray-400'
                                }`}>
                                {step > s ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-black">{s}</span>}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {s === 1 ? 'Contact' : s === 2 ? 'Scope' : 'Confirm'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Wizard Steps */}
                <Card className="p-8 border-none shadow-2xl bg-white overflow-hidden relative">
                    {saving && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                    <User className="w-6 h-6 text-indigo-600" />
                                    Review Your Contact Info
                                </h2>
                                <p className="text-gray-500 text-sm">Please verify the contact details provided by your coordinator.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                                            value={formData.client_name}
                                            onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                                            type="email"
                                            value={formData.client_email}
                                            onChange={e => setFormData({ ...formData, client_email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                                            value={formData.client_phone}
                                            onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={() => updateSession({
                                    client_name: formData.client_name,
                                    client_email: formData.client_email,
                                    client_phone: formData.client_phone
                                }, 2)}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                            >
                                Continue to Project Scope
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                    <Briefcase className="w-6 h-6 text-indigo-600" />
                                    Define the Design Scope
                                </h2>
                                <p className="text-gray-500 text-sm">Tell us more about what you're looking for. This helps us match you with the right expertise.</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Project Focus / Requirements</label>
                                <textarea
                                    className="w-full p-6 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 transition-all outline-none min-h-[200px]"
                                    placeholder="e.g. We need a modern e-commerce website with 5 pages, focus on minimalism and high conversion..."
                                    value={formData.project_scope}
                                    onChange={e => setFormData({ ...formData, project_scope: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 font-black border-2 border-gray-100 rounded-2xl text-gray-400">
                                    Back
                                </Button>
                                <Button
                                    onClick={() => updateSession({ project_scope: formData.project_scope }, 3)}
                                    className="flex-[2] h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                                >
                                    Review & Confirm
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 text-center">
                            <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                <Send className="w-10 h-10 text-indigo-600" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-gray-900">Ready to Submit?</h2>
                                <p className="text-gray-500">Your assistant ({sessionData.commissioner?.user?.name}) will be notified immediately to review your requirements.</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl text-left space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Information</p>
                                    <p className="text-sm font-bold text-gray-700">{formData.client_name} ({formData.client_email})</p>
                                    <p className="text-sm text-gray-500">{formData.client_phone}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Design Scope Summary</p>
                                    <p className="text-sm text-gray-700 italic">"{formData.project_scope.substring(0, 150)}{formData.project_scope.length > 150 ? '...' : ''}"</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-14 font-black border-2 border-gray-100 rounded-2xl text-gray-400">
                                    Edit Info
                                </Button>
                                <Button
                                    onClick={() => updateSession({}, 4)}
                                    className="flex-[2] h-14 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-xl shadow-green-100 flex items-center justify-center gap-2"
                                >
                                    Finish Onboarding
                                    <CheckCircle2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-in zoom-in duration-500 text-center py-12">
                            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-gray-900">Fantastic! You're All Set.</h2>
                                <p className="text-gray-500 max-w-sm mx-auto">We've received your details. Your project manager will reach out via email shortly to discuss the next steps.</p>
                            </div>
                            <div className="pt-4">
                                <Button variant="outline" onClick={() => window.location.reload()} className="h-12 px-8 font-black border-2 border-gray-100 rounded-xl text-gray-400">
                                    Refresh Session
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Secure Badge */}
                <div className="flex items-center justify-center gap-2 text-gray-400 select-none">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Secure 256-bit Encrypted Session</span>
                </div>
            </div>
        </div>
    );
}
