'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Sparkles, TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const steps = [
  {
    step: 1,
    icon: PlusCircle,
    title: 'Add Your Property',
    description:
      'Enter your property details once and let our AI handle the rest. Just fill in the basics — location, size, features, price — and we do the heavy lifting.',
  },
  {
    step: 2,
    icon: Sparkles,
    title: 'AI Generates Marketing',
    description:
      'Get professional descriptions, social posts, emails and ads in seconds. Choose your tone, language, and platform — our AI creates tailored content.',
  },
  {
    step: 3,
    icon: TrendingUp,
    title: 'Post & Sell Faster',
    description:
      'Copy-paste content to any platform and watch engagement soar. From Facebook to WhatsApp, your marketing is ready to go.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32 bg-white dark:bg-gray-950"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Three Simple Steps
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-gray-500 dark:text-gray-400">
            From listing to marketing in under a minute
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          className="mt-16 grid gap-8 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.step} variants={itemVariants}>
                <Card className="group relative h-full border-gray-200 bg-white transition-all hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-800">
                  <CardHeader className="pb-0">
                    {/* Step Number Badge */}
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                        <Icon className="size-6" />
                      </div>
                      <span className="text-5xl font-black text-gray-100 dark:text-gray-800">
                        {item.step}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Connecting Line (Desktop) */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          {/* Visible through the gap between cards on large screens */}
        </div>
      </div>
    </section>
  );
}
