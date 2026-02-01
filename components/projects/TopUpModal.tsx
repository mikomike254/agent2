
'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { CreditCard, Phone, Loader2, DollarSign, CheckCircle } from 'lucide-react';

interface TopUpModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children?: React.ReactNode;
}

export function TopUpModal({ open, onOpenChange, children }: TopUpModalProps) {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'mpesa' | 'card'>('mpesa');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleTopUp = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) < 100) {
            alert('Please enter a valid amount (min KES 100)');
            return;
        }

        setLoading(true);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onOpenChange(false);
                setAmount('');
            }, 2000);
        } catch (error) {
            console.error('Top up error:', error);
            alert('Failed to process top up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* 
               If children acts as trigger, we assume parent handles open state via onClick on children.
               The current usage pattern in Shadcn is different from this custom Dialog.
               This custom Dialog takes isOpen prop.
            */}
            <Dialog isOpen={open} onClose={() => onOpenChange(false)} title="Add Funds to Wallet">
                {success ? (
                    <div className="py-8 flex flex-col items-center text-center animate-in fade-in zoom-in">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">Top Up Successful!</h3>
                        <p className="text-[var(--text-secondary)] mt-2">
                            KES {Number(amount).toLocaleString()} has been added to your wallet.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[var(--text-secondary)]">Amount (KES)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-medium">KES</span>
                                <input
                                    type="number"
                                    placeholder="5000"
                                    className="w-full pl-12 pr-4 py-3 border border-[var(--bg-input)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none bg-[var(--bg-card)] text-lg font-bold"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]">Minimum top up: KES 100</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[var(--text-secondary)]">Payment Method</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    className={`
                                        cursor-pointer p-4 border rounded-xl flex flex-col items-center gap-2 transition-all
                                        ${method === 'mpesa'
                                            ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500 ring-offset-1'
                                            : 'border-[var(--bg-input)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                                        }
                                    `}
                                    onClick={() => setMethod('mpesa')}
                                >
                                    <Phone className="w-6 h-6" />
                                    <span className="font-medium text-sm">M-Pesa</span>
                                </div>
                                <div
                                    className={`
                                        cursor-pointer p-4 border rounded-xl flex flex-col items-center gap-2 transition-all
                                        ${method === 'card'
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500 ring-offset-1'
                                            : 'border-[var(--bg-input)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                                        }
                                    `}
                                    onClick={() => setMethod('card')}
                                >
                                    <CreditCard className="w-6 h-6" />
                                    <span className="font-medium text-sm">Card</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg text-xs text-[var(--text-secondary)]">
                            <p>Funds will be available immediately after payment confirmation. Secure payment processed by Paystack.</p>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="px-4 py-2 border border-[var(--bg-input)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTopUp}
                                disabled={loading || !amount}
                                className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Processing...' : `Pay KES ${amount ? Number(amount).toLocaleString() : '0'}`}
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
}
