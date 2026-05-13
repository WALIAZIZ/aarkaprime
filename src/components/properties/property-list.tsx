'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Eye,
  Sparkles,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Property {
  id: string;
  title: string;
  propertyType: string;
  location: string;
  neighborhood: string | null;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number | null;
  features: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const PROPERTY_TYPES = [
  'All',
  'Apartment',
  'House',
  'Land',
  'Commercial',
  'Townhouse',
  'Villa',
  'Studio',
  'Duplex',
] as const;

const STATUSES = ['All', 'Active', 'Sold', 'Rented', 'Paused'] as const;

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    return `KES ${(price / 1_000_000_000).toFixed(1)}B`;
  }
  if (price >= 1_000_000) {
    return `KES ${(price / 1_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000) {
    return `KES ${price.toLocaleString()}`;
  }
  return `KES ${price.toLocaleString()}`;
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { className: string; label: string }> = {
    active: {
      className:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      label: 'Active',
    },
    sold: {
      className:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      label: 'Sold',
    },
    rented: {
      className:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      label: 'Rented',
    },
    paused: {
      className:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      label: 'Paused',
    },
  };

  const s = statusMap[status] ?? statusMap.active;
  return <Badge variant="outline" className={s.className}>{s.label}</Badge>;
}

function getTypeBadge(type: string) {
  return (
    <Badge variant="secondary" className="font-normal">
      {type}
    </Badge>
  );
}

export function PropertyList() {
  const { user, setView, selectProperty, addToast } = useAppStore();

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProperties = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/properties?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch properties');
      const data: Property[] = await res.json();
      setProperties(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        (p.neighborhood?.toLowerCase().includes(query) ?? false);
      const matchesType =
        typeFilter === 'All' || p.propertyType === typeFilter;
      const matchesStatus =
        statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [properties, searchQuery, typeFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget || !user?.id) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/properties/${deleteTarget.id}?userId=${user.id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete property');
      addToast({
        title: 'Property deleted',
        description: `"${deleteTarget.title}" has been removed.`,
        variant: 'success',
      });
      setProperties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      addToast({
        title: 'Delete failed',
        description:
          err instanceof Error ? err.message : 'Could not delete property',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-9 w-full sm:w-72" />
          <Skeleton className="h-9 w-full sm:w-40" />
          <Skeleton className="h-9 w-full sm:w-36" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <Button
            onClick={() => setView('add-property')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="size-4" />
            New Property
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4 mb-4">
              <Building2 className="size-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold">Error loading properties</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4 max-w-md">
              {error}
            </p>
            <Button variant="outline" onClick={fetchProperties}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────
  if (properties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <Button
            onClick={() => setView('add-property')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="size-4" />
            New Property
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 p-6">
                <Building2 className="size-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="absolute -top-1 -right-1 rounded-full bg-emerald-600 p-1.5">
                <Plus className="size-3 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No properties yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md">
              Add your first property to start generating AI-powered marketing
              content and managing your real estate listings.
            </p>
            <Button
              onClick={() => setView('add-property')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="size-4" />
              Add Your First Property
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main content ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
        <Button
          onClick={() => setView('add-property')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
        >
          <Plus className="size-4" />
          New Property
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {searchQuery || typeFilter !== 'All' || statusFilter !== 'All' ? (
        <p className="text-sm text-muted-foreground">
          Showing {filteredProperties.length} of {properties.length} properties
        </p>
      ) : null}

      {/* Table */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="size-10 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-1">No matching properties</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="min-w-[160px]">Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground shrink-0 hidden sm:block" />
                        <span className="truncate max-w-[200px]">
                          {property.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(property.propertyType)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {property.location}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(property.price)}
                    </TableCell>
                    <TableCell>{getStatusBadge(property.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            selectProperty(property.id);
                            setView('property-detail');
                          }}
                          title="View details"
                        >
                          <Eye className="size-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            selectProperty(property.id);
                            setView('generate');
                          }}
                          title="Generate content"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                        >
                          <Sparkles className="size-4" />
                          <span className="sr-only">Generate</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            selectProperty(property.id);
                            setView('edit-property');
                          }}
                          title="Edit property"
                        >
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(property)}
                          title="Delete property"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;?
              This action cannot be undone. All associated generated content and
              leads will also be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600/30"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
