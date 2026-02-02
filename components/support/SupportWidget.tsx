'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, Loader2, LifeBuoy, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface SupportWidgetProps {
    className?: string;
}

export default function SupportWidget({ className = '' }: SupportWidgetProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        priority: 'medium',
        category: 'general'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (result.success) {
                alert('Support ticket created successfully! Our team will respond soon.');
                setFormData({
                    subject: '',
                    description: '',
                    priority: 'medium',
                    category: 'general'
                });
                setIsOpen(false);
            } else {
                alert(result.message || 'Failed to create ticket');
            }
        } catch (error) {
            console.error('Error creating support ticket:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-40 p-4 bg-rose-600 text-white rounded-full shadow-2xl hover:bg-rose-700 transition-all hover:scale-110 ${className}`}
                aria-label="Get Support"
            >
                <LifeBuoy className="w-6 h-6" />
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

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-rose-100 rounded-xl">
                                <MessageSquare className="w-6 h-6 text-rose-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Get Support</h2>
                                <p className="text-sm text-gray-500">We're here to help you</p>
                            </div>
                        </div>

                        {/* WhatsApp Quick Link */}
                        <div className="mb-8">
                            <a
                                href="https://wa.me/254793832286?text=Hello%20CREATIVE.KE%20Support,%20I%20need%20assistance%20with..."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl group hover:bg-green-600 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200 group-hover:bg-white group-hover:text-green-600 transition-colors">
                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408.001 12.045c0 2.121.554 4.191 1.605 6.01L0 24l6.135-1.61a11.782 11.782 0 005.912 1.586h.005c6.635 0 12.046-5.409 12.05-12.046a11.81 11.81 0 00-3.689-8.532z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black text-green-900 group-hover:text-white transition-colors">Chat on WhatsApp</p>
                                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest group-hover:text-green-50 transition-colors">Immediate Response</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-green-400 group-hover:text-white transition-all group-hover:translate-x-1" />
                            </a>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                                <span className="px-4 bg-white">OR OPEN A TICKET</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="Brief description of your issue"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="dispute">Raise Dispute / Problem</option>
                                    <option value="billing">Billing Question</option>
                                    <option value="project">Project Support</option>
                                    <option value="account">Account Management</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Priority
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                >
                                    <option value="low">Low - General question</option>
                                    <option value="medium">Medium - Need help soon</option>
                                    <option value="high">High - Urgent issue</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Description
                                </label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                                    placeholder="Please provide details about your issue or question..."
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
                                        Submit Ticket
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
