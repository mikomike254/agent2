'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import {
    FileText,
    Banknote,
    Loader2,
    Target,
    Calendar,
    Code,
    Users
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface UniversalProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: 'client' | 'developer' | 'commissioner' | 'admin';
}

export function UniversalProjectModal({ isOpen, onClose, role }: UniversalProjectModalProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        total_value: '',
        category: 'general',
        deadline: '',
        client_email: role !== 'client' ? '' : (session?.user?.email || '')
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    creator_role: role
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('Project created successfully!');
                onClose();
                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    total_value: '',
                    category: 'general',
                    deadline: '',
                    client_email: role !== 'client' ? '' : (session?.user?.email || '')
                });
                window.location.reload(); // Refresh to show new project
            } else {
                alert(`Error: ${result.message || 'Failed to create project'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Start New Project">
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-4">
                    {/* Project Title */}
                    <div className="relative">
                        <Target className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="title"
                            required
                            placeholder="Project Title (e.g. E-commerce Mobile App)"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                        />
                    </div>

                    {/* Client Email (if not client) */}
                    {role !== 'client' && (
                        <div className="relative">
                            <Users className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                name="client_email"
                                required
                                placeholder="Client Email Address"
                                value={formData.client_email}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                            />
                        </div>
                    )}

                    {/* Category & Budget Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <Code className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium appearance-none"
                            >
                                <option value="general">Category</option>
                                <option value="web">Web Dev</option>
                                <option value="mobile">Mobile App</option>
                                <option value="design">UI/UX Design</option>
                                <option value="backend">Backend/API</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Banknote className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="number"
                                name="total_value"
                                required
                                placeholder="Budget (KES)"
                                value={formData.total_value}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="relative">
                        <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                        <textarea
                            name="description"
                            required
                            rows={4}
                            placeholder="Tell us more about the project goals, requirements, and scope..."
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium resize-none"
                        />
                    </div>

                    {/* Deadline */}
                    <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-gray-500"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 flex items-center justify-center gap-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Launch Project'}
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-4 uppercase font-black tracking-widest">
                        SECURE ESCROW PROTECTION ENABLED
                    </p>
                </div>
            </form>
        </Dialog>
    );
}
