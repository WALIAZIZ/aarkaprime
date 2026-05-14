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
  Zap,
  CheckCircle2,
  AlertCircle,
  Wand2,
  type LucideIcon,
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
import { Badge } from '@/components/ui/badge';
import { ContentCard } from '@/components/ai/content-card';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  propertyType: string;
}

interface GeneratedContent {
  id?: string;
  title: string;
  body: string;
  contentType: string;
  platform?: string;
  language: string;
  createdAt: string;
}

interface AIStatusResponse {
  provider: string;
  model: string;
}

const contentTypes = [
  {
    value: 'description',
    label: 'Property Description',
    icon: FileText,
    description: 'Short, medium, and long descriptions',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950',
  },
  {
    value: 'social_post',
    label: 'Social Media Posts',
    icon: Sparkles,
    description: 'Facebook, Instagram, Twitter posts',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
  {
    value: 'whatsapp_msg',
    label: 'WhatsApp Messages',
    icon: Zap,
    description: 'Professional, casual, urgent tones',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-950',
  },
  {
    value: 'email_campaign',
    label: 'Email Campaign',
    icon: FileText,
    description: 'New listing, open house, price drop',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
  },
  {
    value: 'ad_copy',
    label: 'Facebook Ad Copy',
    icon: Wand2,
    description: 'Optimized ad variations',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
  },
];

const languages = [
  { value: 'english', label: 'English', flag: '🇺🇸' },
  { value: 'swahili', label: 'Swahili', flag: '🇰🇪' },
];

export function GeneratePanel() {
  const {
    user,
    selectedPropertyId,
    isGenerating,
    setGenerating,
    setUser,
    addToast,
  } = useAppStore();

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>(
    selectedPropertyId || ''
  );
  const [contentType, setContentType] = useState<string>('');
  const [language, setLanguage] = useState<string>('english');
  const [results, setResults] = useState<GeneratedContent[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [aiStatus, setAiStatus] = useState<AIStatusResponse | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('');

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

  const fetchAIStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
      }
    } catch {
      setAiStatus({ provider: 'Built-in', model: 'Fallback' });
    }
  }, []);

  useEffect(() => {
    fetchProperties();
    fetchAIStatus();
  }, [fetchProperties, fetchAIStatus]);

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

  const selectedContentTypeInfo = contentTypes.find((c) => c.value === contentType);

  const handleGenerate = async () => {
    if (!selectedProperty || !contentType) return;

    setGenerating(true);
    setResults([]);

    // Simulate progress stages
    setGenerationProgress('Analyzing property details...');
    await new Promise((r) => setTimeout(r, 600));
    setGenerationProgress('Crafting marketing content...');
    await new Promise((r) => setTimeout(r, 800));
    setGenerationProgress('Polishing and formatting...');
    await new Promise((r) => setTimeout(r, 400));

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

      setGenerationProgress('Done!');

      // Update user store with incremented generation count
      if (user) {
        setUser({
          ...user,
          monthlyGenerationsUsed: (user.monthlyGenerationsUsed ?? 0) + 1,
        });
      }

      addToast({
        title: 'Content Generated!',
        description: `Successfully created ${contents.length} ${selectedContentTypeInfo?.label.toLowerCase() || 'content items'} using ${aiStatus?.provider || 'AI'}`,
        variant: 'success',
      });
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
      setGenerationProgress('');
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
        <div className="flex items-center gap-3">
          {/* AI Status Badge */}
          {aiStatus && (
            <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2 shadow-sm dark:bg-gray-900 dark:border-gray-800">
              <Zap
                className={`size-4 ${
                  aiStatus.provider !== 'Built-in'
                    ? 'text-emerald-500'
                    : 'text-amber-500'
                }`}
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  {aiStatus.provider}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {aiStatus.model}
                </span>
              </div>
            </div>
          )}
          {/* Usage */}
          <div className="flex items-center gap-3 bg-white rounded-lg border px-4 py-2.5 shadow-sm dark:bg-gray-900 dark:border-gray-800 min-w-[200px]">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Usage
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {generationsUsed}/{generationsLimit}
                </span>
              </div>
              <Progress value={usagePercent} className="h-1.5" />
            </div>
            <Sparkles className="size-4 text-emerald-500 shrink-0" />
          </div>
        </div>
      </div>

      {/* Form Section */}
      <Card className="border-emerald-100 dark:border-emerald-900/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wand2 className="size-5 text-emerald-600" />
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
                      <div className="flex items-center gap-2">
                        <ct.icon className="size-3.5 text-gray-400" />
                        {ct.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedContentTypeInfo && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedContentTypeInfo.description}
                </p>
              )}
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
                        <span>{lang.flag}</span>
                        {lang.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6 flex items-center gap-3">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 text-base font-semibold shadow-md shadow-emerald-600/20 disabled:shadow-none"
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
            {!selectedProperty && (
              <p className="text-xs text-muted-foreground">
                Select a property to get started
              </p>
            )}
            {!contentType && selectedProperty && (
              <p className="text-xs text-muted-foreground">
                Choose a content type to generate
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Type Preview Cards */}
      {!isGenerating && !hasResults && !contentType && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {contentTypes.map((ct, idx) => (
            <motion.div
              key={ct.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className="cursor-pointer transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 h-full"
                onClick={() => setContentType(ct.value)}
              >
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${ct.bgColor}`}
                  >
                    <ct.icon className={`size-5 ${ct.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{ct.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {ct.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

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
                  {generationProgress && (
                    <p className="text-sm text-emerald-600/70 dark:text-emerald-500/70 mt-1 flex items-center justify-center gap-2">
                      <Loader2 className="size-3.5 animate-spin" />
                      {generationProgress}
                    </p>
                  )}
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
                {aiStatus && aiStatus.provider !== 'Built-in' && (
                  <Badge
                    variant="outline"
                    className="text-xs text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50"
                  >
                    <Zap className="size-3 mr-1" />
                    Powered by {aiStatus.provider} ({aiStatus.model})
                  </Badge>
                )}
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
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Generated Results
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                >
                  <CheckCircle2 className="size-3 mr-1" />
                  {results.length} items
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {aiStatus && aiStatus.provider !== 'Built-in' && (
                  <Badge variant="outline" className="text-xs">
                    <Zap className="size-3 mr-1 text-emerald-500" />
                    {aiStatus.provider}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  className="gap-1.5"
                >
                  <RefreshCw className="size-3.5" />
                  Regenerate
                </Button>
              </div>
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
      {!hasResults && !isGenerating && contentType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-dashed border-2 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
              {selectedContentTypeInfo && (
                <div
                  className={`flex size-14 items-center justify-center rounded-xl ${selectedContentTypeInfo.bgColor}`}
                >
                  <selectedContentTypeInfo.icon
                    className={`size-7 ${selectedContentTypeInfo.color}`}
                  />
                </div>
              )}
              <div className="text-center max-w-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Ready to generate{' '}
                  {selectedContentTypeInfo?.label.toLowerCase() || 'content'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {selectedProperty
                    ? 'Click "Generate Content" to create professional marketing materials using AI.'
                    : 'Select a property first to generate content for.'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-2">
                <div className="h-px w-8 bg-gray-200 dark:bg-gray-700" />
                <span>
                  AI-Powered · {language === 'swahili' ? 'Swahili' : 'English'}
                </span>
                <div className="h-px w-8 bg-gray-200 dark:bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Initial Empty State (no content type selected) */}
      {!hasResults && !isGenerating && !contentType && (
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
                  Select a content type above or choose a property to get started.
                  Our AI will generate professional marketing materials in seconds.
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
