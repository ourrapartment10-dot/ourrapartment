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
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              <span className="tracking-wide uppercase text-[10px]">Now Live for Beta Testing</span>
            </div>

            <h1 className="mb-8 text-5xl font-[900] tracking-tighter text-slate-900 sm:text-7xl">
              Modern Living, <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Simplified.
              </span>
            </h1>

            <p className="mb-10 text-xl leading-relaxed font-medium text-slate-500">
              The all-in-one platform for residential communities. Streamline
              communication, automate maintenance, and enhance security—all from
              one beautiful dashboard.
            </p>

            <div className="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-base font-bold text-white shadow-lg shadow-slate-200 transition-all hover:-translate-y-1 hover:bg-black hover:shadow-xl sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
              >
                View Features
              </Link>
            </div>

            <div className="flex items-center gap-8 text-sm font-bold text-slate-400">
              <div className="flex items-center gap-2.5">
                <div className="rounded-full bg-green-100 p-1">
                  <CheckCircle className="text-green-600 h-3.5 w-3.5" />
                </div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="rounded-full bg-green-100 p-1">
                  <CheckCircle className="text-green-600 h-3.5 w-3.5" />
                </div>
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
