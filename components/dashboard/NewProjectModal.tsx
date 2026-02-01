'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Client {
    id: string;
    contact_person: string;
    company_name?: string;
    user: {
        name: string;
        email: string;
    };
}

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    commissionerId: string | null;
    onSuccess?: () => void;
}

export function NewProjectModal({ isOpen, onClose, commissionerId, onSuccess }: NewProjectModalProps) {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [fetchingClients, setFetchingClients] = useState(false);

    const [formData, setFormData] = useState({
        clientId: '',
        title: '',
        description: '',
        budget: '',
        timeline: '',
        projectType: 'direct'
    });

    // Fetch clients when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchClients();
        }
    }, [isOpen]);

    const fetchClients = async () => {
        setFetchingClients(true);
        try {
            const res = await fetch('/api/clients');
            const data = await res.json();
            if (data.success) {
                setClients(data.data);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setFetchingClients(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    commissionerId,
                    budget: parseFloat(formData.budget),
                })
            });

            const result = await res.json();

            if (result.success) {
                onClose();
                if (onSuccess) onSuccess();
                // Reset form
                setFormData({
                    clientId: '',
                    title: '',
                    description: '',
                    budget: '',
                    timeline: '',
                    projectType: 'direct'
                });
            } else {
                alert(result.error || 'Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Create New Project">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Select Client</label>
                    <Select
                        value={formData.clientId}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, clientId: val }))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={fetchingClients ? "Loading clients..." : "Select a client"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>
                                    <span className="font-medium">{client.contact_person}</span>
                                    <span className="ml-2 text-gray-400 text-xs">
                                        ({client.company_name || client.user.email})
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Project Title</label>
                    <Input
                        required
                        className="w-full"
                        placeholder="e.g. E-commerce Website Redesign"
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <Textarea
                        required
                        className="w-full min-h-[100px]"
                        placeholder="Brief overview of the project scope..."
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Budget (KES)</label>
                        <Input
                            required
                            type="number"
                            className="w-full"
                            placeholder="150000"
                            value={formData.budget}
                            onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Timeline</label>
                        <Input
                            required
                            className="w-full"
                            placeholder="e.g. 3 months"
                            value={formData.timeline}
                            onChange={e => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={loading || !formData.clientId}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Create Project
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
