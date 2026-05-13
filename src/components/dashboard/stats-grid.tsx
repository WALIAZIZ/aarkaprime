"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, FileText, Users, Zap, Loader2 } from "lucide-react";

import { useAppStore } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ContentCount {
  count: number;
}

interface LeadCount {
  count: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function StatsGrid() {
  const { user } = useAppStore();
  const [contentCount, setContentCount] = useState<number>(0);
  const [leadCount, setLeadCount] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const totalProperties = user?.activeListings ?? 0;
  const generationsUsed = user?.monthlyGenerationsUsed ?? 0;
  const generationsLimit = user?.monthlyGenerationsLimit ?? 50;
  const usagePercent =
    generationsLimit > 0 ? Math.min((generationsUsed / generationsLimit) * 100, 100) : 0;

  useEffect(() => {
    if (!user?.id) return;

    async function fetchStats() {
      setIsLoadingData(true);
      try {
        const [contentRes, leadsRes] = await Promise.allSettled([
          fetch(`/api/content?userId=${user.id}`),
          fetch(`/api/leads?userId=${user.id}`),
        ]);

        if (contentRes.status === "fulfilled" && contentRes.value.ok) {
          const data: ContentCount = await contentRes.value.json();
          setContentCount(typeof data.count === "number" ? data.count : 0);
        }

        if (leadsRes.status === "fulfilled" && leadsRes.value.ok) {
          const data: LeadCount = await leadsRes.value.json();
          setLeadCount(typeof data.count === "number" ? data.count : 0);
        }
      } catch {
        // Silently handle — stats show 0 on error
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchStats();
  }, [user?.id]);

  const stats = [
    {
      label: "Total Properties",
      value: totalProperties,
      icon: Building2,
      iconBg: "bg-emerald-100 dark:bg-emerald-950",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Content Generated",
      value: isLoadingData ? null : contentCount,
      icon: FileText,
      iconBg: "bg-blue-100 dark:bg-blue-950",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Active Leads",
      value: isLoadingData ? null : leadCount,
      icon: Users,
      iconBg: "bg-amber-100 dark:bg-amber-950",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Monthly Usage",
      value: null,
      icon: Zap,
      iconBg: "bg-purple-100 dark:bg-purple-950",
      iconColor: "text-purple-600 dark:text-purple-400",
      isUsage: true,
    },
  ] as const;

  return (
    <motion.div
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    {stat.isUsage ? (
                      <>
                        <p className="text-3xl font-bold tracking-tight">
                          {generationsUsed}/{generationsLimit}
                        </p>
                        <p className="text-sm text-muted-foreground">generations</p>
                      </>
                    ) : (
                      <>
                        <p className="text-3xl font-bold tracking-tight">
                          {stat.value === null ? (
                            <Loader2 className="size-7 animate-spin text-muted-foreground" />
                          ) : (
                            stat.value
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </>
                    )}
                  </div>
                  <div
                    className={`flex size-10 items-center justify-center rounded-full ${stat.iconBg}`}
                  >
                    <Icon className={`size-5 ${stat.iconColor}`} />
                  </div>
                </div>
                {stat.isUsage && (
                  <Progress value={usagePercent} className="mt-4 h-2" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
