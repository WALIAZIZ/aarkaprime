'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Share2,
  MessageCircle,
  Mail,
  Megaphone,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    icon: FileText,
    title: 'AI Property Descriptions',
    description:
      'Professional descriptions in 3 lengths — short, medium, and detailed — optimized for every platform and audience.',
  },
  {
    icon: Share2,
    title: 'Social Media Posts',
    description:
      'Facebook, Instagram, Twitter ready content with hashtags, emojis, and platform-specific formatting built in.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Marketing',
    description:
      'Direct message templates for buyers. Personalized outreach that feels authentic and converts leads to viewings.',
  },
  {
    icon: Mail,
    title: 'Email Campaigns',
    description:
      'Full email sequences for your listings. Subject lines, body copy, and CTAs crafted to drive opens and responses.',
  },
  {
    icon: Megaphone,
    title: 'Facebook Ad Copy',
    description:
      'Optimized ad copy that converts. A/B test variations included to maximize your ad spend ROI.',
  },
  {
    icon: Users,
    title: 'Lead Management',
    description:
      'Track every inquiry in one place. Never lose a lead with our centralized dashboard and follow-up tools.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function Features() {
  return (
    <section className="relative py-24 sm:py-32 bg-gray-50 dark:bg-gray-900">
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
            Features
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Everything You Need to Market Properties
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-gray-500 dark:text-gray-400">
            One platform. Every channel. All powered by AI.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="group h-full border-gray-200 bg-white transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-emerald-800">
                  <CardHeader>
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-900/30 dark:text-emerald-400 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
