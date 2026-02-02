'use client';

import { useState } from 'react';
import { AlertTriangle, X, Send, Loader2, Upload } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface DisputeWidgetProps {
    projectId: string;
    projectTitle?: string;
    onDisputeCreated?: () => void;
}

export default function DisputeWidget({ projectId, projectTitle, onDisputeCreated }: DisputeWidgetProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        reason: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/disputes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    reason: formData.reason,
                    description: formData.description
                })
            });

            const result = await res.json();

            if (result.success) {
                alert('Dispute raised successfully. Our admin team will review your case.');
                setFormData({
                    reason: '',
                    description: ''
                });
                setIsOpen(false);
                onDisputeCreated?.();
            } else {
                alert(result.message || 'Failed to raise dispute');
            }
        } catch (error) {
            console.error('Error raising dispute:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Raise Dispute Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all shadow-xl shadow-rose-200"
            >
                <AlertTriangle className="w-4 h-4" />
                Raise Dispute
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-rose-100 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-rose-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Raise Dispute</h2>
                                <p className="text-sm text-gray-500">Project: {projectTitle || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                            <p className="text-xs text-amber-800 font-medium">
                                <AlertTriangle className="w-4 h-4 inline mr-2" />
                                Disputes are reviewed by our admin team. Please provide detailed information to help us resolve your case fairly.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Reason for Dispute
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="Brief summary of the issue"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Detailed Description
                                </label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                                    placeholder="Provide full context: what happened, when it occurred, what you expected, and any relevant details..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Dispute
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
