"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  Users,
  TrendingUp,
  Plus,
  Sparkles,
  UserCheck,
  ArrowRight,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Home,
  DollarSign,
  Target,
  Clock,
  Languages,
  Zap,
  Eye,
  Mail,
  MessageSquare,
  Megaphone,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
} from "recharts";

import { useAppStore } from "@/store/app-store";
import { Card, CardContent, CardHeader, CardTitle, CardAction, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Types ───────────────────────────────────────────────────────────

interface DashboardOverview {
  totalProperties: number;
  activeProperties: number;
  totalContent: number;
  totalLeads: number;
  contentByType: Record<string, number>;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  contentByDay: { date: string; count: number }[];
  leadsByDay: { date: string; count: number }[];
  leadsByMonth: { month: string; count: number }[];
  propertyTypes: Record<string, number>;
  totalPropertyPrice: number;
  avgPropertyPrice: number;
  minPropertyPrice: number;
  maxPropertyPrice: number;
  conversionRate: number;
  propertiesByStatus: Record<string, number>;
  contentByLanguage: Record<string, number>;
  quotaUsed: number;
  quotaLimit: number;
}

interface PropertyPerformance {
  id: string;
  title: string;
  propertyType: string;
  price: number;
  status: string;
  contentCount: number;
  leadCount: number;
}

interface RecentItem {
  id: string;
  title?: string;
  name?: string;
  contentType?: string;
  language?: string;
  status?: string;
  source?: string;
  createdAt: string;
  propertyName?: string | null;
  email?: string;
  phone?: string;
}

interface DashboardData {
  overview: DashboardOverview;
  propertyPerformance: PropertyPerformance[];
  topContentProperties: { id: string; title: string; contentCount: number }[];
  recentContent: RecentItem[];
  recentLeads: RecentItem[];
}

// ─── Constants ───────────────────────────────────────────────────────

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  viewing: "Viewing",
  negotiation: "Negotiation",
  closed: "Closed",
  lost: "Lost",
};

const LEAD_STATUS_COLORS: Record<string, string> = {
  new: "#6366f1",
  contacted: "#f59e0b",
  viewing: "#a855f7",
  negotiation: "#f97316",
  closed: "#10b981",
  lost: "#ef4444",
};

const LEAD_SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  "social-media": "Social Media",
  referral: "Referral",
  phone: "Phone",
  email: "Email",
};

const LEAD_SOURCE_COLORS = ["#10b981", "#059669", "#34d399", "#6ee7b7", "#a7f3d0"];

const CONTENT_TYPE_LABELS: Record<string, string> = {
  description: "Descriptions",
  social_post: "Social Posts",
  whatsapp_msg: "WhatsApp",
  email_campaign: "Emails",
  ad_copy: "Ad Copy",
};

const CONTENT_TYPE_COLORS: Record<string, string> = {
  description: "#10b981",
  social_post: "#3b82f6",
  whatsapp_msg: "#22c55e",
  email_campaign: "#8b5cf6",
  ad_copy: "#f59e0b",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  villa: "Villa",
  townhouse: "Townhouse",
  plot: "Plot",
  commercial: "Commercial",
  office: "Office",
  land: "Land",
};

// ─── Animation Variants ──────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const chartContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ─── Custom Tooltip ──────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-lg">
      {label && <p className="mb-1 font-medium text-muted-foreground">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground font-semibold">{entry.value}</span>
          {entry.name && (
            <span className="text-muted-foreground">{entry.name}</span>
          )}
        </p>
      ))}
    </div>
  );
}

// ─── Formatters ──────────────────────────────────────────────────────

