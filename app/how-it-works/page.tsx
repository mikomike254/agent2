'use client';

import Link from 'next/link';
import { Play, Shield, Zap, Target, ChevronLeft } from 'lucide-react';

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-[#f4f4f4]">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors mb-12 uppercase tracking-widest">
                    <ChevronLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="mb-20 text-center">
                    <h1 className="text-6xl lg:text-9xl font-black text-gray-900 tracking-tighter mb-6">
                        Production<br />Engine<sup className="text-4xl lg:text-6xl text-indigo-600">v2</sup>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        East Africa's most advanced delivery framework for high-trust software production. Built on transparency, speed, and safety.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {[
                        { title: 'Connect', desc: 'Browse verified Commissioners specialized in your industry.', icon: Zap, color: 'amber' },
                        { title: 'Spec', desc: 'Define technical requirements with precise milestone tracking.', icon: Target, color: 'blue' },
                        { title: 'Secure', desc: 'Fund the 43% deposit via M-Pesa or Card into Escrow.', icon: Shield, color: 'indigo' },
                        { title: 'Launch', desc: 'Approve deliveries as they go and pay the final balance.', icon: Play, color: 'green' }
                    ].map((step, i) => (
                        <div key={i} className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl shadow-indigo-100/50 hover:scale-[1.02] transition-transform">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center mb-8">
                                <step.icon className={`w-8 h-8 text-${step.color}-600`} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{step.title}</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-black text-white p-12 lg:p-24 rounded-[4rem] relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-16 items-center relative z-10">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl lg:text-7xl font-black tracking-tighter leading-none">
                                Why we built<br /><span className="text-indigo-400">CREATIVE.KE</span>
                            </h2>
                            <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-xl">
                                Traditional outsourcing is broken. We replaced vague promises with hard technical milestones and absolute payout security.
                            </p>
                            <Link href="/signup" className="inline-block px-12 py-6 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors">
                                Start Building
                            </Link>
                        </div>
                        <div className="w-full lg:w-1/3 aspect-square bg-[#1f7a5a] rounded-full blur-[120px] opacity-20 absolute -right-20 -bottom-20 pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
