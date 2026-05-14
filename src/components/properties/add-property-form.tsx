'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Land',
  'Commercial',
  'Townhouse',
  'Villa',
  'Studio',
  'Duplex',
] as const;

const AVAILABLE_FEATURES = [
  'Swimming Pool',
  'Garden',
  'Gym',
  'Parking',
  'Security',
  'Balcony',
  'En-Suite',
  'Furnished',
  'Servant Quarter',
  'Backup Generator',
  'Borehole',
] as const;

const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  propertyType: z.enum(PROPERTY_TYPES, {
    message: 'Please select a property type',
  }),
  location: z.string().min(1, 'Location is required'),
  neighborhood: z.string().optional().default(''),
  price: z.coerce.number().min(0, 'Price must be at least 0'),
  bedrooms: z.coerce.number().int().min(0, 'Bedrooms must be 0 or more'),
  bathrooms: z.coerce.number().int().min(0, 'Bathrooms must be 0 or more'),
  areaSqm: z.coerce.number().min(0).optional().default(undefined),
  features: z.array(z.string()).default([]),
  description: z.string().optional().default(''),
});

type PropertyFormData = z.infer<typeof propertySchema>;

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
}

export function AddPropertyForm() {
  const { user, view, selectedPropertyId, setView, selectProperty, addToast, goBack } =
    useAppStore();

  const isEditMode = view === 'edit-property';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      propertyType: 'Apartment',
      location: '',
      neighborhood: '',
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      areaSqm: undefined,
      features: [],
      description: '',
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedFeatures = watch('features') ?? [];

  // Fetch existing property data for edit mode
  const fetchProperty = useCallback(async () => {
    if (!isEditMode || !selectedPropertyId || !user?.id) return;
    setIsLoadingData(true);
    try {
      const res = await fetch(
        `/api/properties/${selectedPropertyId}?userId=${user.id}`
      );
      if (!res.ok) throw new Error('Failed to fetch property');
      const json = await res.json();
      const data: PropertyData = json.property ?? json;

      const parsedFeatures: string[] = (() => {
        try {
          const parsed = JSON.parse(data.features);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return data.features
            ? data.features.split(',').map((f) => f.trim())
            : [];
        }
      })();

      reset({
        title: data.title,
        propertyType: data.propertyType as PropertyFormData['propertyType'],
        location: data.location,
        neighborhood: data.neighborhood ?? '',
        price: data.price,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        areaSqm: data.areaSqm ?? undefined,
        features: parsedFeatures,
        description: data.description ?? '',
      });
    } catch (err) {
      addToast({
        title: 'Error',
        description: 'Could not load property data.',
        variant: 'destructive',
      });
      goBack();
    } finally {
      setIsLoadingData(false);
    }
  }, [isEditMode, selectedPropertyId, user?.id, reset, addToast, goBack]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const toggleFeature = (feature: string) => {
    const current = selectedFeatures;
    if (current.includes(feature)) {
      setValue(
        'features',
        current.filter((f) => f !== feature),
        { shouldValidate: true }
      );
    } else {
      setValue('features', [...current, feature], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!user?.id) return;
    setIsSubmitting(true);

    const payload = {
      ...data,
      userId: user.id,
      areaSqm: data.areaSqm || null,
      neighborhood: data.neighborhood || null,
      description: data.description || null,
    };

    try {
      const url = isEditMode
        ? `/api/properties/${selectedPropertyId}`
        : '/api/properties';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Failed to ${isEditMode ? 'update' : 'create'} property`);
      }

      addToast({
        title: isEditMode ? 'Property updated' : 'Property created',
        description: `"${data.title}" has been ${isEditMode ? 'updated' : 'added'} successfully.`,
        variant: 'success',
      });
      setView('properties');
    } catch (err) {
      addToast({
        title: `${isEditMode ? 'Update' : 'Create'} failed`,
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading state for edit mode ──────────────────────────────────
  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditMode ? 'Edit Property' : 'Add New Property'}
        </h1>
        <Button variant="outline" onClick={goBack} className="w-full sm:w-auto">
          Cancel
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Property Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Sunset Villa in Karen"
                {...register('title')}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Property Type */}
            <div className="grid gap-2">
              <Label htmlFor="propertyType">
                Property Type <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="propertyType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full" id="propertyType">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.propertyType && (
                <p className="text-sm text-destructive">
                  {errors.propertyType.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g., Karen, Nairobi"
                {...register('location')}
                aria-invalid={!!errors.location}
              />
              {errors.location && (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Neighborhood */}
            <div className="grid gap-2">
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Input
                id="neighborhood"
                placeholder="e.g., Karen Heights"
                {...register('neighborhood')}
              />
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Details */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Price */}
              <div className="grid gap-2">
                <Label htmlFor="price">
                  Price (KES) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={10000}
                  placeholder="e.g., 15000000"
                  {...register('price')}
                  aria-invalid={!!errors.price}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Bedrooms */}
              <div className="grid gap-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register('bedrooms')}
                  aria-invalid={!!errors.bedrooms}
                />
                {errors.bedrooms && (
                  <p className="text-sm text-destructive">
                    {errors.bedrooms.message}
                  </p>
                )}
              </div>

              {/* Bathrooms */}
              <div className="grid gap-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register('bathrooms')}
                  aria-invalid={!!errors.bathrooms}
                />
                {errors.bathrooms && (
                  <p className="text-sm text-destructive">
                    {errors.bathrooms.message}
                  </p>
                )}
              </div>

              {/* Area */}
              <div className="grid gap-2">
                <Label htmlFor="areaSqm">Area (sqm)</Label>
                <Input
                  id="areaSqm"
                  type="number"
                  min={0}
                  placeholder="e.g., 200"
                  {...register('areaSqm')}
                  aria-invalid={!!errors.areaSqm}
                />
                <p className="text-xs text-muted-foreground">Optional</p>
                {errors.areaSqm && (
                  <p className="text-sm text-destructive">
                    {errors.areaSqm.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {AVAILABLE_FEATURES.map((feature) => {
                const isChecked = selectedFeatures.includes(feature);
                return (
                  <label
                    key={feature}
                    className={`
                      flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors text-sm
                      ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700'
                          : 'border-border hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-800 dark:hover:bg-emerald-900/10'
                      }
                    `}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleFeature(feature)}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    {feature}
                  </label>
                );
              })}
            </div>
            {errors.features && (
              <p className="text-sm text-destructive mt-2">
                {errors.features.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              placeholder="Original description from developer or agent..."
              rows={5}
              {...register('description')}
            />
            <p className="text-xs text-muted-foreground">
              Optional. Provide the original property description that will be
              enhanced by AI for marketing content.
            </p>
          </CardContent>
        </Card>

        {/* Submit buttons */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting
              ? isEditMode
                ? 'Updating...'
                : 'Saving...'
              : 'Save Property'}
          </Button>
        </div>
      </form>
    </div>
  );
}
