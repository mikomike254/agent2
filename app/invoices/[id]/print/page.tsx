'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Printer, Download, ShieldCheck, Zap } from 'lucide-react';

export default function InvoicePrintPage() {
    const params = useParams();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await fetch(`/api/invoices`);
                const data = await res.json();
                if (data.success) {
                    const found = data.data.find((i: any) => i.id === params.id);
                    setInvoice(found);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [params.id]);

    if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em]">Generating Secure Document...</div>;
    if (!invoice) return <div className="p-20 text-center text-red-500 font-bold">Document not found in ledger.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-12 print:p-0 print:bg-white">
            {/* Control Bar */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-indigo-100">
                    <Printer className="w-5 h-5" />
                    Print Receipt
                </button>
                <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    Verified by CREATIVE.KE Escrow
                </div>
            </div>

            {/* Invoice Document */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100 print:shadow-none print:rounded-none print:border-none">
                {/* Header Grid */}
                <div className="grid grid-cols-2 gap-8 p-12 bg-gray-50/50 border-b border-gray-100">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <Zap className="w-8 h-8 text-indigo-600 fill-indigo-600" />
                            <h1 className="text-2xl font-black tracking-tighter uppercase italic">CREATIVE.<span className="text-indigo-600">KE</span></h1>
                        </div>
                        <div className="space-y-1 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <p>Premium Tech Marketplace</p>
                            <p>Nairobi, Kenya</p>
                            <p>billing@creative.ke</p>
                        </div>
                    </div>
                    <div className="text-right flex flex-col justify-end">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">RECEIPT</h2>
                        <p className="text-sm font-black text-indigo-600 font-mono italic">#{invoice.invoice_number}</p>
                        <p className="text-xs font-bold text-gray-400 mt-2">{new Date(invoice.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                {/* Billing Details */}
                <div className="grid grid-cols-2 gap-12 p-12">
                    <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">ISSUED TO</h4>
                        <div className="space-y-1">
                            <p className="font-black text-gray-900 text-lg uppercase">{invoice.client?.user?.name || 'Authorized Client'}</p>
                            <p className="text-sm text-gray-500 font-medium">{invoice.client?.user?.email}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">PROJECT NODE</h4>
                        <div className="space-y-1">
                            <p className="font-black text-gray-900 text-lg uppercase tracking-tight">{invoice.project?.title}</p>
                            <p className="text-[10px] text-indigo-500 font-black uppercase">Development Lifecycle Phase</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="p-12 pt-0">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-gray-950 font-black text-[10px] uppercase tracking-widest">
                                <th className="pb-4">Description of Service</th>
                                <th className="pb-4 text-right">Unit Price</th>
                                <th className="pb-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 italic">
                            <tr>
                                <td className="py-8">
                                    <p className="font-black text-gray-900 uppercase tracking-tight">{invoice.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">Industrial development and intellectual property transfer.</p>
                                </td>
                                <td className="py-8 text-right font-bold text-gray-900">{invoice.currency} {Number(invoice.amount).toLocaleString()}</td>
                                <td className="py-8 text-right font-black text-indigo-600">{invoice.currency} {Number(invoice.amount).toLocaleString()}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="border-t-4 border-gray-950">
                                <td className="py-6"></td>
                                <td className="py-6 text-right font-black text-gray-400 uppercase tracking-widest text-xs">Total Amount Secured</td>
                                <td className="py-6 text-right font-black text-2xl text-gray-950 italic">{invoice.currency} {Number(invoice.amount).toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Secure Footer */}
                <div className="p-12 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-900 uppercase">Tamper-Proof Ledger</p>
                            <p className="text-[10px] text-gray-500 font-medium">This document is digitally signed by CREATIVE.KE</p>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Status</p>
                        <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {invoice.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="max-w-4xl mx-auto mt-8 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                    This is a generated document. For inquiries, contact support@creative.ke <br />
                    Property of CREATIVE.KE — All Rights Reserved 2026.
                </p>
            </div>
        </div>
    );
}