function formatKES(value: number): string {
  if (value >= 1_000_000) {
    return `KES ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `KES ${(value / 1_000).toFixed(0)}K`;
  }
  return `KES ${value.toLocaleString()}`;
}

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

// ─── Sub-components ──────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  suffix,
  subValue,
  trend,
}: {
  label: string;
  value: string | number;
  icon: typeof Building2;
  iconBg: string;
  iconColor: string;
  suffix?: string;
  subValue?: string;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card className="overflow-hidden relative group hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
              {suffix}
            </p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
          <div
            className={`flex size-10 sm:size-12 items-center justify-center rounded-xl ${iconBg} group-hover:scale-110 transition-transform`}
          >
            <Icon className={`size-5 sm:size-6 ${iconColor}`} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          {subValue && (
            <p className="text-xs text-muted-foreground">{subValue}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
              <TrendingUp className={`size-3 ${!trend.positive ? "rotate-180" : ""}`} />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="size-10 sm:size-12 rounded-xl" />
        </div>
        <Skeleton className="mt-3 h-3 w-24" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center" style={{ height: 280 }}>
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Content type icon helper ────────────────────────────────────────

function ContentTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "description":
      return <FileText className="size-3.5 text-emerald-500" />;
    case "social_post":
      return <Megaphone className="size-3.5 text-blue-500" />;
    case "whatsapp_msg":
      return <MessageSquare className="size-3.5 text-green-500" />;
    case "email_campaign":
      return <Mail className="size-3.5 text-purple-500" />;
    case "ad_copy":
      return <Target className="size-3.5 text-amber-500" />;
    default:
      return <FileText className="size-3.5 text-gray-500" />;
  }
}

// ─── Main Component ──────────────────────────────────────────────────

export function EnhancedDashboard() {
  const { user, setView, selectProperty } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard?userId=${user.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const json: DashboardData = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ─── Derived data for charts ─────────────────────────────────

  const contentTypeData = data
    ? Object.entries(data.overview.contentByType)
        .filter(([, count]) => count > 0)
        .map(([key, count]) => ({
          name: CONTENT_TYPE_LABELS[key] || key,
          value: count,
          color: CONTENT_TYPE_COLORS[key] || "#6b7280",
        }))
    : [];

  const leadPipelineData = data
    ? Object.entries(data.overview.leadsByStatus)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
          name: LEAD_STATUS_LABELS[status] || status,
          count,
          fill: LEAD_STATUS_COLORS[status] || "#6b7280",
        }))
    : [];

  const contentTrendData = data
    ? data.overview.contentByDay.map((d) => ({
        ...d,
        date: formatDateShort(d.date),
      }))
    : [];

  const leadsTrendData = data
    ? data.overview.leadsByDay.map((d) => ({
        ...d,
        date: formatDateShort(d.date),
      }))
    : [];

  const leadsMonthData = data
    ? data.overview.leadsByMonth
    : [];

  const leadSourceData = data
    ? Object.entries(data.overview.leadsBySource)
        .filter(([, count]) => count > 0)
        .map(([source, count]) => ({
          name: LEAD_SOURCE_LABELS[source] || source,
          value: count,
        }))
    : [];

  const propertyTypeData = data
    ? Object.entries(data.overview.propertyTypes)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => ({
          name: PROPERTY_TYPE_LABELS[type] || type.replace(/_/g, " "),
          value: count,
        }))
    : [];

  const radarData = data
    ? [
        { metric: "Properties", value: Math.min(data.overview.totalProperties * 10, 100) },
        { metric: "Content", value: Math.min(data.overview.totalContent * 5, 100) },
        { metric: "Leads", value: Math.min(data.overview.totalLeads * 10, 100) },
        { metric: "Conversion", value: Math.min(data.overview.conversionRate * 10, 100) },
        { metric: "Engagement", value: Math.min((data.overview.totalContent / Math.max(data.overview.totalProperties, 1)) * 20, 100) },
      ]
    : [];

  const languageData = data
    ? [
        { name: "English", value: data.overview.contentByLanguage.english || 0, color: "#3b82f6" },
        { name: "Swahili", value: data.overview.contentByLanguage.swahili || 0, color: "#10b981" },
      ]
    : [];

  const quotaPercent = data
    ? data.overview.quotaLimit > 0
      ? Math.min((data.overview.quotaUsed / data.overview.quotaLimit) * 100, 100)
      : 0
    : 0;

  // ─── Render ─────────────────────────────────────────────────

  if (error) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <Activity className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Failed to load dashboard</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchDashboard}
            className="text-emerald-600 hover:text-emerald-700"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "there"}! Here&apos;s your marketing overview.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Section 1: Top Stats Row */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <motion.div key={i} variants={itemVariants}>
              <StatCardSkeleton />
            </motion.div>
          ))
        ) : (
          data && (
            <>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Total Properties"
                  value={data.overview.totalProperties}
                  icon={Building2}
                  iconBg="bg-emerald-100 dark:bg-emerald-950"
                  iconColor="text-emerald-600 dark:text-emerald-400"
                  subValue={`${data.overview.activeProperties} active`}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Content Generated"
                  value={data.overview.totalContent}
                  icon={FileText}
                  iconBg="bg-blue-100 dark:bg-blue-950"
                  iconColor="text-blue-600 dark:text-blue-400"
                  subValue="All types"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Total Leads"
                  value={data.overview.totalLeads}
                  icon={Users}
                  iconBg="bg-amber-100 dark:bg-amber-950"
                  iconColor="text-amber-600 dark:text-amber-400"
                  subValue={`${data.overview.leadsByStatus.new || 0} new`}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Conversion Rate"
                  value={data.overview.conversionRate}
                  icon={TrendingUp}
                  iconBg="bg-purple-100 dark:bg-purple-950"
                  iconColor="text-purple-600 dark:text-purple-400"
                  suffix="%"
                  subValue="Closed leads"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Portfolio Value"
                  value={formatKES(data.overview.totalPropertyPrice)}
                  icon={DollarSign}
                  iconBg="bg-rose-100 dark:bg-rose-950"
                  iconColor="text-rose-600 dark:text-rose-400"
                  subValue={`Avg ${formatKES(data.overview.avgPropertyPrice)}`}
                />
              </motion.div>
            </>
          )
        )}
      </motion.div>

      {/* Section 2: AI Usage Bar + Quota */}
      {!isLoading && data && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 border-emerald-100 dark:border-emerald-900/30">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">AI Content Generation</p>
                    <p className="text-xs text-muted-foreground">
                      {data.overview.quotaUsed} of {data.overview.quotaLimit} generations used this month
                    </p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <Progress value={quotaPercent} className="h-2.5 flex-1" />
                  <Badge
                    variant={quotaPercent > 80 ? "destructive" : "secondary"}
                    className="shrink-0 text-xs font-semibold"
                  >
                    {quotaPercent.toFixed(0)}% used
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => setView("generate")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                >
                  <Sparkles className="size-4 mr-1.5" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Section 3: Main Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Chart A: Content by Type (colored bars) */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-emerald-600" />
                  <CardTitle className="text-base">Content by Type</CardTitle>
                </div>
                <CardDescription>Distribution of generated marketing content</CardDescription>
              </CardHeader>
              <CardContent>
                {contentTypeData.length === 0 ? (
                  <EmptyChartMessage message="No content generated yet" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={contentTypeData}
                      margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="value"
                        name="Content"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={52}
                      >
                        {contentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Chart B: Lead Pipeline */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCheck className="size-5 text-emerald-600" />
                  <CardTitle className="text-base">Lead Pipeline</CardTitle>
                </div>
                <CardDescription>Leads distribution by status</CardDescription>
              </CardHeader>
              <CardContent>
                {leadPipelineData.length === 0 ? (
                  <EmptyChartMessage message="No leads captured yet" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={leadPipelineData}
                      layout="vertical"
                      margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={85}
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="count"
                        name="Leads"
                        radius={[0, 6, 6, 0]}
                        maxBarSize={28}
                      >
                        {leadPipelineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Section 4: Trends Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Chart C: Content Generation Trend */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="size-5 text-blue-600" />
                  <CardTitle className="text-base">Content Generation Trend</CardTitle>
                </div>
                <CardDescription>Content created in the last 14 days</CardDescription>
              </CardHeader>
              <CardContent>
                {contentTrendData.every((d) => d.count === 0) ? (
                  <EmptyChartMessage message="No content created recently" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart
                      data={contentTrendData}
                      margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="contentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        className="text-muted-foreground"
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="Content"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#contentGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Chart D: Lead Sources Pie */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChartIcon className="size-5 text-amber-600" />
                  <CardTitle className="text-base">Lead Sources</CardTitle>
                </div>
                <CardDescription>Where your leads are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                {leadSourceData.length === 0 ? (
                  <EmptyChartMessage message="No leads captured yet" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {leadSourceData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={LEAD_SOURCE_COLORS[index % LEAD_SOURCE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string) => (
                          <span className="text-xs text-muted-foreground">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Section 5: Bottom Row - Tabs for more data */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recent" className="text-xs sm:text-sm gap-1.5">
            <Clock className="size-3.5 hidden sm:block" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm gap-1.5">
            <Home className="size-3.5 hidden sm:block" />
            Property Performance
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs sm:text-sm gap-1.5">
            <Target className="size-3.5 hidden sm:block" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="language" className="text-xs sm:text-sm gap-1.5">
            <Languages className="size-3.5 hidden sm:block" />
            Content Language
          </TabsTrigger>
        </TabsList>

        {/* Tab: Recent Activity */}
        <TabsContent value="recent">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Recent Content */}
            <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="size-5 text-blue-600" />
                      <CardTitle className="text-base">Recent Content</CardTitle>
                    </div>
                  </div>
                  <CardDescription>Latest generated marketing materials</CardDescription>
                </CardHeader>
                <CardContent>
                  {data && data.recentContent.length > 0 ? (
                    <div className="space-y-3">
                      {data.recentContent.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex size-8 items-center justify-center rounded-lg bg-muted shrink-0">
                            <ContentTypeIcon type={item.contentType || ""} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {CONTENT_TYPE_LABELS[item.contentType || ""] || item.contentType}
                              {item.propertyName ? ` · ${item.propertyName}` : ""}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <FileText className="size-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No content generated yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Leads */}
            <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="size-5 text-amber-600" />
                      <CardTitle className="text-base">Recent Leads</CardTitle>
                    </div>
                    <CardAction>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setView("leads")}
                      >
                        View All <ArrowRight className="size-3.5 ml-1" />
                      </Button>
                    </CardAction>
                  </div>
                  <CardDescription>Latest lead inquiries</CardDescription>
                </CardHeader>
                <CardContent>
                  {data && data.recentLeads.length > 0 ? (
                    <div className="space-y-3">
                      {data.recentLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950 shrink-0">
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                              {(lead.name || "U").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {lead.propertyName || lead.source}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={lead.status || "new"} />
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(lead.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <Users className="size-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No leads captured yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Tab: Property Performance */}
        <TabsContent value="performance">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="size-5 text-emerald-600" />
                      <CardTitle className="text-base">Property Performance</CardTitle>
                    </div>
                    {data && data.propertyPerformance.length > 0 && (
                      <CardAction>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-emerald-600"
                          onClick={() => setView("properties")}
                        >
                          View All <ArrowRight className="size-4" />
                        </Button>
                      </CardAction>
                    )}
                  </div>
                  <CardDescription>
                    Top properties ranked by lead count
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data && data.propertyPerformance.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[160px]">Title</TableHead>
                          <TableHead className="hidden sm:table-cell">Type</TableHead>
                          <TableHead>Price (KES)</TableHead>
                          <TableHead className="hidden md:table-cell text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <FileText className="size-3.5" /> Content
                            </div>
                          </TableHead>
                          <TableHead className="text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <Users className="size-3.5" /> Leads
                            </div>
                          </TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.propertyPerformance.map((property) => (
                          <TableRow
                            key={property.id}
                            className="cursor-pointer"
                            onClick={() => {
                              selectProperty(property.id);
                              setView("property-detail");
                            }}
                          >
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {property.title}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="outline" className="capitalize text-xs">
                                {property.propertyType.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {property.price.toLocaleString()}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-center">
                              {property.contentCount}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {property.leadCount}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={property.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                      <Home className="size-10 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">No properties listed yet</p>
                        <p className="text-sm text-muted-foreground">
                          Add your first property to see performance data.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* Tab: Insights */}
        <TabsContent value="insights">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Radar Chart: Marketing Score */}
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Target className="size-5 text-purple-600" />
                      <CardTitle className="text-base">Marketing Score</CardTitle>
                    </div>
                    <CardDescription>Your overall marketing effectiveness</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {radarData.every((d) => d.value === 0) ? (
                      <EmptyChartMessage message="No activity data yet" />
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid className="stroke-muted" />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} className="text-muted-foreground" />
                          <Radar
                            name="Score"
                            dataKey="value"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Property Types Distribution */}
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Building2 className="size-5 text-emerald-600" />
                      <CardTitle className="text-base">Property Types</CardTitle>
                    </div>
                    <CardDescription>Your property portfolio breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {propertyTypeData.length === 0 ? (
                      <EmptyChartMessage message="No properties listed" />
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={propertyTypeData}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                          >
                            {propertyTypeData.map((_entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"][index % 6]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value: string) => (
                              <span className="text-xs text-muted-foreground">{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Portfolio Stats Cards */}
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-5 text-emerald-600" />
                      <CardTitle className="text-base">Portfolio Stats</CardTitle>
                    </div>
                    <CardDescription>Property valuation overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5 pt-2">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-muted-foreground">Total Value</span>
                          <span className="text-lg font-bold text-emerald-600">
                            {formatKES(data?.overview.totalPropertyPrice || 0)}
                          </span>
                        </div>
                        <Progress value={100} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-muted-foreground">Avg. Property</span>
                          <span className="text-lg font-bold text-blue-600">
                            {formatKES(data?.overview.avgPropertyPrice || 0)}
                          </span>
                        </div>
                        <Progress value={60} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-muted-foreground">Highest Priced</span>
                          <span className="text-lg font-bold text-purple-600">
                            {formatKES(data?.overview.maxPropertyPrice || 0)}
                          </span>
                        </div>
                        <Progress value={85} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-muted-foreground">Lowest Priced</span>
                          <span className="text-lg font-bold text-amber-600">
                            {formatKES(data?.overview.minPropertyPrice || 0)}
                          </span>
                        </div>
                        <Progress value={25} className="h-1.5" />
                      </div>
                      <div className="pt-3 border-t">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center">
                            <p className="text-2xl font-bold">
                              {data?.overview.propertiesByStatus.active || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Active</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">
                              {data?.overview.propertiesByStatus.sold || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Sold</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Content Language */}
        <TabsContent value="language">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Language Distribution */}
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Languages className="size-5 text-blue-600" />
                      <CardTitle className="text-base">Content Language Split</CardTitle>
                    </div>
                    <CardDescription>English vs Swahili content distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(data?.overview.contentByLanguage.english || 0) +
                      (data?.overview.contentByLanguage.swahili || 0) ===
                    0 ? (
                      <EmptyChartMessage message="No content generated yet" />
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={languageData}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            innerRadius={50}
                            paddingAngle={4}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {languageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value: string) => (
                              <span className="text-xs text-muted-foreground">{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Top Content Properties */}
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Eye className="size-5 text-emerald-600" />
                      <CardTitle className="text-base">Top Properties by Content</CardTitle>
                    </div>
                    <CardDescription>Properties with the most generated content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data && data.topContentProperties && data.topContentProperties.length > 0 ? (
                      <div className="space-y-4 pt-2">
                        {data.topContentProperties.map((prop, idx) => {
                          const maxContent = Math.max(
                            ...data.topContentProperties.map((p) => p.contentCount),
                            1
                          );
                          return (
                            <div key={prop.id} className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                  {idx + 1}. {prop.title}
                                </span>
                                <span className="text-sm font-semibold text-emerald-600">
                                  {prop.contentCount}
                                </span>
                              </div>
                              <Progress
                                value={(prop.contentCount / maxContent) * 100}
                                className="h-2"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyChartMessage message="No content generated yet" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Section 6: Quick Actions */}
      {!isLoading && (
        <motion.div
          className="grid gap-4 sm:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card
              className="cursor-pointer transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700"
              onClick={() => setView("add-property")}
            >
              <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
                  <Plus className="size-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Add Property</p>
                  <p className="text-sm text-muted-foreground">
                    List a new property
                  </p>
                </div>
                <ArrowRight className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card
              className="cursor-pointer transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
              onClick={() => setView("generate")}
            >
              <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
                  <Sparkles className="size-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Generate Content</p>
                  <p className="text-sm text-muted-foreground">
                    Create AI marketing copy
                  </p>
                </div>
                <ArrowRight className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card
              className="cursor-pointer transition-all hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700"
              onClick={() => setView("leads")}
            >
              <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950">
                  <UserCheck className="size-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">View Leads</p>
                  <p className="text-sm text-muted-foreground">
                    Manage your pipeline
                  </p>
                </div>
                <ArrowRight className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Small Helpers ───────────────────────────────────────────────────

function EmptyChartMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <BarChart3 className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: {
      label: "Active",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    },
    sold: {
      label: "Sold",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    },
    pending: {
      label: "Pending",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    },
    inactive: {
      label: "Inactive",
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400",
    },
    new: {
      label: "New",
      className:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
    },
    contacted: {
      label: "Contacted",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    },
    viewing: {
      label: "Viewing",
      className:
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
    },
    negotiation: {
      label: "Negotiation",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    },
    closed: {
      label: "Closed",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    },
    lost: {
      label: "Lost",
      className:
        "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    },
  };

  const { label, className } = config[status.toLowerCase()] ?? {
    label: status,
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
