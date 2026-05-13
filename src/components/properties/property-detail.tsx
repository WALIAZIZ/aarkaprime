'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Sparkles,
  Pencil,
  Copy,
  Check,
  FileText,
  User,
  Building2,
  Calendar,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ── Types ──────────────────────────────────────────────────────────

interface PropertyData {
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

interface GeneratedContentItem {
  id: string;
  contentType: string;
  platform: string | null;
  title: string;
  body: string;
  createdAt: string;
}

interface LeadItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  status: string;
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return `KES ${price.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function parseFeatures(featuresStr: string): string[] {
  try {
    const parsed = JSON.parse(featuresStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return featuresStr
      ? featuresStr.split(',').map((f) => f.trim()).filter(Boolean)
      : [];
  }
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

function getContentTypeIcon(contentType: string) {
  const iconMap: Record<string, React.ReactNode> = {
    'social-media': <Briefcase className="size-4" />,
    'blog-post': <FileText className="size-4" />,
    'email': <FileText className="size-4" />,
    'listing-description': <Building2 className="size-4" />,
  };
  return iconMap[contentType] ?? <FileText className="size-4" />;
}

function getLeadStatusBadge(status: string) {
  const statusMap: Record<string, { className: string }> = {
    new: {
      className:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    contacted: {
      className:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    qualified: {
      className:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    },
    converted: {
      className:
        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800',
    },
    lost: {
      className:
        'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-400 border-gray-200 dark:border-gray-800',
    },
  };
  const s = statusMap[status] ?? statusMap.new;
  return (
    <Badge variant="outline" className={s.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// ── Component ──────────────────────────────────────────────────────

export function PropertyDetail() {
  const {
    user,
    selectedPropertyId,
    setView,
    selectProperty,
    addToast,
  } = useAppStore();

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generated content state
  const [generatedContent, setGeneratedContent] = useState<
    GeneratedContentItem[]
  >([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Leads state
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  // ── Fetch property ───────────────────────────────────────────────
  const fetchProperty = useCallback(async () => {
    if (!selectedPropertyId || !user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/properties/${selectedPropertyId}?userId=${user.id}`
      );
      if (!res.ok) throw new Error('Failed to fetch property');
      const data: PropertyData = await res.json();
      setProperty(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedPropertyId, user?.id]);

  // ── Fetch generated content ──────────────────────────────────────
  const fetchContent = useCallback(async () => {
    if (!selectedPropertyId || !user?.id) return;
    setIsLoadingContent(true);
    try {
      const res = await fetch(
        `/api/content?userId=${user.id}&propertyId=${selectedPropertyId}`
      );
      if (!res.ok) throw new Error('Failed to fetch content');
      const data: GeneratedContentItem[] = await res.json();
      setGeneratedContent(data);
    } catch {
      setGeneratedContent([]);
    } finally {
      setIsLoadingContent(false);
    }
  }, [selectedPropertyId, user?.id]);

  // ── Fetch leads ──────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    if (!selectedPropertyId || !user?.id) return;
    setIsLoadingLeads(true);
    try {
      const res = await fetch(
        `/api/leads?userId=${user.id}&propertyId=${selectedPropertyId}`
      );
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data: LeadItem[] = await res.json();
      setLeads(data);
    } catch {
      setLeads([]);
    } finally {
      setIsLoadingLeads(false);
    }
  }, [selectedPropertyId, user?.id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  // ── Copy to clipboard ────────────────────────────────────────────
  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      addToast({
        title: 'Copied to clipboard!',
        variant: 'success',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      addToast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  // ── Loading state ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-24" />
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40" />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────
  if (error || !property) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setView('properties')}>
          <ArrowLeft className="size-4" />
          Back to Properties
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="size-10 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              {error ?? 'Property not found'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              The property you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Button variant="outline" onClick={() => setView('properties')}>
              Back to Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const features = parseFeatures(property.features);

  // ── Main content ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => setView('properties')}>
        <ArrowLeft className="size-4" />
        Back to Properties
      </Button>

      {/* Property header card */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Title and badges */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {property.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{property.propertyType}</Badge>
                  {getStatusBadge(property.status)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    selectProperty(property.id);
                    setView('edit-property');
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    selectProperty(property.id);
                    setView('generate');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="sm"
                >
                  <Sparkles className="size-4" />
                  Generate Content
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4" />
              <span>
                {property.location}
                {property.neighborhood ? ` — ${property.neighborhood}` : ''}
              </span>
            </div>
          </div>

          <Separator />

          {/* Property stats grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {/* Price */}
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                Price
              </p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {formatPrice(property.price)}
              </p>
            </div>

            {/* Bedrooms */}
            <div className="rounded-lg bg-muted/50 p-4 border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                <Bed className="size-3.5" />
                Bedrooms
              </div>
              <p className="text-lg font-bold">
                {property.bedrooms}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  {property.bedrooms === 1 ? 'bed' : 'beds'}
                </span>
              </p>
            </div>

            {/* Bathrooms */}
            <div className="rounded-lg bg-muted/50 p-4 border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                <Bath className="size-3.5" />
                Bathrooms
              </div>
              <p className="text-lg font-bold">
                {property.bathrooms}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  {property.bathrooms === 1 ? 'bath' : 'baths'}
                </span>
              </p>
            </div>

            {/* Area */}
            <div className="rounded-lg bg-muted/50 p-4 border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                <Maximize className="size-3.5" />
                Area
              </div>
              <p className="text-lg font-bold">
                {property.areaSqm
                  ? `${property.areaSqm} sqm`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => (
                  <Badge
                    key={feature}
                    variant="outline"
                    className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Description
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          )}

          {/* Generate CTA */}
          <div className="rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10 p-6 text-center">
            <Sparkles className="size-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">
              Generate AI Marketing Content
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Create social media posts, blog articles, email campaigns, and
              listing descriptions tailored to this property.
            </p>
            <Button
              onClick={() => {
                selectProperty(property.id);
                setView('generate');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Sparkles className="size-4" />
              Generate Content
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Details | Generated Content | Leads */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="generated-content">
            Generated Content
            {generatedContent.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {generatedContent.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="leads">
            Leads
            {leads.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {leads.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Title
                    </p>
                    <p className="text-sm font-medium">{property.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Property Type
                    </p>
                    <p className="text-sm">{property.propertyType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Location
                    </p>
                    <p className="text-sm">{property.location}</p>
                  </div>
                  {property.neighborhood && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Neighborhood
                      </p>
                      <p className="text-sm">{property.neighborhood}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Price
                    </p>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Bedrooms
                    </p>
                    <p className="text-sm">{property.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Bathrooms
                    </p>
                    <p className="text-sm">{property.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Area
                    </p>
                    <p className="text-sm">
                      {property.areaSqm
                        ? `${property.areaSqm} sqm`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Status
                    </p>
                    {getStatusBadge(property.status)}
                  </div>
                </div>
              </div>

              {property.description && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Original Description
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/50 rounded-lg p-4">
                      {property.description}
                    </p>
                  </div>
                </>
              )}

              {features.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Features
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {features.map((feature) => (
                        <Badge key={feature} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generated Content Tab */}
        <TabsContent
          value="generated-content"
          onFocusCapture={fetchContent}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generated Content</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingContent ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : generatedContent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="size-10 text-muted-foreground/40 mb-4" />
                  <h3 className="text-base font-medium mb-1">
                    No generated content yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                    Use AI to generate marketing content for this property.
                    Content will appear here once created.
                  </p>
                  <Button
                    onClick={() => {
                      selectProperty(property.id);
                      setView('generate');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="sm"
                  >
                    <Sparkles className="size-4" />
                    Generate Content
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {generatedContent.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border p-4 space-y-2 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-emerald-100 dark:bg-emerald-900/30 p-1.5 text-emerald-600 dark:text-emerald-400">
                            {getContentTypeIcon(item.contentType)}
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs py-0">
                                {item.contentType
                                  .replace(/-/g, ' ')
                                  .replace(/\b\w/g, (c) =>
                                    c.toUpperCase()
                                  )}
                              </Badge>
                              {item.platform && (
                                <span>{item.platform}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                {formatDate(item.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleCopy(item.id, item.body)
                          }
                          title="Copy content"
                          className="shrink-0"
                        >
                          {copiedId === item.id ? (
                            <Check className="size-4 text-emerald-600" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                          <span className="sr-only">Copy</span>
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" onFocusCapture={fetchLeads}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLeads ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="size-10 text-muted-foreground/40 mb-4" />
                  <h3 className="text-base font-medium mb-1">
                    No leads yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Leads from your marketing campaigns will appear here once
                    prospects express interest in this property.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="flex size-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                <User className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              {lead.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              {lead.email && (
                                <p className="text-xs text-muted-foreground">
                                  {lead.email}
                                </p>
                              )}
                              {lead.phone && (
                                <p className="text-xs text-muted-foreground">
                                  {lead.phone}
                                </p>
                              )}
                              {!lead.email && !lead.phone && (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {lead.source}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getLeadStatusBadge(lead.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(lead.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
