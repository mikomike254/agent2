'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    CheckCircle,
    Circle,
    AlertCircle,
    Loader2,
    ArrowRight,
    ArrowLeft,
    Check
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface OnboardingSession {
    id: string;
    client_email: string;
    client_name: string;
    status: string;
    expires_at: string;
    progress_percent: number;
    current_step: number;
    total_steps: number;
}

interface OnboardingStep {
    id: string;
    step_number: number;
    step_name: string;
    description: string;
    status: string;
    step_data: any;
}

export default function ClientOnboardingPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [session, setSession] = useState<OnboardingSession | null>(null);
    const [steps, setSteps] = useState<OnboardingStep[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchOnboardingData();
    }, [token]);

    const fetchOnboardingData = async () => {
        try {
            const [sessionRes, stepsRes] = await Promise.all([
                fetch(`/api/onboarding/link/${token}`),
                fetch(`/api/onboarding/link/${token}/steps`)
            ]);

            const sessionData = await sessionRes.json();
            const stepsData = await stepsRes.json();

            if (!sessionData.success) {
                setError(sessionData.error || 'Invalid or expired link');
                setLoading(false);
                return;
            }

            setSession(sessionData.data);
            setSteps(stepsData.data || []);
            setCurrentStep(sessionData.data.current_step || 1);
            setLoading(false);
        } catch (err) {
            setError('Failed to load onboarding session');
            setLoading(false);
        }
    };

    const handleStepSubmit = async (stepNumber: number, data: any) => {
        setSaving(true);
        try {
            const response = await fetch(`/api/onboarding/link/${token}/steps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stepNumber,
                    status: 'completed',
                    stepData: data
                })
            });

            const result = await response.json();
            if (result.success) {
                // Update local state
                setSteps(prevSteps =>
                    prevSteps.map(step =>
                        step.step_number === stepNumber
                            ? { ...step, status: 'completed', step_data: data }
                            : step
                    )
                );

                // Move to next step or complete
                if (stepNumber < steps.length) {
                    setCurrentStep(stepNumber + 1);
                } else {
                    // All steps completed
                    await completeOnboarding();
                }
            } else {
                alert('Failed to save step: ' + result.error);
            }
        } catch (err) {
            alert('An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const completeOnboarding = async () => {
        try {
            const response = await fetch(`/api/onboarding/link/${token}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'completed'
                })
            });

            if (response.ok) {
                router.push('/onboard/success');
            }
        } catch (err) {
            console.error('Error completing onboarding:', err);
        }
    };

    const getStepIcon = (step: OnboardingStep, index: number) => {
        if (step.status === 'completed') {
            return <CheckCircle className="w-6 h-6 text-green-600" />;
        } else if (index + 1 === currentStep) {
            return <Circle className="w-6 h-6 text-indigo-600 fill-indigo-600" />;
        } else {
            return <Circle className="w-6 h-6 text-gray-300" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading your onboarding...</p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Invalid Link</h1>
                    <p className="text-gray-600 mb-6">{error || 'This onboarding link is invalid or has expired.'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                    >
                        Go to Homepage
                    </button>
                </Card>
            </div>
        );
    }

    const currentStepData = steps.find(s => s.step_number === currentStep);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">Client Onboarding</h1>
                            <p className="text-gray-500 mt-1">Welcome, {session.client_name}!</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">Overall Progress</div>
                            <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-600 transition-all duration-500"
                                        style={{ width: `${session.progress_percent}%` }}
                                    />
                                </div>
                                <span className="text-lg font-black text-gray-900">
                                    {session.progress_percent}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Sidebar - Step Navigation */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-6">
                            <h2 className="text-lg font-black text-gray-900 mb-4">Your Journey</h2>
                            <div className="space-y-4">
                                {steps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={`flex items-start gap-3 cursor-pointer transition-all ${index + 1 === currentStep
                                            ? 'opacity-100'
                                            : step.status === 'completed'
                                                ? 'opacity-75 hover:opacity-100'
                                                : 'opacity-40'
                                            }`}
                                        onClick={() => {
                                            if (step.status === 'completed' || index + 1 === currentStep) {
                                                setCurrentStep(index + 1);
                                            }
                                        }}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getStepIcon(step, index)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-bold text-sm ${index + 1 === currentStep ? 'text-indigo-600' : 'text-gray-900'
                                                }`}>
                                                Step {step.step_number}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-0.5">
                                                {step.step_name}
                                            </div>
                                        </div>
                                        {step.status === 'completed' && (
                                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Main Content - Current Step */}
                    <div className="lg:col-span-2">
                        <Card className="p-8">
                            {currentStepData && (
                                <StepContent
                                    step={currentStepData}
                                    onSubmit={(data) => handleStepSubmit(currentStep, data)}
                                    onPrevious={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                                    isFirst={currentStep === 1}
                                    isLast={currentStep === steps.length}
                                    saving={saving}
                                />
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step Content Component
function StepContent({
    step,
    onSubmit,
    onPrevious,
    isFirst,
    isLast,
    saving
}: {
    step: OnboardingStep;
    onSubmit: (data: any) => void;
    onPrevious: () => void;
    isFirst: boolean;
    isLast: boolean;
    saving: boolean;
}) {
    const [formData, setFormData] = useState(step.step_data || {});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">{step.step_name}</h2>
                <p className="text-gray-600">{step.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Render different forms based on step name */}
                {step.step_name === 'Company Information' && (
                    <CompanyInfoForm formData={formData} setFormData={setFormData} />
                )}
                {step.step_name === 'Project Details' && (
                    <ProjectDetailsForm formData={formData} setFormData={setFormData} />
                )}
                {step.step_name === 'Budget & Timeline' && (
                    <BudgetTimelineForm formData={formData} setFormData={setFormData} />
                )}
                {step.step_name === 'Technical Requirements' && (
                    <TechnicalRequirementsForm formData={formData} setFormData={setFormData} />
                )}
                {step.step_name === 'Review & Submit' && (
                    <ReviewSubmitForm formData={formData} />
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                    {!isFirst && (
                        <button
                            type="button"
                            onClick={onPrevious}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Previous
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                {isLast ? 'Complete Onboarding' : 'Continue'}
                                {!isLast && <ArrowRight className="w-4 h-4" />}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

// Form Components for Each Step
function CompanyInfoForm({ formData, setFormData }: any) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                <input
                    type="text"
                    required
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    placeholder="Acme Corporation"
                />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
                    <input
                        type="text"
                        required
                        value={formData.industry || ''}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                        placeholder="Technology, Healthcare, etc."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                    <select
                        value={formData.companySize || ''}
                        onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    >
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    placeholder="https://example.com"
                />
            </div>
        </div>
    );
}

function ProjectDetailsForm({ formData, setFormData }: any) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                <input
                    type="text"
                    required
                    value={formData.projectTitle || ''}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    placeholder="E-commerce Platform Development"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Description *</label>
                <textarea
                    required
                    rows={5}
                    value={formData.projectDescription || ''}
                    onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none"
                    placeholder="Describe your project requirements, goals, and expected outcomes..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Type *</label>
                <select
                    required
                    value={formData.projectType || ''}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                >
                    <option value="">Select project type</option>
                    <option value="web_app">Web Application</option>
                    <option value="mobile_app">Mobile Application</option>
                    <option value="website">Website</option>
                    <option value="api">API Development</option>
                    <option value="other">Other</option>
                </select>
            </div>
        </div>
    );
}

function BudgetTimelineForm({ formData, setFormData }: any) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range (KES) *</label>
                <select
                    required
                    value={formData.budgetRange || ''}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                >
                    <option value="">Select budget range</option>
                    <option value="50000-100000">KES 50,000 - 100,000</option>
                    <option value="100000-250000">KES 100,000 - 250,000</option>
                    <option value="250000-500000">KES 250,000 - 500,000</option>
                    <option value="500000-1000000">KES 500,000 - 1,000,000</option>
                    <option value="1000000+">KES 1,000,000+</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Timeline *</label>
                <select
                    required
                    value={formData.timeline || ''}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                >
                    <option value="">Select timeline</option>
                    <option value="1-2weeks">1-2 weeks</option>
                    <option value="2-4weeks">2-4 weeks</option>
                    <option value="1-2months">1-2 months</option>
                    <option value="2-3months">2-3 months</option>
                    <option value="3-6months">3-6 months</option>
                    <option value="6months+">6+ months</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Launch Date</label>
                <input
                    type="date"
                    value={formData.targetDate || ''}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
            </div>
        </div>
    );
}

function TechnicalRequirementsForm({ formData, setFormData }: any) {
    const [selectedSkills, setSelectedSkills] = useState<string[]>(formData.skills || []);

    const availableSkills = [
        'React', 'Next.js', 'Node.js', 'Python', 'TypeScript',
        'Mobile Development', 'UI/UX Design', 'Database Design',
        'API Integration', 'Cloud Services', 'DevOps'
    ];

    const toggleSkill = (skill: string) => {
        const updated = selectedSkills.includes(skill)
            ? selectedSkills.filter(s => s !== skill)
            : [...selectedSkills, skill];
        setSelectedSkills(updated);
        setFormData({ ...formData, skills: updated });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                    {availableSkills.map((skill) => (
                        <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${selectedSkills.includes(skill)
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-gray-300 hover:border-indigo-300'
                                }`}
                        >
                            {skill}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Requirements</label>
                <textarea
                    rows={4}
                    value={formData.additionalRequirements || ''}
                    onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none"
                    placeholder="Any specific technical requirements, integrations, or preferences..."
                />
            </div>
        </div>
    );
}

function ReviewSubmitForm({ formData }: any) {
    return (
        <div className="space-y-6">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
                <h3 className="text-lg font-black text-indigo-900 mb-4">Review Your Information</h3>
                <p className="text-sm text-indigo-700">
                    Please review all the information you've provided. Once you submit, our team will review your project and get in touch shortly.
                </p>
            </div>
            <div className="prose prose-sm max-w-none">
                <p className="text-gray-600">
                    By submitting this form, you agree to our terms of service and confirm that all information provided is accurate.
                </p>
            </div>
        </div>
    );
}
