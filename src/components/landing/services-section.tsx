'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Crown, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ServiceTier {
  name: string;
  price: string;
  period: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  features: string[];
  highlighted?: boolean;
}

const services: ServiceTier[] = [
  {
    name: 'Bronze',
    price: '$500',
    period: '/month',
    icon: Award,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    features: [
      'Up to 10 properties',
      'Social media management',
      'Monthly reporting',
    ],
  },
  {
    name: 'Silver',
    price: '$1,500',
    period: '/month',
    icon: Crown,
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-600 dark:text-gray-300',
    features: [
      'Up to 25 properties',
      'Full social media + email campaigns',
      'Weekly reporting',
      'Ad management',
    ],
    highlighted: true,
  },
  {
    name: 'Gold',
    price: '$3,000',
    period: '/month',
    icon: Gem,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    features: [
      'Unlimited properties',
      'Full-service marketing',
      'Dedicated account manager',
      'Daily monitoring',
      'Custom strategy',
    ],
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

export function ServicesSection() {
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
            Done-For-You Services
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Don&apos;t Want to Do It Yourself?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-gray-500 dark:text-gray-400">
            Let our team of experts handle your real estate marketing end-to-end
          </p>
        </motion.div>

        {/* Service Tiers */}
        <motion.div
          className="mt-16 grid gap-8 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.name}
                variants={itemVariants}
                className={cn(
                  'flex flex-col',
                  service.highlighted && 'md:-translate-y-3'
                )}
              >
                <Card
                  className={cn(
                    'flex h-full flex-col transition-all duration-300',
                    service.highlighted
                      ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 dark:border-emerald-500'
                      : 'border-gray-200 dark:border-gray-800'
                  )}
                >
                  <CardHeader className="text-center">
                    {service.highlighted && (
                      <div className="mb-2 flex justify-center">
                        <Badge className="bg-emerald-600 text-white px-3 py-0.5">
                          Recommended
                        </Badge>
                      </div>
                    )}
                    <div
                      className={cn(
                        'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl',
                        service.iconBg
                      )}
                    >
                      <Icon className={cn('size-7', service.iconColor)} />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      {service.name}
                    </CardTitle>
                    <div className="mt-2 flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {service.price}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {service.period}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300"
                        >
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className={cn(
                        'w-full',
                        service.highlighted
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
                          : 'border-gray-300 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-emerald-950/50'
                      )}
                      variant={service.highlighted ? 'default' : 'outline'}
                    >
                      Contact Us
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
