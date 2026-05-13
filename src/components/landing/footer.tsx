'use client';

import React from 'react';
import { Building, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Services', href: '#services' },
    { label: 'Testimonials', href: '#testimonials' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
];

export function Footer() {
  const handleLinkClick = (href: string) => {
    if (href.startsWith('#') && href.length > 1) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-950 text-gray-400 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Building className="size-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                EstateIQ
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
              AI-powered marketing platform built specifically for Kenya&apos;s real
              estate professionals. Generate, publish, and convert — all in one
              place.
            </p>

            {/* Social Icons */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <button
                    key={social.label}
                    onClick={() => handleLinkClick(social.href)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 text-gray-500 transition-colors hover:border-emerald-600/50 hover:bg-emerald-600/10 hover:text-emerald-400"
                    aria-label={social.label}
                  >
                    <Icon className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleLinkClick(link.href)}
                      className="text-sm text-gray-500 transition-colors hover:text-emerald-400"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10 bg-gray-800" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-600">
            &copy; 2024 EstateIQ. All rights reserved.
          </p>
          <p className="text-sm text-gray-600">
            Made with ❤️ in Nairobi, Kenya
          </p>
        </div>
      </div>
    </footer>
  );
}
