'use client';

import { CheckCircle, Home, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function OnboardingSuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-4xl font-black text-gray-900 mb-4">
                    Onboarding Complete! 🎉
                </h1>

                <p className="text-xl text-gray-600 mb-8">
                    Thank you for completing your onboarding. Our team will review your information and get back to you within 24 hours.
                </p>

                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6 mb-8">
                    <h2 className="text-lg font-black text-indigo-900 mb-3">What Happens Next?</h2>
                    <div className="space-y-3 text-left">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">1</span>
                            </div>
                            <div>
                                <p className="font-bold text-indigo-900">Project Review</p>
                                <p className="text-sm text-indigo-700">Our team will carefully review your project requirements and budget.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">2</span>
                            </div>
                            <div>
                                <p className="font-bold text-indigo-900">Proposal & Quotation</p>
                                <p className="text-sm text-indigo-700">You'll receive a detailed proposal with timeline and cost breakdown.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">3</span>
                            </div>
                            <div>
                                <p className="font-bold text-indigo-900">Kickoff Meeting</p>
                                <p className="text-sm text-indigo-700">We'll schedule a call to discuss your project in detail and answer any questions.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">4</span>
                            </div>
                            <div>
                                <p className="font-bold text-indigo-900">Project Begins</p>
                                <p className="text-sm text-indigo-700">After agreement and initial payment, we'll start building your solution!</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-8">
                    <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                            <p className="font-bold text-yellow-900 mb-1">Check Your Email</p>
                            <p className="text-sm text-yellow-700">
                                We've sent a confirmation email with next steps. If you don't see it, please check your spam folder.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Go to Homepage
                    </Link>
                    <a
                        href="mailto:support@techdevelopers.co.ke"
                        className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Mail className="w-5 h-5" />
                        Contact Support
                    </a>
                </div>
            </Card>
        </div>
    );
}
