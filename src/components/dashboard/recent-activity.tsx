"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  Share2,
  MessageCircle,
  Mail,
  Megaphone,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";

import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";

interface ContentItem {
  id: string;
  type: string;
  platform: string;
  title?: string;
  propertyTitle?: string;
  createdAt: string;
}

const contentTypeConfig: Record<string, { icon: typeof FileText; label: string }> = {
  description: { icon: FileText, label: "Description" },
  social: { icon: Share2, label: "Social Post" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp" },
  email: { icon: Mail, label: "Email" },
  ad: { icon: Megaphone, label: "Ad Copy" },
};

const platformVariantMap: Record<string, "default" | "secondary" | "outline"> = {
  facebook: "default",
  instagram: "default",
  twitter: "secondary",
  linkedin: "secondary",
  whatsapp: "outline",
  email: "outline",
  website: "default",
  general: "secondary",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export function RecentActivity() {
  const { user, setView } = useAppStore();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchContent() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/content?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          // Accept both array and { items/content/data } shapes
          const list: ContentItem[] = Array.isArray(data)
            ? data
            : data.items ?? data.content ?? data.data ?? [];
          setItems(list.slice(0, 8));
        }
      } catch {
        // Silently handle
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [user?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardAction>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-emerald-600"
              onClick={() => setView("generate")}
            >
              View All
              <ArrowRight className="size-4" />
            </Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Sparkles className="size-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No content generated yet</p>
              <p className="text-sm text-muted-foreground">
                Generate your first piece of marketing content for a property.
              </p>
            </div>
            <Button
              onClick={() => setView("generate")}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Generate Your First Content
            </Button>
          </div>
        ) : (
          <motion.div
            className="space-y-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {items.map((item) => {
              const config = contentTypeConfig[item.type] ?? contentTypeConfig.description;
              const Icon = config.icon;
              const relativeDate = (() => {
                try {
                  return formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  });
                } catch {
                  return "recently";
                }
              })();
              const badgeVariant =
                platformVariantMap[item.platform.toLowerCase()] ?? "secondary";

              return (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  variants={itemVariants}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.title || config.label}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.propertyTitle || "General"} · {relativeDate}
                    </p>
                  </div>
                  <Badge variant={badgeVariant} className="shrink-0 text-xs">
                    {item.platform}
                  </Badge>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
