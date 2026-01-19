'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-gray-900 py-32 text-white">
      {/* Background Glow */}
      <div className="bg-primary/20 absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-4xl font-bold tracking-tight md:text-6xl"
        >
          Ready to Transform <br />
          <span className="text-primary">Your Community?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mx-auto mb-12 max-w-2xl text-xl font-medium text-gray-300"
        >
          Join hundreds of communities already using Ourr Apartment to
          streamline their management processes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-10 py-5 text-lg font-bold text-gray-900 transition-all duration-300 hover:-translate-y-1 hover:bg-gray-100 hover:shadow-2xl hover:shadow-white/10"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-gray-700 bg-gray-800/50 px-10 py-5 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-600 hover:bg-gray-800"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
