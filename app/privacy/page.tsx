'use client';

import Link from 'next/link';
import { Shield, ChevronLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-12 lg:py-24">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors mb-12 uppercase tracking-widest">
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="flex items-center gap-4 mb-12">
                    <div className="w-16 h-16 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter">Privacy Policy</h1>
                        <p className="text-gray-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="prose prose-indigo max-w-none space-y-12 text-lg text-gray-600 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">1. Information We Collect</h2>
                        <p>We collect information that you provide directly to us, including your name, email address, phone number, and any other information you choose to provide. For Commissioners and Developers, we also collect KYC data to ensure marketplace integrity.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">2. How We Use Your Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, including to facilitate projects between Clients, Commissioners, and Developers, and to process payments through our secure escrow system.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">3. Data Security</h2>
                        <p>We implement a variety of security measures to maintain the safety of your personal information. All financial transactions are processed through secure gateways and are never stored on our servers.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">4. Cookies</h2>
                        <p>We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
