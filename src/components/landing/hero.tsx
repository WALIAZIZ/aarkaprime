'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';

export function Hero() {
  const setView = useAppStore((s) => s.setView);

  const handleScrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-900 to-gray-950" />

      {/* Animated Floating Decorative Elements */}
      <motion.div
        className="absolute top-20 left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-emerald-400/8 blur-3xl"
        animate={{
          x: [0, -25, 15, 0],
          y: [0, 25, -15, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/5 blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating small decorative circles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-emerald-400/30"
          style={{
            top: `${15 + i * 15}%`,
            left: `${10 + i * 16}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300 backdrop-blur-sm">
            <Sparkles className="size-4" />
            AI-Powered Real Estate Marketing
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          AI-Powered Marketing for{' '}
          <span className="bg-gradient-to-r from-emerald-300 to-emerald-100 bg-clip-text text-transparent">
            Kenya&apos;s Real Estate
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg text-emerald-100/80 sm:text-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Generate professional property descriptions, social media posts, and
          marketing campaigns in seconds
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <Button
            size="lg"
            onClick={() => setView('register')}
            className="h-12 gap-2 bg-emerald-500 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400"
          >
            Start Free Trial
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleScrollToHowItWorks}
            className="h-12 gap-2 border-emerald-400/30 bg-transparent px-8 text-base font-semibold text-emerald-200 hover:bg-emerald-500/10 hover:text-white"
          >
            See How It Works
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-emerald-300/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['JM', 'SO', 'DK'].map((initials) => (
                <div
                  key={initials}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-800 bg-emerald-700 text-[10px] font-bold text-emerald-200"
                >
                  {initials}
                </div>
              ))}
            </div>
            <span>500+ agents using EstateIQ</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-emerald-700" />
          <span>✦ 340% avg. engagement increase</span>
          <div className="hidden sm:block h-4 w-px bg-emerald-700" />
          <span>⏱ 30 seconds per listing</span>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-gray-950" />
    </section>
  );
}
