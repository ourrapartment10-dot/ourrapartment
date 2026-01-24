'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { PropertyGrid } from '@/components/admin/PropertyGrid';
import { Building2 } from 'lucide-react';

import { motion } from 'framer-motion';

export default function PropertiesPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-12 pb-10">
      <div className="relative px-2 pt-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex w-fit items-center gap-3 rounded-2xl bg-[#FB0091]/10 px-4 py-2 text-[#FB0091]"
            >
              <Building2 className="h-4 w-4" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                Estate Management
              </span>
            </motion.div>

            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl leading-[0.9] font-[900] tracking-tighter text-slate-900 lg:text-7xl"
              >
                Property <br />
                <span className="bg-gradient-to-r from-[#FB0091] to-[#D5007A] bg-clip-text text-transparent">
                  Overview.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-lg text-lg leading-relaxed font-medium text-slate-500 lg:text-xl"
              >
                Visual map of the community structure, unit status, and resident occupancy.
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      <PropertyGrid />
    </div>
  );
}
