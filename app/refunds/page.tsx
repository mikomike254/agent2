'use client';

import Link from 'next/link';
import { RotateCcw, ChevronLeft } from 'lucide-react';

export default function RefundsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-12 lg:py-24">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors mb-12 uppercase tracking-widest">
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="flex items-center gap-4 mb-12">
                    <div className="w-16 h-16 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-600">
                        <RotateCcw className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter">Refund Policy</h1>
                        <p className="text-gray-500 font-medium">110% Satisfaction Guarantee</p>
                    </div>
                </div>

                <div className="prose prose-red max-w-none space-y-12 text-lg text-gray-600 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">The CREATIVE.KE Promise</h2>
                        <p>We believe in absolute accountability. If our developers fail to deliver a project that meets the agreed-upon technical specifications, we don't just return your money—we pay you for your lost time.</p>
                    </section>

                    <section className="p-8 bg-red-50 rounded-3xl border border-red-100">
                        <h2 className="text-2xl font-black text-red-900 uppercase tracking-tight mb-4">How it Works</h2>
                        <ul className="list-disc pl-6 space-y-2 text-red-800">
                            <li><strong>43% Deposit Protection:</strong> Your initial deposit is held in escrow.</li>
                            <li><strong>Dispute Initiation:</strong> If a milestone fails, you can raise a dispute.</li>
                            <li><strong>Audit Review:</strong> Our tech leads review the delivery vs technical spec.</li>
                            <li><strong>110% Payout:</strong> If the failure is on our side, you receive 100% of your deposit plus an additional 10% credit.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
