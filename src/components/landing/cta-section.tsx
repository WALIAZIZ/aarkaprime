'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';

export function CtaSection() {
  const [email, setEmail] = useState('');
  const setView = useAppStore((s) => s.setView);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setView('register');
    }
  };

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950" />

      {/* Decorative Elements */}
      <motion.div
        className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-200 backdrop-blur-sm">
            <Zap className="size-4" />
            Get Started in Seconds
          </span>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Transform Your Property Marketing?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/80">
            Start free — no credit card required. Join 500+ real estate
            professionals already using EstateIQ.
          </p>
        </motion.div>

        {/* Email Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 w-full max-w-sm border-emerald-400/30 bg-white/10 px-4 text-white placeholder:text-emerald-200/50 backdrop-blur-sm focus-visible:border-emerald-300 focus-visible:ring-emerald-500/30 sm:max-w-xs"
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 gap-2 bg-white px-8 text-base font-semibold text-emerald-700 shadow-lg shadow-black/10 hover:bg-emerald-50"
          >
            Get Started
            <ArrowRight className="size-4" />
          </Button>
        </motion.form>

        {/* Trust Badges */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-emerald-200/60"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-1.5">
            <Shield className="size-4" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
