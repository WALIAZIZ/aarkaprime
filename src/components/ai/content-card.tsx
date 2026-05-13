'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Bookmark, FileText, Share2, Mail, MessageSquare, Megaphone } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ContentCardProps {
  title: string;
  body: string;
  contentType: string;
  platform?: string;
  language: string;
  createdAt?: string;
  onSave?: () => void;
  index: number;
}

const contentTypeIcons: Record<string, React.ElementType> = {
  description: FileText,
  'social-media': Share2,
  whatsapp: MessageSquare,
  email: Mail,
  'ad-copy': Megaphone,
};

const contentTypeLabels: Record<string, string> = {
  description: 'Description',
  'social-media': 'Social Media',
  whatsapp: 'WhatsApp',
  email: 'Email',
  'ad-copy': 'Ad Copy',
};

export function ContentCard({
  title,
  body,
  contentType,
  platform,
  language,
  createdAt,
  onSave,
  index,
}: ContentCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const IconComponent = contentTypeIcons[contentType] || FileText;
  const contentTypeLabel = contentTypeLabels[contentType] || contentType;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: create a textarea and copy
      const textarea = document.createElement('textarea');
      textarea.value = body;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    onSave?.();
    setSaved(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
    >
      <Card className="overflow-hidden border-emerald-100 bg-white shadow-sm hover:shadow-md transition-shadow dark:border-emerald-900/30 dark:bg-gray-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <IconComponent className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {contentTypeLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {platform && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 text-[11px] dark:bg-emerald-900/20 dark:text-emerald-400"
                >
                  {platform}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-[11px] text-gray-600 dark:text-gray-400"
              >
                {language === 'sw' ? '🇰🇪 Swahili' : '🇺🇸 English'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {body}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 text-xs"
            >
              {copied ? (
                <>
                  <span className="text-emerald-600">✓</span> Copied!
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copy to Clipboard
                </>
              )}
            </Button>
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saved}
                className="gap-1.5 text-xs"
              >
                <Bookmark
                  className={`size-3.5 ${saved ? 'fill-emerald-600 text-emerald-600' : ''}`}
                />
                {saved ? 'Saved' : 'Save'}
              </Button>
            )}
          </div>
          {createdAt && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
