'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  Users,
  Settings,
  Menu,
  LogOut,
  Building,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, type AppView } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  label: string;
  icon: React.ElementType;
  view: AppView;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
  { label: 'Properties', icon: Building2, view: 'properties' },
  { label: 'Generate Content', icon: Sparkles, view: 'generate' },
  { label: 'Leads', icon: Users, view: 'leads' },
  { label: 'Settings', icon: Settings, view: 'settings' },
];

const viewTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  properties: 'Properties',
  'add-property': 'Add Property',
  'edit-property': 'Edit Property',
  'property-detail': 'Property Details',
  generate: 'Generate Content',
  leads: 'Leads',
  settings: 'Settings',
  pricing: 'Pricing',
};

const planColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  starter: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  professional: 'bg-emerald-600 text-white dark:bg-emerald-600',
  enterprise: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

function SidebarNavContent({
  onItemClick,
}: {
  onItemClick?: () => void;
}) {
  const { view, setView, user } = useAppStore();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Building className="size-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
          EstateIQ
        </span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = view === item.view;
            const Icon = item.icon;
            return (
              <li key={item.view}>
                <button
                  onClick={() => {
                    setView(item.view);
                    onItemClick?.();
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-400 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400'
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info at bottom */}
      {user && (
        <>
          <Separator />
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold dark:bg-emerald-900/30 dark:text-emerald-400">
                  {user.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name || 'User'}
                </p>
                <Badge
                  variant="secondary"
                  className={cn(
                    'mt-0.5 text-[10px] uppercase font-semibold',
                    planColors[user.plan?.toLowerCase() ?? 'free']
                  )}
                >
                  {user.plan || 'Free'}
                </Badge>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const {
    view,
    setView,
    setUser,
    sidebarOpen,
    setSidebarOpen,
    user,
  } = useAppStore();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {
      // ignore errors
    }
    setUser(null);
    localStorage.removeItem('estateiq_user');
    setView('landing');
  };

  const pageTitle = viewTitles[view] ?? 'EstateIQ';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: 260 }}
        className="hidden lg:flex flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shrink-0"
      >
        <SidebarNavContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNavContent
            onItemClick={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6 dark:border-gray-800 dark:bg-gray-900">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>

          {/* Page Title */}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {pageTitle}
          </h1>

          <div className="ml-auto flex items-center gap-3">
            {/* Plan Badge */}
            {user && (
              <Badge
                variant="secondary"
                className={cn(
                  'hidden sm:inline-flex uppercase font-semibold text-[10px]',
                  planColors[user.plan?.toLowerCase() ?? 'free']
                )}
              >
                {user.plan || 'Free'}
              </Badge>
            )}

            {/* User Avatar & Name */}
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold dark:bg-emerald-900/30 dark:text-emerald-400">
                    {user.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.name || 'User'}
                </span>
              </div>
            )}

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              aria-label="Logout"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
