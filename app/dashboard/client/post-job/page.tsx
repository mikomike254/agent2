'use client';

import { useState, useEffect } from 'react';
import { Briefcase, FileText, DollarSign, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PostJobPage() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        timeline: '',
        requirements: '',
        category: 'web_development',
        commissioner_id: ''
    });
    const [commissioners, setCommissioners] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetch('/api/commissioners').then(res => res.json()).then(data => {
            if (data.success) setCommissioners(data.data);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    budget: parseFloat(formData.budget) || 0
                })
            });

            const result = await res.json();

            if (result.success) {
                setSuccess(true);
                setFormData({
                    title: '',
                    description: '',
                    budget: '',
                    timeline: '',
                    requirements: '',
                    category: 'web_development',
                    commissioner_id: ''
                });

                setTimeout(() => {
                    window.location.href = '/jobs';
                }, 2000);
            } else {
                alert(result.message || 'Failed to post job');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h2>
                <p className="text-gray-600">Your job is now live on the job board. Redirecting...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Post a Job</h1>
                <p className="text-gray-600 mt-1">Create a new project listing and connect with commissioners</p>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Job Title *
                        </label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                                placeholder="e.g., Build a Mobile App for E-commerce"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Description *
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none min-h-[120px]"
                                placeholder="Describe your project in detail..."
                                required
                            />
                        </div>
                    </div>

                    {/* Budget & Timeline */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Budget (KES)
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                                    placeholder="50000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Timeline
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.timeline}
                                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                                    placeholder="e.g., 2-3 months"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                        >
                            <option value="web_development">Web Development</option>
                            <option value="mobile_app">Mobile App</option>
                            <option value="ui_ux_design">UI/UX Design</option>
                            <option value="data_science">Data Science</option>
                            <option value="devops">DevOps</option>
                            <option value="general">General</option>
                        </select>
                    </div>

                    {/* Requirements */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Requirements (Optional)
                        </label>
                        <textarea
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none min-h-[80px]"
                            placeholder="List any specific requirements..."
                        />
                    </div>

                    {/* Commissioner Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Select Project Commissioner *
                        </label>
                        <select
                            value={formData.commissioner_id}
                            onChange={(e) => setFormData({ ...formData, commissioner_id: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                            required
                        >
                            <option value="">Select a commissioner...</option>
                            {commissioners.map(c => (
                                <option key={c.id} value={c.id}>{c.name} — {c.specialties?.[0]}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-400 mt-2 uppercase font-black">Selecting a verified commissioner ensures premium delivery quality.</p>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Posting...' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
