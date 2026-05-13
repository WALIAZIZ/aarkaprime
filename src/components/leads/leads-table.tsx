'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Trash2,
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  Filter,
  Search,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyName?: string;
  source: string;
  status: string;
  message?: string;
  createdAt: string;
}

interface Property {
  id: string;
  title: string;
}

type LeadStatus =
  | 'new'
  | 'contacted'
  | 'viewing'
  | 'negotiation'
  | 'closed'
  | 'lost';

const statusConfig: Record<
  LeadStatus,
  { label: string; className: string }
> = {
  new: {
    label: 'New',
    className:
      'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  },
  contacted: {
    label: 'Contacted',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30',
  },
  viewing: {
    label: 'Viewing',
    className:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30',
  },
  negotiation: {
    label: 'Negotiation',
    className:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30',
  },
  closed: {
    label: 'Closed',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30',
  },
  lost: {
    label: 'Lost',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30',
  },
};

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'viewing', label: 'Viewing' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed', label: 'Closed' },
  { value: 'lost', label: 'Lost' },
];

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'other', label: 'Other' },
];

export function LeadsTable() {
  const { user, addToast } = useAppStore();
  const userId = user?.id ?? '';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  // Add lead dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    propertyId: '',
    source: 'website',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/leads?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : data.leads ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchProperties = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/properties?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(Array.isArray(data) ? data : data.properties ?? []);
      }
    } catch {
      // silent
    }
  }, [userId]);

  useEffect(() => {
    fetchLeads();
    fetchProperties();
  }, [fetchLeads, fetchProperties]);

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    if (propertyFilter !== 'all' && lead.propertyId !== propertyFilter)
      return false;
    return true;
  });

  // Status counts
  const statusCounts = leads.reduce<Record<string, number>>(
    (acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    },
    {}
  );

  const handleCreateLead = async () => {
    if (!formData.name || !formData.email) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create lead');
      }

      setDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        propertyId: '',
        source: 'website',
      });
      addToast({
        title: 'Lead Created',
        description: 'New lead added successfully',
        variant: 'success',
      });
      fetchLeads();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create lead';
      addToast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, userId }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status } : l))
      );
      addToast({
        title: 'Status Updated',
        description: 'Lead status changed successfully',
        variant: 'success',
      });
    } catch {
      addToast({
        title: 'Error',
        description: 'Failed to update lead status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLead = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/leads/${deleteId}?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete lead');
      }

      setLeads((prev) => prev.filter((l) => l.id !== deleteId));
      addToast({
        title: 'Lead Deleted',
        description: 'Lead has been removed',
        variant: 'success',
      });
    } catch {
      addToast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const getPropertyName = (propertyId: string): string => {
    const prop = properties.find((p) => p.id === propertyId);
    return prop?.title || leads.find((l) => l.id === propertyId)?.propertyName || 'Unknown';
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Leads
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and track your property leads
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
              <Plus className="size-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>
                Add a new lead to your pipeline
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="lead-name">Name *</Label>
                <Input
                  id="lead-name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-email">Email *</Label>
                <Input
                  id="lead-email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-phone">Phone</Label>
                <Input
                  id="lead-phone"
                  placeholder="+254 712 345 678"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead-message">Message</Label>
                <Textarea
                  id="lead-message"
                  placeholder="Any notes about this lead..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Property</Label>
                  <Select
                    value={formData.propertyId}
                    onValueChange={(val) =>
                      setFormData({ ...formData, propertyId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Source</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(val) =>
                      setFormData({ ...formData, source: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateLead}
                disabled={!formData.name || !formData.email || submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Lead'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs font-medium px-3 py-1">
          Total: {leads.length}
        </Badge>
        {statusOptions.map((s) => (
          <Badge
            key={s.value}
            variant="outline"
            className="text-xs px-2.5 py-1 cursor-pointer hover:bg-accent transition-colors"
            onClick={() =>
              setStatusFilter(statusFilter === s.value ? 'all' : s.value)
            }
          >
            {s.label}: {statusCounts[s.value] || 0}
          </Badge>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Filters:
              </span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-emerald-500" />
          </CardContent>
        </Card>
      ) : filteredLeads.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-dashed border-2 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/20">
                <Users className="size-8 text-emerald-500" />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {leads.length === 0 ? 'No leads yet' : 'No matching leads'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {leads.length === 0
                    ? 'Add your first lead to start tracking your property inquiries and prospects.'
                    : 'Try adjusting your filters to find the leads you are looking for.'}
                </p>
              </div>
              {leads.length === 0 && (
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <Plus className="size-4" />
                  Add First Lead
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* Table */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 dark:bg-gray-900/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">
                      Phone
                    </TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">
                      Property
                    </TableHead>
                    <TableHead className="font-semibold">Source</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => {
                    const status = statusConfig[lead.status as LeadStatus] || statusConfig.new;
                    return (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0">
                              {lead.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                              {lead.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[160px] block">
                            {lead.email}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {lead.phone ? (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {lead.phone}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-300 dark:text-gray-600">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[140px] block">
                            {lead.propertyName || getPropertyName(lead.propertyId)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="text-[11px] capitalize"
                          >
                            {lead.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[11px] capitalize ${status.className}`}
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(lead.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {statusOptions.map((s) => (
                                <DropdownMenuItem
                                  key={s.value}
                                  onClick={() =>
                                    handleUpdateStatus(lead.id, s.value)
                                  }
                                  className={
                                    lead.status === s.value
                                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                      : ''
                                  }
                                >
                                  {s.label}
                                  {lead.status === s.value && ' ✓'}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteId(lead.id)}
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be
              undone and will permanently remove the lead from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLead}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
