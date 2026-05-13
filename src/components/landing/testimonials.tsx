'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

interface Testimonial {
  quote: string;
  name: string;
  company: string;
  initials: string;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'EstateIQ cut our content creation time from 3 hours to 30 seconds. Our Facebook engagement increased by 340% in the first month.',
    name: 'James Mwangi',
    company: 'CEO, Mwangi Homes Nairobi',
    initials: 'JM',
    color: 'bg-emerald-600',
  },
  {
    quote:
      'We were paying an agency KES 120,000/month for content that was hit or miss. Now we generate better content ourselves for a fraction of the cost.',
    name: 'Sarah Ochieng',
    company: 'Marketing Director, Parklands Realty',
    initials: 'SO',
    color: 'bg-teal-600',
  },
  {
    quote:
      'The WhatsApp marketing messages alone have brought us 15 new leads this month. This tool pays for itself 10x over.',
    name: 'David Kariuki',
    company: 'Founder, Kariuki & Associates Real Estate',
    initials: 'DK',
    color: 'bg-emerald-700',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
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

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className="size-4 fill-amber-400 text-amber-400"
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32 bg-white dark:bg-gray-950">
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
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Loved by Real Estate Professionals
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-gray-500 dark:text-gray-400">
            See what agents and agencies across Kenya are saying
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <motion.div
          className="mt-16 grid gap-8 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.name} variants={itemVariants}>
              <Card className="group h-full border-gray-200 bg-white transition-all duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-800">
                <CardContent className="pt-6">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="size-8 text-emerald-200 dark:text-emerald-800" />
                  </div>

                  {/* Stars */}
                  <StarRating />

                  {/* Quote */}
                  <blockquote className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${testimonial.color} text-xs font-bold text-white`}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
