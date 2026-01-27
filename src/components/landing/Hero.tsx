'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import InteractiveHeroDisplay from './InteractiveHeroDisplay';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background Gradients */}
      <div className="bg-primary/10 absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Now Live for Beta Testing
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Modern Living, <br />
              <span className="text-primary">Simplified.</span>
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-gray-600">
              The all-in-one platform for residential communities. Streamline
              communication, automate maintenance, and enhance security—all from
              one beautiful dashboard.
            </p>

            <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:translate-y-[-2px] hover:bg-gray-800 sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
              >
                View Features
              </Link>
            </div>

            <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-primary h-4 w-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-primary h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Visuals / Mock Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative w-full lg:ml-auto"
          >
            <InteractiveHeroDisplay />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
