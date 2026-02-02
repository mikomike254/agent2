'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, User, Briefcase, DollarSign, Send, Loader2, CheckCircle2, ArrowLeft, XCircle, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function OnboardClientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        projectTitle: '',
        projectDescription: '',
        budget: 0,
        service: '',
        milestones: [
            { title: 'Project Kickoff', description: 'Initial setup and requirements finalization.', percent_amount: 43 },
            { title: 'Final Delivery', description: 'Deployment and hand-over.', percent_amount: 57 }
        ]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/onboarding/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => router.push('/dashboard/commissioner'), 2000);
            } else {
                alert(data.error || 'Failed to send request');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Card className="p-10 text-center max-w-md border-none shadow-2xl rounded-[3rem] bg-white">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Request Sent!</h2>
                    <p className="text-gray-500">The client will see this proposal on their dashboard.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Back to Overview
            </button>

            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Onboard New Client</h1>
                <p className="text-gray-500 mt-2 text-lg">Propose a project and invite a client to the platform.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Client Info */}
                <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Client Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <input
                                    required
                                    type="text"
                                    value={formData.clientName}
                                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[var(--primary)] rounded-2xl outline-none font-bold transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <input
                                    required
                                    type="email"
                                    value={formData.clientEmail}
                                    onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[var(--primary)] rounded-2xl outline-none font-bold transition-all"
                                    placeholder="client@example.com"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Project Proposal */}
                <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Project Proposal</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Project Title</label>
                            <input
                                required
                                type="text"
                                value={formData.projectTitle}
                                onChange={e => setFormData({ ...formData, projectTitle: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[var(--primary)] rounded-2xl outline-none font-bold transition-all"
                                placeholder="e.g. Corporate Website Redesign"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Service Type</label>
                            <select
                                required
                                value={formData.service}
                                onChange={e => setFormData({ ...formData, service: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[var(--primary)] rounded-2xl outline-none font-bold appearance-none transition-all"
                            >
                                <option value="">Select a service...</option>
                                <option value="web">Web Development</option>
                                <option value="mobile">Mobile App</option>
                                <option value="branding">Branding & UI/UX</option>
                                <option value="marketing">Digital Marketing</option>
                                <option value="ai">AI Solutions</option>
                            </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Estimated Budget (KES)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    <input
                                        type="number"
                                        value={formData.budget}
                                        onChange={e => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[var(--primary)] rounded-2xl outline-none font-bold transition-all"
                                        placeholder="50,000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Project Description</label>
                            <textarea
                                required
                                rows={5}
                                value={formData.projectDescription}
                                onChange={e => setFormData({ ...formData, projectDescription: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[var(--primary)] rounded-2xl outline-none text-gray-700 transition-all"
                                placeholder="Describe the scope and deliverables..."
                            />
                        </div>
                    </div>
                </Card>

                {/* Project Milestones */}
                <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Project Milestones</h3>
                        <button
                            type="button"
                            onClick={() => setFormData({
                                ...formData,
                                milestones: [...formData.milestones, { title: '', description: '', percent_amount: 0 }]
                            })}
                            className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                        >
                            <Plus className="w-3 h-3" /> Add Milestone
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.milestones.map((milestone, idx) => (
                            <div key={idx} className="p-6 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-indigo-100 transition-all space-y-4 relative group">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newM = [...formData.milestones];
                                        newM.splice(idx, 1);
                                        setFormData({ ...formData, milestones: newM });
                                    }}
                                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Milestone Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={milestone.title}
                                            onChange={e => {
                                                const newM = [...formData.milestones];
                                                newM[idx].title = e.target.value;
                                                setFormData({ ...formData, milestones: newM });
                                            }}
                                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none font-bold"
                                            placeholder="e.g. Design Prototype"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Percent (%)</label>
                                        <input
                                            required
                                            type="number"
                                            value={milestone.percent_amount}
                                            onChange={e => {
                                                const newM = [...formData.milestones];
                                                newM[idx].percent_amount = parseInt(e.target.value);
                                                setFormData({ ...formData, milestones: newM });
                                            }}
                                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none font-bold text-center"
                                            placeholder="43"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <input
                                        type="text"
                                        value={milestone.description}
                                        onChange={e => {
                                            const newM = [...formData.milestones];
                                            newM[idx].description = e.target.value;
                                            setFormData({ ...formData, milestones: newM });
                                        }}
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none text-sm"
                                        placeholder="Deliverables and expectations..."
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="pt-2 flex justify-between items-center px-4">
                            <p className="text-xs font-bold text-gray-400">Total Allocation: <span className={formData.milestones.reduce((acc, m) => acc + m.percent_amount, 0) === 100 ? 'text-green-500' : 'text-orange-500'}>
                                {formData.milestones.reduce((acc, m) => acc + m.percent_amount, 0)}%
                            </span></p>
                            {formData.milestones.reduce((acc, m) => acc + m.percent_amount, 0) !== 100 && (
                                <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Milestones should total 100%</p>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end pt-4">
                    <button
                        disabled={loading || formData.milestones.reduce((acc, m) => acc + m.percent_amount, 0) !== 100}
                        type="submit"
                        className="bg-gray-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl flex items-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                                <Send className="w-5 h-5" />
                                Send Proposal
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
