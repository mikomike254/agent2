'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Briefcase, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

const CATEGORIES = [
    { id: 'web', title: 'Web Application', icon: '🌐' },
    { id: 'mobile', title: 'Mobile App', icon: '📱' },
    { id: 'crm', title: 'CRM System', icon: '📊' },
    { id: 'erp', title: 'ERP Solution', icon: '🏢' },
    { id: 'ecommerce', title: 'E-commerce', icon: '🛍️' },
    { id: 'ai', title: 'AI & Automation', icon: '🤖' },
    { id: 'saas', title: 'SaaS Platform', icon: '☁️' },
];

export default function NewProjectPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get pre-selected commissioner from URL
    const preSelectedCommissionerId = searchParams.get('commissionerId');
    const preSelectedCommissionerName = searchParams.get('name');

    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        projectType: '', // 'direct' or 'open'
        title: '',
        description: '',
        budget: 10000,
        timeline: '',
        skills: [] as string[],
        commissionerId: '',
        phone: '',
        email: session?.user?.email || '',
    });

    // Auto-select Direct Booking if ID is present
    useEffect(() => {
        if (preSelectedCommissionerId) {
            setFormData(prev => ({
                ...prev,
                projectType: 'direct',
                commissionerId: preSelectedCommissionerId
            }));
        }
    }, [preSelectedCommissionerId]);

    const handleNext = () => {
        if (step === 1 && !formData.category) {
            alert('Please select a category');
            return;
        }
        if (step === 2 && !formData.projectType) {
            alert('Please select how you want to work');
            return;
        }
        if (step === 3 && (!formData.title || !formData.description)) {
            alert('Please fill in project details');
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    client_id: (session?.user as any)?.id,
                }),
            });

            if (response.ok) {
                router.push('/dashboard/client/projects');
            } else {
                const err = await response.json();
                alert(err.error || 'Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-2 mb-8 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--primary)]" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
                <span>Cancel</span>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-8 px-4">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s
                                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30'
                                : 'bg-[var(--bg-input)] text-[var(--text-secondary)]'
                                }`}
                        >
                            {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                        </div>
                        {s < 5 && (
                            <div
                                className={`flex-1 h-1 mx-2 rounded-full ${step > s ? 'bg-[var(--primary)]' : 'bg-[var(--bg-input)]'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            <Card className="p-8 border-[var(--border-color)] shadow-sm">
                {/* Step 1: Category */}
                {step === 1 && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">What are we building?</h2>
                        <p className="text-gray-500 mb-8">Select the category that best fits your project.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${formData.category === cat.id
                                        ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-md scale-105'
                                        : 'border-gray-100 hover:border-gray-200 bg-white'
                                        }`}
                                >
                                    <span className="text-3xl">{cat.icon}</span>
                                    <span className="font-bold text-sm text-center text-gray-800">{cat.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Work Mode */}
                {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">How do you want to work?</h2>
                        <p className="text-gray-500 mb-8">Choose between direct booking or open requirement.</p>

                        {preSelectedCommissionerId && (
                            <div className="mb-8 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center gap-4">
                                <UserCheck className="w-6 h-6 text-indigo-600" />
                                <p className="text-sm text-indigo-900">Directly hiring <strong>{preSelectedCommissionerName || 'Verified Talent'}</strong></p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            <button
                                onClick={() => setFormData({ ...formData, projectType: 'direct' })}
                                className={`p-8 rounded-2xl border-2 transition-all text-left ${formData.projectType === 'direct' ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-gray-100'}`}
                            >
                                <Briefcase className="w-10 h-10 mb-4 text-[var(--primary)]" />
                                <h3 className="text-xl font-bold mb-2 text-gray-900">Direct Booking</h3>
                                <p className="text-sm text-gray-500">Work with your pre-selected commissioner immediately.</p>
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, projectType: 'open', commissionerId: '' })}
                                className={`p-8 rounded-2xl border-2 transition-all text-left ${formData.projectType === 'open' ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-gray-100'}`}
                            >
                                <Briefcase className="w-10 h-10 mb-4 text-[var(--accent)]" />
                                <h3 className="text-xl font-bold mb-2 text-gray-900">Post Requirement</h3>
                                <p className="text-sm text-gray-500">Get proposals from all available commissioners.</p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Specifics */}
                {step === 3 && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Project Details</h2>
                        <p className="text-gray-500 mb-8">What should we call this project?</p>
                        <div className="space-y-6">
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-[var(--primary)] outline-none bg-gray-50 font-bold text-lg"
                                placeholder="E.g. My Next Billion Dollar App"
                            />
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={6}
                                className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-[var(--primary)] outline-none bg-gray-50 text-gray-700"
                                placeholder="Describe your vision, requirements, and features..."
                            />
                        </div>
                    </div>
                )}

                {/* Step 4: Budget & Timeline */}
                {step === 4 && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Budget & Timing</h2>
                        <p className="text-gray-500 mb-8">Slide to set your budget (increments of 10k KES).</p>
                        <div className="space-y-12 py-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-bold text-gray-600 uppercase tracking-widest">Est. Budget</label>
                                    <span className="text-3xl font-black text-[var(--primary)]">KES {formData.budget.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range"
                                    min="10000"
                                    max="1000000"
                                    step="10000"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                                    className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                                />
                                <div className="flex justify-between text-xs font-bold text-gray-400">
                                    <span>10,000</span>
                                    <span>500,000</span>
                                    <span>1,000,000+</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-600 uppercase tracking-widest">Target Timeline</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['2 Weeks', '1 Month', '3 Months+', 'ASAP'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setFormData({ ...formData, timeline: t })}
                                            className={`py-3 rounded-xl border-2 font-bold transition-all ${formData.timeline === t ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]' : 'border-gray-100 text-gray-500'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Contact Info */}
                {step === 5 && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Final Step: Contact Info</h2>
                        <p className="text-gray-500 mb-8">How should the commissioner reach you?</p>
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-[var(--primary)] outline-none bg-gray-50 font-bold"
                                        placeholder="+254..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Best Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-[var(--primary)] outline-none bg-gray-50 font-bold"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-900 text-white p-6 rounded-3xl space-y-4">
                                <h4 className="font-bold flex items-center gap-2">🚀 Summary</h4>
                                <div className="grid grid-cols-2 gap-y-2 text-sm">
                                    <span className="text-gray-400">Category:</span> <span className="font-bold capitalize">{formData.category}</span>
                                    <span className="text-gray-400">Budget:</span> <span className="font-bold">KES {formData.budget.toLocaleString()}</span>
                                    <span className="text-gray-400">Timeline:</span> <span className="font-bold">{formData.timeline || 'Flexible'}</span>
                                    <span className="text-gray-400">Booking:</span> <span className="font-bold">{formData.projectType === 'direct' ? 'Direct' : 'Open Pool'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-12 pt-8 border-t border-gray-50">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className="px-8 py-3 rounded-2xl font-bold text-gray-400 hover:text-gray-900 disabled:opacity-0 transition-all flex items-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                    {step < 5 ? (
                        <button
                            onClick={handleNext}
                            className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-gray-200 flex items-center gap-2"
                        >
                            Continue
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-[var(--primary)] text-white px-10 py-4 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg shadow-[var(--primary)]/30 flex items-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Launch Project'}
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
}

