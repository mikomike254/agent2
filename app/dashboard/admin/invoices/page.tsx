'use client';

import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Mail, DollarSign, Clock, Plus, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AdminInvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending_approval');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        projectId: '',
        amount: '',
        description: '',
        invoice_number: ''
    });

    useEffect(() => {
        fetchInvoices();
    }, [filter]);

    useEffect(() => {
        if (showCreateModal) {
            fetch('/api/projects')
                .then(res => res.json())
                .then(data => {
                    if (data.success) setProjects(data.data);
                });
        }
    }, [showCreateModal]);

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            // Find client_id from selected project
            const project = projects.find(p => p.id === newInvoice.projectId);
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: newInvoice.projectId,
                    client_id: project?.client_id,
                    amount: parseFloat(newInvoice.amount),
                    description: newInvoice.description,
                    invoice_number: newInvoice.invoice_number || `INV-ADM-${Date.now()}`
                })
            });
            if (res.ok) {
                alert('Invoice issued successfully!');
                setShowCreateModal(false);
                fetchInvoices();
            }
        } catch (error) {
            console.error('Create invoice error:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/invoices?status=${filter}`);
            const result = await response.json();
            if (result.success) {
                setInvoices(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (invoiceId: string) => {
        if (!confirm('Approve this invoice and send payment link to client?')) return;

        try {
            const response = await fetch(`/api/invoices/${invoiceId}/approve`, {
                method: 'POST',
            });

            if (response.ok) {
                alert('Invoice approved and email sent!');
                fetchInvoices();
            } else {
                alert('Failed to approve invoice');
            }
        } catch (error) {
            console.error('Error approving invoice:', error);
        }
    };

    const handleReject = async (invoiceId: string) => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        try {
            const response = await fetch(`/api/invoices/${invoiceId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });

            if (response.ok) {
                alert('Invoice rejected');
                fetchInvoices();
            } else {
                alert('Failed to reject invoice');
            }
        } catch (error) {
            console.error('Error rejecting invoice:', error);
        }
    };

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Invoice Management</h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        Review and approve client invoice requests
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-indigo-200"
                >
                    <Plus className="w-4 h-4" /> Issue Invoice
                </button>
            </div>

            {/* Create Invoice Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-lg p-8 space-y-6 bg-white rounded-[2.5rem] shadow-2xl relative">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Issue New Invoice</h2>
                            <p className="text-sm text-gray-500 font-medium">Create and send an invoice request directly to a client.</p>
                        </div>
                        <form onSubmit={handleCreateInvoice} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Project</label>
                                <select
                                    required
                                    value={newInvoice.projectId}
                                    onChange={e => setNewInvoice({ ...newInvoice, projectId: e.target.value })}
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold"
                                >
                                    <option value="">Select a project...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">KSh Amount</label>
                                    <input
                                        required
                                        type="number"
                                        value={newInvoice.amount}
                                        onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-indigo-600"
                                        placeholder="50,000"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Invoice # (Auto)</label>
                                    <input
                                        type="text"
                                        value={newInvoice.invoice_number}
                                        onChange={e => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-gray-500 font-medium"
                                        placeholder="INV-ADM-..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Narrative/Items</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={newInvoice.description}
                                    onChange={e => setNewInvoice({ ...newInvoice, description: e.target.value })}
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm"
                                    placeholder="Describe the payment request scope..."
                                />
                            </div>
                            <button
                                disabled={isCreating}
                                type="submit"
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Dispatch Invoice'}
                            </button>
                        </form>
                    </Card>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {['pending_approval', 'approved', 'rejected'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === status
                            ? 'bg-[var(--primary)] text-white shadow-lg'
                            : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-[var(--bg-input)]/80'
                            }`}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-[var(--bg-card)] border-[var(--bg-input)]">
                    <Clock className="w-6 h-6 text-orange-600 mb-2" />
                    <p className="text-sm text-[var(--text-secondary)]">Pending Approval</p>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                        {invoices.filter(i => i.status === 'pending_approval').length}
                    </h3>
                </Card>
                <Card className="p-6 bg-[var(--bg-card)] border-[var(--bg-input)]">
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                    <p className="text-sm text-[var(--text-secondary)]">Approved Today</p>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">3</h3>
                </Card>
                <Card className="p-6 bg-[var(--bg-card)] border-[var(--bg-input)]">
                    <DollarSign className="w-6 h-6 text-indigo-600 mb-2" />
                    <p className="text-sm text-[var(--text-secondary)]">Total Value</p>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">KES 450K</h3>
                </Card>
            </div>

            {/* Invoices Table */}
            <Card className="overflow-hidden border-[var(--bg-input)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--bg-input)]/30 border-b border-[var(--bg-input)]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                    Client
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                    Payment
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                    Requested
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--bg-input)] bg-[var(--bg-card)]">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6">
                                            <div className="h-4 bg-[var(--bg-input)] rounded"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)] italic">
                                        No invoices found
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-[var(--bg-input)]/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[var(--text-primary)]">
                                                {invoice.client?.user?.name || 'Unknown Client'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                                                <code className="text-sm">{invoice.client?.user?.email || 'N/A'}</code>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[var(--text-primary)]">
                                                KES {Number(invoice.amount || 0).toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-[var(--text-secondary)]">
                                                {invoice.project?.title || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                            {new Date(invoice.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {invoice.status === 'pending_approval' ? (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleApprove(invoice.id)}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Approve & Send
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(invoice.id)}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${invoice.status === 'approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {invoice.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
