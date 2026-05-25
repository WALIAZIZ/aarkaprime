"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Building2,
  FileText,
  MessageSquare,
  Shield,
  Globe,
  Trash2,
  Edit,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES_SORTED, COUNTRIES } from "@/lib/countries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminStats {
  totalUsers: number;
  activeProperties: number;
  totalLeads: number;
  totalContent: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  country: string | null;
  role: string;
  plan: string;
  monthlyGenerationsUsed: number;
  monthlyGenerationsLimit: number;
  activeListings: number;
  maxListings: number;
  createdAt: string;
}

interface AdminLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  status: string;
  createdAt: string;
  user: { name: string | null } | null;
  property: { title: string } | null;
}

interface AdminData {
  stats: AdminStats;
  usersByCountry: Record<string, number>;
  usersByPlan: { free: number; starter: number; pro: number; enterprise: number };
  users: AdminUser[];
  recentLeads: AdminLead[];
}

function getCountryFlag(code: string): string {
  const c = COUNTRIES.find((c) => c.code === code);
  return c?.flag || "\u{1F30D}";
}

function getCountryName(code: string): string {
  const c = COUNTRIES.find((c) => c.code === code);
  return c?.name || code;
}

const planColors: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  starter: "bg-emerald-100 text-emerald-700",
  pro: "bg-emerald-600 text-white",
  enterprise: "bg-amber-100 text-amber-700",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  qualified: "bg-emerald-100 text-emerald-700",
  converted: "bg-purple-100 text-purple-700",
  lost: "bg-red-100 text-red-700",
};

export function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleUpdateRole = async (userId: string, role: string) => {
    setUpdating(userId);
    try {
      const user = data?.users.find((u) => u.id === userId);
      if (!user) return;
      await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, plan: user.plan }),
      });
      await fetchAdminData();
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdatePlan = async (userId: string, plan: string) => {
    setUpdating(userId);
    try {
      const user = data?.users.find((u) => u.id === userId);
      if (!user) return;
      await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role, plan }),
      });
      await fetchAdminData();
    } catch (error) {
      console.error("Failed to update plan:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setUpdating(deleteTarget.id);
    try {
      await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      await fetchAdminData();
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-muted-foreground">Loading admin dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="size-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Unable to load admin data</h2>
        <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
        <Button onClick={fetchAdminData} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const totalUsers = data.stats.totalUsers;
  // Gather all country codes present in the data, sorted alphabetically
  const countryEntries = COUNTRIES_SORTED.map((c) => ({
    code: c.code,
    count: data.usersByCountry[c.code] ?? 0,
  })).filter((e) => e.count > 0);
  const maxCountryVal = Math.max(...countryEntries.map((e) => e.count), 1);

  return (
    <div className="space-y-6 p-6">
      {/* Admin Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Shield className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">System overview &amp; user management</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={data.stats.totalUsers}
          color="emerald"
        />
        <StatCard
          icon={Building2}
          label="Active Properties"
          value={data.stats.activeProperties}
          color="blue"
        />
        <StatCard
          icon={MessageSquare}
          label="Total Leads"
          value={data.stats.totalLeads}
          color="amber"
        />
        <StatCard
          icon={FileText}
          label="Content Generated"
          value={data.stats.totalContent}
          color="purple"
        />
      </div>

      {/* Country & Plan Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Users by Country */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Globe className="size-4 text-emerald-600" />
              Users by Country
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {countryEntries.map((entry) => {
              const pct = totalUsers > 0 ? Math.round((entry.count / totalUsers) * 100) : 0;
              return (
                <div key={entry.code} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {getCountryFlag(entry.code)} {getCountryName(entry.code)}
                    </span>
                    <span className="text-muted-foreground">
                      {entry.count} user{entry.count !== 1 ? "s" : ""} ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(entry.count / maxCountryVal) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {countryEntries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No users registered yet</p>
            )}
          </CardContent>
        </Card>

        {/* Users by Plan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="size-4 text-emerald-600" />
              Users by Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["free", "starter", "pro", "enterprise"] as const).map((p) => {
              const count = data.usersByPlan[p];
              const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
              const maxPlanVal = Math.max(
                data.usersByPlan.free,
                data.usersByPlan.starter,
                data.usersByPlan.pro,
                data.usersByPlan.enterprise,
                1
              );
              return (
                <div key={p} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{p}</span>
                    <span className="text-muted-foreground">
                      {count} user{count !== 1 ? "s" : ""} ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        p === "free"
                          ? "bg-gray-400"
                          : p === "starter"
                            ? "bg-emerald-400"
                            : p === "pro"
                              ? "bg-emerald-600"
                              : "bg-amber-500"
                      }`}
                      style={{ width: `${(count / maxPlanVal) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* User Management Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Edit className="size-4 text-emerald-600" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Country</TableHead>
                  <TableHead className="text-center">Plan</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-center hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1">
                          {getCountryFlag(user.country || "kenya")}
                          <span className="hidden sm:inline text-xs">
                            {getCountryName(user.country || "kenya")}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {updating === user.id ? (
                          <Loader2 className="size-4 animate-spin mx-auto" />
                        ) : (
                          <Select
                            value={user.plan}
                            onValueChange={(val) => handleUpdatePlan(user.id, val)}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="starter">Starter</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {updating === user.id ? (
                          <Loader2 className="size-4 animate-spin mx-auto" />
                        ) : (
                          <Select
                            value={user.role}
                            onValueChange={(val) => handleUpdateRole(user.id, val)}
                          >
                            <SelectTrigger className="w-24 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-center hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => setDeleteTarget(user)}
                          disabled={updating === user.id}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Leads Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <MessageSquare className="size-4 text-emerald-600" />
            Recent Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Source</TableHead>
                  <TableHead className="text-center hidden lg:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {lead.email || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {lead.property?.title || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={statusColors[lead.status] || "bg-gray-100 text-gray-700"}
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        <Badge variant="outline" className="text-xs capitalize">
                          {lead.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name || deleteTarget?.email}</strong>? This action cannot
              be undone. All of the user&apos;s properties, leads, and generated content will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─── Stat Card Sub-component ─────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "emerald" | "blue" | "amber" | "purple";
}) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClasses[color]}`}
        >
          <Icon className="size-6" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {value.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
