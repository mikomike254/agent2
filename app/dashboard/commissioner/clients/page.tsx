'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    CheckCircle,
    Clock,
    AlertCircle,
    Mail,
    Phone,
    Building,
    Link as LinkIcon,
    Copy
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface Client {
    id: string;
    company_name?: string;
    contact_person?: string;
    phone?: string;
    user: {
        id: string;
        name: string;
        email: string;
        status: string;
    };
    onboarding: Array<{
        id: string;
        status: string;
        progress_percent: number;
        current_step: number;
        total_steps: number;
        created_at: string;
        onboarding_link?: string;
    }>;
    projects: Array<{
        id: string;
        title: string;
        status: string;
    }>;
}

export default function CommissionerClientsPage() {
    const { data: session } = useSession();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await fetch('/api/commissioner/clients');
            const result = await response.json();
            if (result.success) {
                setClients(result.data);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            initiated: 'bg-blue-100 text-blue-700',
            in_progress: 'bg-yellow-100 text-yellow-700',
            payment_pending: 'bg-orange-100 text-orange-700',
            approved: 'bg-green-100 text-green-700',
            active: 'bg-green-100 text-green-700',
            expired: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch =
            client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.company_name && client.company_name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' ||
            (client.onboarding[0] && client.onboarding[0].status === statusFilter);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">My Clients</h2>
                    <p className="text-gray-500 mt-2 text-lg">Manage client onboarding and track progress</p>
                </div>
                <Link
                    href="/dashboard/commissioner/onboarding"
                    className="bg-indigo-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Onboard New Client
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6 border-none shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Clients</p>
                            <h3 className="text-3xl font-black text-gray-900">{clients.length}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">In Progress</p>
                            <h3 className="text-3xl font-black text-gray-900">
                                {clients.filter(c => c.onboarding[0]?.status === 'in_progress').length}
                            </h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active</p>
                            <h3 className="text-3xl font-black text-gray-900">
                                {clients.filter(c => c.onboarding[0]?.status === 'active' || c.onboarding[0]?.status === 'approved').length}
                            </h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Needs Action</p>
                            <h3 className="text-3xl font-black text-gray-900">
                                {clients.filter(c => c.onboarding[0]?.status === 'payment_pending' || c.onboarding[0]?.status === 'documents_pending').length}
                            </h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-6 border-gray-100">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="initiated">Initiated</option>
                        <option value="in_progress">In Progress</option>
                        <option value="payment_pending">Payment Pending</option>
                        <option value="approved">Approved</option>
                        <option value="active">Active</option>
                    </select>
                </div>
            </Card>

            {/* Clients Table */}
            <Card className="border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Client</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Progress</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Projects</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading clients...
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No clients found
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => {
                                    const onboarding = client.onboarding[0];
                                    return (
                                        <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-bold text-gray-900">{client.user.name}</div>
                                                    {client.company_name && (
                                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                            <Building className="w-3 h-3" />
                                                            {client.company_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm flex items-center gap-2">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        {client.user.email}
                                                    </div>
                                                    {client.phone && (
                                                        <div className="text-sm flex items-center gap-2">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            {client.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {onboarding ? (
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${getStatusColor(onboarding.status)}`}>
                                                        {onboarding.status.replace('_', ' ')}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-700">
                                                        No Onboarding
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {onboarding ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-indigo-600 transition-all"
                                                                    style={{ width: `${onboarding.progress_percent}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-600">
                                                                {onboarding.progress_percent}%
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Step {onboarding.current_step} of {onboarding.total_steps}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {onboarding?.onboarding_link && (
                                                        <button
                                                            onClick={() => copyToClipboard(onboarding.onboarding_link!)}
                                                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                            title="Copy onboarding link"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/dashboard/commissioner/clients/${client.id}`}
                                                        className="px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
