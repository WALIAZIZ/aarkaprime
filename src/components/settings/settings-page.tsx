'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  Crown,
  Sparkles,
  AlertTriangle,
  Trash2,
  Loader2,
  Save,
  Shield,
  Check,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useAppStore, type AuthUser } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserData extends AuthUser {
  activeListingsCount?: number;
  maxListings?: number;
}

const planFeatures: Record<string, { label: string; value: number }> = {
  free: { label: 'Free', value: 0 },
  starter: { label: 'Starter', value: 1 },
  professional: { label: 'Professional', value: 2 },
  enterprise: { label: 'Enterprise', value: 3 },
};

const planColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  starter:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  professional:
    'bg-emerald-600 text-white dark:bg-emerald-600',
  enterprise:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const planDescriptions: Record<string, string> = {
  free: 'Basic features for getting started',
  starter: 'More generations and listings',
  professional: 'Full access to all features',
  enterprise: 'Custom solutions for large teams',
};

export function SettingsPage() {
  const {
    user,
    setUser,
    setView,
    addToast,
  } = useAppStore();
  const userId = user?.id ?? '';

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileCompany, setProfileCompany] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user?userId=${userId}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.user ?? json;
        const u: UserData = {
          id: data.id || userId,
          email: data.email || user?.email || '',
          name: data.name || user?.name || '',
          company: data.company || user?.company || '',
          role: data.role || user?.role || 'user',
          plan: data.plan || user?.plan || 'free',
          monthlyGenerationsUsed: data.monthlyGenerationsUsed ?? user?.monthlyGenerationsUsed ?? 0,
          monthlyGenerationsLimit: data.monthlyGenerationsLimit ?? user?.monthlyGenerationsLimit ?? 10,
          activeListings: data.activeListings ?? user?.activeListings ?? 0,
          maxListings: data.maxListings ?? user?.maxListings ?? 3,
        };
        setUserData(u);
        setProfileName(u.name || '');
        setProfileEmail(u.email || '');
        setProfileCompany(u.company || '');
      }
    } catch {
      // Use local user data as fallback
      if (user) {
        setUserData(user as UserData);
        setProfileName(user.name || '');
        setProfileEmail(user.email || '');
        setProfileCompany(user.company || '');
      }
    } finally {
      setLoading(false);
    }
  }, [userId, user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSavingProfile(true);
    setProfileSaved(false);

    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: profileName,
          email: profileEmail,
          company: profileCompany,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update profile');
      }

      // Update local state
      if (userData) {
        const updated = { ...userData, name: profileName, email: profileEmail, company: profileCompany };
        setUserData(updated);
        setUser(updated);
      }

      setProfileSaved(true);
      addToast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully',
        variant: 'success',
      });
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update profile';
      addToast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/user?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete account');
      }

      setUser(null);
      localStorage.removeItem('estateiq_user');
      setView('landing');
    } catch {
      addToast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const effectiveUser = userData || user;
  const plan = effectiveUser?.plan?.toLowerCase() || 'free';
  const generationsUsed = effectiveUser?.monthlyGenerationsUsed ?? 0;
  const generationsLimit = effectiveUser?.monthlyGenerationsLimit ?? 10;
  const activeListings = effectiveUser?.activeListings ?? 0;
  const maxListings = effectiveUser?.maxListings ?? 3;

  const generationsPercent =
    generationsLimit > 0
      ? Math.min((generationsUsed / generationsLimit) * 100, 100)
      : 0;
  const listingsPercent =
    maxListings > 0 ? Math.min((activeListings / maxListings) * 100, 100) : 0;

  const currentPlanLevel = planFeatures[plan]?.value ?? 0;
  const nextPlan = Object.entries(planFeatures).find(
    ([, v]) => v.value === currentPlanLevel + 1
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your account settings
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-emerald-500" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/20">
                <User className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Profile
            </CardTitle>
            <CardDescription>
              Update your personal information and company details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Full Name</Label>
                <Input
                  id="settings-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email">Email Address</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-company">Company Name</Label>
              <Input
                id="settings-company"
                value={profileCompany}
                onChange={(e) => setProfileCompany(e.target.value)}
                placeholder="Your company name"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-end">
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 min-w-[120px]"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : profileSaved ? (
                <>
                  <Check className="size-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Plan Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/20">
                <Crown className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Your Plan
            </CardTitle>
            <CardDescription>
              Manage your subscription and view usage statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Badge
                  className={`px-4 py-2 text-base font-bold capitalize ${planColors[plan] || planColors.free}`}
                >
                  <Crown className="size-4 mr-1.5" />
                  {effectiveUser?.plan || 'Free'} Plan
                </Badge>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {planDescriptions[plan] || 'Basic features'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {effectiveUser?.role === 'admin' ? 'Admin account' : 'Standard account'}
                  </p>
                </div>
              </div>
              {nextPlan && (
                <Button
                  variant="outline"
                  onClick={() => setView('pricing')}
                  className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/30"
                >
                  <Zap className="size-4" />
                  Upgrade Plan
                  <ArrowRight className="size-3.5" />
                </Button>
              )}
            </div>

            <Separator />

            {/* Usage Stats */}
            <div className="space-y-5">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Usage Statistics
              </h4>

              {/* Content Generations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Content Generations
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {generationsUsed}/{generationsLimit}
                  </span>
                </div>
                <Progress value={generationsPercent} className="h-2.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {generationsUsed >= generationsLimit
                    ? 'You have reached your monthly generation limit. Upgrade for more.'
                    : `${generationsLimit - generationsUsed} generations remaining this month`}
                </p>
              </div>

              {/* Active Listings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-emerald-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active Listings
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {activeListings}/{maxListings}
                  </span>
                </div>
                <Progress value={listingsPercent} className="h-2.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activeListings >= maxListings
                    ? 'You have reached your listing limit. Upgrade to add more properties.'
                    : `${maxListings - activeListings} more listings available`}
                </p>
              </div>
            </div>

            <Separator />

            {/* Plan Comparison Summary */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Plan Comparison
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(planFeatures).map(([key, val]) => (
                  <div
                    key={key}
                    className={`rounded-lg border p-3 text-center transition-colors ${
                      key === plan
                        ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                        : 'border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900'
                    }`}
                  >
                    <p className="text-xs font-semibold capitalize text-gray-900 dark:text-gray-100">
                      {val.label}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {key === plan ? 'Current' : `${val.value} levels`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-red-200 dark:border-red-900/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center dark:bg-red-900/20">
                <AlertTriangle className="size-4" />
              </div>
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
              <div>
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                  Delete Account
                </h4>
                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                  Permanently delete your account and all associated data
                  including properties, leads, and generated content. This action
                  cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="gap-1.5 shrink-0"
                  >
                    <Trash2 className="size-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="size-5" />
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                      This action <strong>cannot be undone</strong>. This will
                      permanently delete your account and remove all your data
                      from our servers, including:
                    </AlertDialogDescription>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-2">
                      <li>All your properties and listings</li>
                      <li>All your leads and contacts</li>
                      <li>All generated marketing content</li>
                      <li>Your profile information</li>
                    </ul>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
