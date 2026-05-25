"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, Shield, ArrowLeft } from "lucide-react";

import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

interface SignInResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    company: string | null;
    country?: string;
    role: string;
    plan: string;
    monthlyGenerationsUsed: number;
    monthlyGenerationsLimit: number;
    activeListings: number;
    maxListings: number;
  };
}

export function AdminLoginForm() {
  const { setUser, setView, addToast } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: AdminLoginFormData) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const msg = errorData?.error || "";
        if (msg.includes("Internal server error") || msg.includes("database")) {
          throw new Error("Database is being set up. Please wait a moment and try again.");
        }
        throw new Error(msg || "Invalid admin credentials. Access denied.");
      }

      const response: SignInResponse = await res.json();

      // Only allow super_admin role to access the admin panel
      if (response.user.role !== "super_admin") {
        addToast({
          title: "Access Denied",
          description: "This portal is reserved for Super Administrators only.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setUser(response.user);
      setView("admin");
      addToast({
        title: "Admin Access Granted",
        description: `Welcome, Super Admin. Full control enabled.`,
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed.";
      addToast({
        title: "Admin Login Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          type="button"
          onClick={() => setView("login")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to User Login
        </button>

        <Card className="w-full border-amber-500/20 bg-gray-900/80 backdrop-blur-xl shadow-2xl shadow-amber-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 mb-3">
              <Shield className="size-7 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Admin Portal
            </CardTitle>
            <CardDescription className="mt-2 text-gray-400">
              Super Administrator access only. Unauthorized access is prohibited.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-gray-300">
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@aarkaprime.com"
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                    disabled={isLoading}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-gray-300">
                  Admin Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter admin password"
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                    disabled={isLoading}
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/20"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="size-4 mr-2" />
                    Access Admin Panel
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-xs text-gray-500">
              Protected admin area. All actions are logged.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
