'use client';

import Link from 'next/link';
import { FileText, ChevronLeft } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-12 lg:py-24">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors mb-12 uppercase tracking-widest">
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="flex items-center gap-4 mb-12">
                    <div className="w-16 h-16 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter">Terms of Service</h1>
                        <p className="text-gray-500 font-medium">Agreement for version 2026.1</p>
                    </div>
                </div>

                <div className="prose prose-blue max-w-none space-y-12 text-lg text-gray-600 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">1. Acceptance of Terms</h2>
                        <p>By accessing or using CREATIVE.KE, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you do not have permission to access the platform.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">2. Escrow & Payments</h2>
                        <p>Clients are required to pay a 43% deposit to initiate projects. This deposit is held in escrow. Final payment is due upon successful delivery of the project milestones as agreed upon in the project specifications.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">3. Refund Policy</h2>
                        <p>We provide a 110% refund guarantee for projects where we fail to deliver according to specifications. This guarantee is subject to arbitration by our internal audit team.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">4. User Responsibilities</h2>
                        <p>Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
