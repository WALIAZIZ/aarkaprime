"use client";

import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";

// Layout
import { AppLayout } from "@/components/layout/app-layout";

// Landing
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { PricingSection } from "@/components/landing/pricing-section";
import { ServicesSection } from "@/components/landing/services-section";
import { Testimonials } from "@/components/landing/testimonials";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

// Auth
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

// Dashboard
import { EnhancedDashboard } from "@/components/dashboard/enhanced-dashboard";

// Properties
import { PropertyList } from "@/components/properties/property-list";
import { AddPropertyForm } from "@/components/properties/add-property-form";
import { PropertyDetail } from "@/components/properties/property-detail";

// AI
import { GeneratePanel } from "@/components/ai/generate-panel";

// Leads
import { LeadsTable } from "@/components/leads/leads-table";

// Settings
import { SettingsPage } from "@/components/settings/settings-page";

// Admin
import { AdminDashboard } from "@/components/admin/admin-dashboard";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2,
};

function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <Features />
      <PricingSection />
      <ServicesSection />
      <Testimonials />
      <CtaSection />
      <Footer />
    </div>
  );
}

function PricingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <PricingSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

function DashboardPage() {
  return <EnhancedDashboard />;
}

function PropertiesPage() {
  return <PropertyList />;
}

function AddPropertyPage() {
  return <AddPropertyForm />;
}

function PropertyDetailPage() {
  return <PropertyDetail />;
}

function GeneratePage() {
  return <GeneratePanel />;
}

function LeadsPage() {
  return <LeadsTable />;
}

function SettingsPageView() {
  return <SettingsPage />;
}

export default function Home() {
  const { view, user, setUser, setView, setLoading } = useAppStore();

  // Check for saved session on mount
  const checkSession = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem("estateiq_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Verify session is still valid by hitting an endpoint
        try {
          const res = await fetch(`/api/user?userId=${parsed.id}`);
          if (res.ok) {
            const json = await res.json();
            const data = json.user ?? json;
            setUser({
              ...parsed,
              monthlyGenerationsUsed: data.monthlyGenerationsUsed,
              monthlyGenerationsLimit: data.monthlyGenerationsLimit,
              activeListings: data.activeListings,
              maxListings: data.maxListings,
            });
          } else {
            // Session invalid, clear it
            localStorage.removeItem("estateiq_user");
            setUser(null);
          }
        } catch {
          // Network error, keep local session
        }
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  // Initialize database and seed demo data on app mount
  useEffect(() => {
    // Step 1: Create tables
    fetch("/api/setup").then((setupRes) => {
      if (setupRes.ok) {
        console.log("[App] Database tables ready");
        // Step 2: Seed demo data (creates demo user + sample properties)
        fetch("/api/seed", { method: "POST" }).then((seedRes) => {
          if (seedRes.ok) {
            console.log("[App] Demo data seeded");
          }
        }).catch(() => {});
      } else {
        console.warn("[App] Database setup in progress...");
      }
    }).catch(() => {});
    checkSession();
  }, [checkSession]);

  // Persist user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("estateiq_user", JSON.stringify(user));
    }
  }, [user]);

  // Redirect unauthenticated users from protected views
  const isProtectedView =
    view !== "landing" &&
    view !== "login" &&
    view !== "register" &&
    view !== "admin-login" &&
    view !== "pricing";

  useEffect(() => {
    if (!user && isProtectedView) {
      setView("login");
    }
  }, [user, isProtectedView, setView]);

  // Render based on view and auth state
  const renderView = () => {
    // Public views (no auth required)
    if (!user) {
      switch (view) {
        case "login":
          return <LoginForm />;
        case "register":
          return <RegisterForm />;
        case "admin-login":
          return <AdminLoginForm />;
        case "pricing":
          return <PricingPage />;
        case "landing":
        default:
          return <LandingPage />;
      }
    }

    // Protected views (auth required)
    switch (view) {
      case "properties":
        return <PropertiesPage />;
      case "add-property":
        return <AddPropertyPage />;
      case "edit-property":
        return <AddPropertyPage />;
      case "property-detail":
        return <PropertyDetailPage />;
      case "generate":
        return <GeneratePage />;
      case "leads":
        return <LeadsPage />;
      case "settings":
        return <SettingsPageView />;
      case "admin":
        return <AdminDashboard />;
      case "dashboard":
      default:
        return <DashboardPage />;
    }
  };

  // Show loading screen while checking session
  if (user === null && view === "landing") {
    // For landing page, no loading needed
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {user ? (
          <motion.div
            key={`app-${view}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <AppLayout>{renderView()}</AppLayout>
          </motion.div>
        ) : (
          <motion.div
            key={`public-${view}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {renderView()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
