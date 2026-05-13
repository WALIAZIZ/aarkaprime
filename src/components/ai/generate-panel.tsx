'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Globe,
  FileText,
  ChevronRight,
  Building2,
  Loader2,
  RefreshCw,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ContentCard } from '@/components/ai/content-card';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
}

interface GeneratedContent {
  title: string;
  body: string;
  contentType: string;
  platform?: string;
  language: string;
  createdAt: string;
}

const contentTypes = [
  { value: 'description', label: 'Description' },
  { value: 'social-media', label: 'Social Media Posts' },
  { value: 'whatsapp', label: 'WhatsApp Messages' },
  { value: 'email', label: 'Email Campaign' },
  { value: 'ad-copy', label: 'Ad Copy' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Swahili' },
];

export function GeneratePanel() {
  const {
    user,
    selectedPropertyId,
    isGenerating,
    setGenerating,
    addToast,
  } = useAppStore();

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>(
    selectedPropertyId || ''
  );
  const [contentType, setContentType] = useState<string>('');
  const [language, setLanguage] = useState<string>('en');
  const [results, setResults] = useState<GeneratedContent[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  const userId = user?.id ?? '';

  const fetchProperties = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/properties?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(Array.isArray(data) ? data : data.properties ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingProperties(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    if (selectedPropertyId) {
      setSelectedProperty(selectedPropertyId);
    }
  }, [selectedPropertyId]);

  const generationsUsed = user?.monthlyGenerationsUsed ?? 0;
  const generationsLimit = user?.monthlyGenerationsLimit ?? 10;
  const usagePercent =
    generationsLimit > 0
      ? Math.min((generationsUsed / generationsLimit) * 100, 100)
      : 0;

  const handleGenerate = async () => {
    if (!selectedProperty || !contentType) return;

    setGenerating(true);
    setResults([]);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty,
          contentType,
          language,
          userId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Generation failed');
      }

      const data = await res.json();
      const contents: GeneratedContent[] = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];
      setResults(contents);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate content';
      addToast({
        title: 'Generation Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const canGenerate = selectedProperty && contentType && !isGenerating;
  const hasResults = results.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Generate Marketing Content
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Use AI to create professional marketing materials for your properties
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-lg border px-4 py-2.5 shadow-sm dark:bg-gray-900 dark:border-gray-800 min-w-[220px]">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Usage
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {generationsUsed}/{generationsLimit}
              </span>
            </div>
            <Progress
              value={usagePercent}
              className="h-1.5"
            />
          </div>
          <Sparkles className="size-4 text-emerald-500 shrink-0" />
        </div>
      </div>

      {/* Form Section */}
      <Card className="border-emerald-100 dark:border-emerald-900/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="size-5 text-emerald-600" />
            Content Settings
          </CardTitle>
          <CardDescription>
            Choose a property, content type, and language to generate content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Property Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Property
              </label>
              <Select
                value={selectedProperty}
                onValueChange={setSelectedProperty}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a property..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingProperties ? (
                    <SelectItem value="_loading" disabled>
                      Loading properties...
                    </SelectItem>
                  ) : properties.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      No properties found
                    </SelectItem>
                  ) : (
                    properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="size-3.5 text-gray-400" />
                          <span className="truncate max-w-[200px]">
                            {p.title}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Content Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Content Type
              </label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose content type..." />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {ct.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <div className="flex items-center gap-2">
                        <Globe className="size-3.5 text-gray-400" />
                        {lang.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto px-8 h-12 text-base font-semibold shadow-md shadow-emerald-600/20 disabled:shadow-none"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-5" />
                  Generate Content
                  <ChevronRight className="size-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading Animation */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-gray-900">
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <motion.div
                  className="relative"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="h-16 w-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 dark:border-emerald-900 dark:border-t-emerald-500" />
                </motion.div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
                    AI is crafting your content...
                  </h3>
                  <p className="text-sm text-emerald-600/70 dark:text-emerald-500/70 mt-1">
                    This may take a few moments
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      className="h-2.5 w-2.5 rounded-full bg-emerald-500"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: dot * 0.2,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {hasResults && !isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Generated Results
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                className="gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Generate More
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {results.map((content, idx) => (
                <ContentCard
                  key={`${content.title}-${idx}`}
                  title={content.title}
                  body={content.body}
                  contentType={content.contentType}
                  platform={content.platform}
                  language={content.language}
                  createdAt={content.createdAt}
                  onSave={() => {
                    addToast({
                      title: 'Content Saved',
                      description: 'Marketing content saved successfully',
                      variant: 'success',
                    });
                  }}
                  index={idx}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!hasResults && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-dashed border-2 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/20">
                  <Sparkles className="size-10 text-emerald-500" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="text-xs">✨</span>
                </motion.div>
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Ready to create amazing content
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Select a property and content type to get started. Our AI will
                  generate professional marketing materials in seconds.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-2">
                <div className="h-px w-8 bg-gray-200 dark:bg-gray-700" />
                <span>AI-Powered</span>
                <div className="h-px w-8 bg-gray-200 dark:bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
