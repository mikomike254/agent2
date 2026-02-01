
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight, ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

const STEPS = [
    { id: 1, title: 'Basics' },
    { id: 2, title: 'Details' },
    { id: 3, title: 'Review' }
];

export default function CreateProjectPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectType: 'web_app', // 'web_app', 'mobile_app', 'marketing', 'other'
        budget: '',
        timeline: '',
        skills: '',
        attachments: [] as File[] // Handling files separately usually
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step < STEPS.length) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Prepare payload
            const payload = {
                title: formData.title,
                description: formData.description,
                projectType: 'open', // defaulted to 'open' for now, or use formData.projectType if schema supports
                budget: parseFloat(formData.budget) || 0,
                timeline: formData.timeline,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                // attachments: handled separately or via another endpoint if schema supports links
            };

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                // Redirect to project page or dashboard
                router.push('/dashboard/client');
            } else {
                alert(result.error || 'Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Create New Project</h1>
                <p className="text-[var(--text-secondary)] mt-2">Share your idea with our expert developers</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--bg-input)] -z-10" />
                {STEPS.map((s) => {
                    const isActive = s.id === step;
                    const isCompleted = s.id < step;
                    return (
                        <div key={s.id} className="flex flex-col items-center bg-[var(--bg-card)] px-2">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                                ${isActive || isCompleted
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--bg-test)] text-[var(--text-secondary)] border border-[var(--bg-input)]'
                                }
                            `}>
                                {isCompleted ? <CheckCircle className="w-5 h-5" /> : s.id}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                                {s.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            <Card className="p-8">
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label>Project Title</Label>
                            <Input
                                placeholder="e.g. E-commerce Mobile App"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Project Category</Label>
                            <Select
                                value={formData.projectType}
                                onValueChange={(val) => handleChange('projectType', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="web_app">Web Application</SelectItem>
                                    <SelectItem value="mobile_app">Mobile Application</SelectItem>
                                    <SelectItem value="website">Website</SelectItem>
                                    <SelectItem value="marketing">Marketing Campaign</SelectItem>
                                    <SelectItem value="embedded">Embedded Systems</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Describe your project requirements in detail..."
                                className="min-h-[150px]"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Estimated Budget (KES)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 50000"
                                    value={formData.budget}
                                    onChange={(e) => handleChange('budget', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Timeline (Weeks)</Label>
                                <Input
                                    placeholder="e.g. 4 weeks"
                                    value={formData.timeline}
                                    onChange={(e) => handleChange('timeline', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Required Skills (comma separated)</Label>
                            <Input
                                placeholder="e.g. React, Node.js, UI/UX Design"
                                value={formData.skills}
                                onChange={(e) => handleChange('skills', e.target.value)}
                            />
                        </div>

                        <div className="p-4 border border-dashed border-[var(--bg-input)] rounded-xl bg-[var(--bg-secondary)] flex flex-col items-center justify-center text-center">
                            <Upload className="w-8 h-8 text-[var(--text-secondary)] mb-2" />
                            <p className="text-sm font-medium text-[var(--text-primary)]">Upload Attachments</p>
                            <p className="text-xs text-[var(--text-secondary)] mb-4">Drag & drop or click to upload relevant documents</p>
                            <Button variant="outline" size="sm" type="button">
                                Choose Files
                            </Button>
                            {/* File upload logic logic to be implemented */}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-[var(--bg-secondary)] p-6 rounded-xl space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Project Title</h3>
                                <p className="text-lg font-bold text-[var(--text-primary)]">{formData.title}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Category</h3>
                                <p className="text-[var(--text-primary)] capitalize">{formData.projectType.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Budget & Timeline</h3>
                                <p className="text-[var(--text-primary)]">KES {formData.budget || 'Negotiable'} • {formData.timeline || 'Flexible'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Description</h3>
                                <p className="text-[var(--text-primary)] whitespace-pre-wrap">{formData.description}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-[var(--bg-input)]">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={step === 1 || submitting}
                        className="w-32"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={submitting}
                        className="w-32 btn-primary"
                    >
                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {step === STEPS.length ? 'Submit' : 'Next'}
                        {!submitting && step < STEPS.length && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
