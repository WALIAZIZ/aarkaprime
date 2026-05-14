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
} from "recharts";

import { useAppStore } from "@/store/app-store";
import { Card, CardContent, CardHeader, CardTitle, CardAction, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  propertyTypes: Record<string, number>;
  totalPropertyPrice: number;
  avgPropertyPrice: number;
  conversionRate: number;
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

interface DashboardData {
  overview: DashboardOverview;
  propertyPerformance: PropertyPerformance[];
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
  new: "#6b7280",
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

const LEAD_SOURCE_COLORS = [
  "#10b981",
  "#059669",
  "#34d399",
  "#6ee7b7",
  "#a7f3d0",
  "#d1fae5",
];

const CONTENT_TYPE_LABELS: Record<string, string> = {
  description: "Description",
  social_post: "Social Posts",
  whatsapp_msg: "WhatsApp",
  email_campaign: "Email",
  ad_copy: "Ad Copy",
};

// ─── Animation Variants ──────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
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

// ─── Sub-components ──────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  suffix,
  subValue,
}: {
  label: string;
  value: number;
  icon: typeof Building2;
  iconBg: string;
  iconColor: string;
  suffix?: string;
  subValue?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">
              {value.toLocaleString()}
              {suffix}
            </p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
          <div
            className={`flex size-10 sm:size-12 items-center justify-center rounded-full ${iconBg}`}
          >
            <Icon className={`size-5 sm:size-6 ${iconColor}`} />
          </div>
        </div>
        {subValue && (
          <p className="mt-2 text-xs text-muted-foreground">{subValue}</p>
        )}
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
          <Skeleton className="size-10 sm:size-12 rounded-full" />
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
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center" style={{ height: 260 }}>
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
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
    ? Object.entries(data.overview.contentByType).map(([key, count]) => ({
        name: CONTENT_TYPE_LABELS[key] || key,
        value: count,
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

  const leadSourceData = data
    ? Object.entries(data.overview.leadsBySource)
        .filter(([, count]) => count > 0)
        .map(([source, count]) => ({
          name: LEAD_SOURCE_LABELS[source] || source,
          value: count,
        }))
    : [];

  const hasAnyData = data
    ? data.overview.totalProperties > 0 ||
      data.overview.totalContent > 0 ||
      data.overview.totalLeads > 0
    : false;

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s your marketing overview.
        </p>
      </div>

      {/* Section 1: Overview Stats Cards */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          <>
            <motion.div variants={itemVariants}>
              <StatCardSkeleton />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCardSkeleton />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCardSkeleton />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCardSkeleton />
            </motion.div>
          </>
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
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Total Leads"
                  value={data.overview.totalLeads}
                  icon={Users}
                  iconBg="bg-amber-100 dark:bg-amber-950"
                  iconColor="text-amber-600 dark:text-amber-400"
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
                />
              </motion.div>
            </>
          )
        )}
      </motion.div>

      {/* Section 2: Charts Row — Content by Type + Lead Pipeline */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Chart A: Content by Type */}
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
                {contentTypeData.every((d) => d.value === 0) ? (
                  <EmptyChartMessage message="No content generated yet" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={contentTypeData}
                      margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
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
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                      />
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
                  <ResponsiveContainer width="100%" height={260}>
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
                        radius={[0, 4, 4, 0]}
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

      {/* Section 3: Charts Row — Content Trend + Lead Sources */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Chart C: Content Generation Trend */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="size-5 text-emerald-600" />
                  <CardTitle className="text-base">Content Generation Trend</CardTitle>
                </div>
                <CardDescription>Content created in the last 14 days</CardDescription>
              </CardHeader>
              <CardContent>
                {contentTrendData.every((d) => d.count === 0) ? (
                  <EmptyChartMessage message="No content created recently" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
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
                        tick={{ fontSize: 11 }}
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
                        strokeWidth={2}
                        fill="url(#contentGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Chart D: Lead Sources */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChartIcon className="size-5 text-emerald-600" />
                  <CardTitle className="text-base">Lead Sources</CardTitle>
                </div>
                <CardDescription>Where your leads are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                {leadSourceData.length === 0 ? (
                  <EmptyChartMessage message="No leads captured yet" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
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

      {/* Section 4: Property Performance Table */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
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
              <div className="flex items-center gap-2">
                <Home className="size-5 text-emerald-600" />
                <CardTitle className="text-base">Property Performance</CardTitle>
              </div>
              <CardDescription>
                Top properties ranked by lead count
              </CardDescription>
              {data && data.propertyPerformance.length > 0 && (
                <CardAction>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-emerald-600"
                    onClick={() => setView("properties")}
                  >
                    View All
                    <ArrowRight className="size-4" />
                  </Button>
                </CardAction>
              )}
            </CardHeader>
            <CardContent>
              {data && data.propertyPerformance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[160px]">Title</TableHead>
                      <TableHead className="hidden sm:table-cell">Type</TableHead>
                      <TableHead>Price (KES)</TableHead>
                      <TableHead className="hidden md:table-cell text-center">Content</TableHead>
                      <TableHead className="text-center">Leads</TableHead>
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
                            {property.propertyType.replace("_", " ")}
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

      {/* Section 5: Quick Actions */}
      {!isLoading && (
        <motion.div
          className="grid gap-4 sm:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setView("add-property")}
            >
              <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                  <Plus className="size-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold">Add Property</p>
                  <p className="text-sm text-muted-foreground">
                    List a new property
                  </p>
                </div>
                <ArrowRight className="ml-auto size-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setView("generate")}
            >
              <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                  <Sparkles className="size-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold">Generate Content</p>
                  <p className="text-sm text-muted-foreground">
                    Create AI marketing copy
                  </p>
                </div>
                <ArrowRight className="ml-auto size-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setView("leads")}
            >
              <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                  <UserCheck className="size-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold">View Leads</p>
                  <p className="text-sm text-muted-foreground">
                    Manage your pipeline
                  </p>
                </div>
                <ArrowRight className="ml-auto size-5 text-muted-foreground" />
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
