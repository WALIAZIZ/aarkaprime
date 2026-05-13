import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EstateIQ — AI Real Estate Marketing",
  description:
    "AI-powered marketing platform for Kenyan real estate. Generate professional property descriptions, social media posts, email campaigns, and ad copy in seconds.",
  keywords: [
    "EstateIQ",
    "AI marketing",
    "real estate",
    "Kenya",
    "Nairobi",
    "property marketing",
    "AI content generation",
    "SaaS",
  ],
  authors: [{ name: "EstateIQ" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "EstateIQ — AI-Powered Real Estate Marketing",
    description:
      "Generate professional property descriptions, social media posts, and marketing campaigns in seconds. Built for Kenya's real estate market.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
