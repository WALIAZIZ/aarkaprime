'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/store/app-store';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonLabel: string;
  popular?: boolean;
  buttonVariant?: 'default' | 'outline';
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '10 generations / month',
      '3 active listings',
      'Basic property descriptions',
      'Social media posts',
    ],
    buttonLabel: 'Get Started',
    buttonVariant: 'outline',
  },
  {
    name: 'Starter',
    price: '$99',
    period: '/month',
    description: 'For growing agencies',
    features: [
      '50 generations / month',
      '10 active listings',
      'Lead capture forms',
      'Email support',
      'All content types',
    ],
    buttonLabel: 'Start Starter',
    buttonVariant: 'outline',
  },
  {
    name: 'Professional',
    price: '$299',
    period: '/month',
    description: 'For serious marketers',
    features: [
      '200 generations / month',
      '50 active listings',
      'Lead dashboard',
      'Email campaigns',
      'Facebook ad copy',
      'WhatsApp marketing',
      'Swahili mode',
      'Priority support',
    ],
    buttonLabel: 'Start Professional',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$499',
    period: '/month',
    description: 'For large organizations',
    features: [
      'Unlimited generations',
      'Unlimited listings',
      'All features included',
      'WhatsApp chatbot',
      'Analytics dashboard',
      'White-label option',
      'Dedicated support',
      'Custom integrations',
    ],
    buttonLabel: 'Contact Us',
    buttonVariant: 'outline',
  },
];

const comparisonFeatures = [
  { name: 'AI Property Descriptions', free: true, starter: true, professional: true, enterprise: true },
  { name: 'Social Media Posts', free: true, starter: true, professional: true, enterprise: true },
  { name: 'WhatsApp Marketing', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Email Campaigns', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Facebook Ad Copy', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Lead Management', free: false, starter: true, professional: true, enterprise: true },
  { name: 'Swahili Mode', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Analytics Dashboard', free: false, starter: false, professional: false, enterprise: true },
  { name: 'WhatsApp Chatbot', free: false, starter: false, professional: false, enterprise: true },
  { name: 'White-Label', free: false, starter: false, professional: false, enterprise: true },
  { name: 'Dedicated Support', free: false, starter: false, professional: false, enterprise: true },
  { name: 'API Access', free: false, starter: false, professional: false, enterprise: true },
];

const CheckIcon = () => <Check className="mx-auto size-4 text-emerald-600" />;
const CrossIcon = () => <X className="mx-auto size-4 text-gray-300 dark:text-gray-600" />;

export function PricingSection() {
  const setView = useAppStore((s) => s.setView);

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-white dark:bg-gray-950">
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
            Pricing
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-gray-500 dark:text-gray-400">
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                'flex flex-col',
                tier.popular && 'lg:-translate-y-2'
              )}
            >
              <Card
                className={cn(
                  'relative flex h-full flex-col border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900',
                  tier.popular && 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 dark:border-emerald-500'
                )}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1 bg-emerald-600 px-3 py-1 text-white shadow-md">
                      <Sparkles className="size-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {tier.name}
                  </CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      {tier.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {tier.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pt-0">
                  <ul className="space-y-2.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    className={cn(
                      'w-full',
                      tier.popular
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
                        : 'border-gray-300 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-emerald-950/50'
                    )}
                    variant={tier.popular ? 'default' : 'outline'}
                    onClick={() => setView('register')}
                  >
                    {tier.buttonLabel}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          className="mt-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            Feature Comparison
          </h3>
          <div className="mt-10 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-800">
                  <TableHead className="w-[40%] text-gray-700 dark:text-gray-300">
                    Feature
                  </TableHead>
                  <TableHead className="text-center text-gray-700 dark:text-gray-300">
                    Free
                  </TableHead>
                  <TableHead className="text-center text-gray-700 dark:text-gray-300">
                    Starter
                  </TableHead>
                  <TableHead className="text-center font-semibold text-emerald-700 dark:text-emerald-400">
                    Professional
                  </TableHead>
                  <TableHead className="text-center text-gray-700 dark:text-gray-300">
                    Enterprise
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonFeatures.map((feature) => (
                  <TableRow
                    key={feature.name}
                    className="border-gray-100 dark:border-gray-800/50"
                  >
                    <TableCell className="font-medium text-gray-700 dark:text-gray-300">
                      {feature.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {feature.free ? <CheckIcon /> : <CrossIcon />}
                    </TableCell>
                    <TableCell className="text-center">
                      {feature.starter ? <CheckIcon /> : <CrossIcon />}
                    </TableCell>
                    <TableCell className="text-center">
                      {feature.professional ? <CheckIcon /> : <CrossIcon />}
                    </TableCell>
                    <TableCell className="text-center">
                      {feature.enterprise ? <CheckIcon /> : <CrossIcon />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
