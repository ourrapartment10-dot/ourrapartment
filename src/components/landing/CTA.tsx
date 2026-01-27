'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#211832] py-32 text-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-4xl font-[900] tracking-tighter md:text-6xl"
        >
          Ready to Transform <br />
          <span className="text-indigo-400">Your Community?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mx-auto mb-12 max-w-2xl text-xl font-medium text-indigo-100/80"
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
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-10 py-5 text-lg font-bold text-[#211832] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/20"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-900/20 px-10 py-5 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-900/40"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
