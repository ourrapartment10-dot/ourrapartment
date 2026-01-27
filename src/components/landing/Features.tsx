'use client';

import { motion, Variants } from 'framer-motion';
import {
  Wallet,
  Sparkles,
  MessageSquare,
  Shield,
  BarChart3,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

const features = [
  {
    icon: <Wallet className="h-6 w-6" />,
    title: 'Financial Management',
    description:
      'Track dues, manage payments, and view detailed financial reports with our comprehensive payment system.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverBg: 'group-hover:bg-blue-600',
    ring: 'ring-blue-100',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Community Facilities',
    description:
      'Book amenities effortlessly. Explore available spaces, manage reservations, and enjoy premium community living.',
    color: 'text-[#50717B]',
    bgColor: 'bg-[#50717B]/10',
    hoverBg: 'group-hover:bg-[#50717B]',
    ring: 'ring-[#50717B]/20',
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: 'Connect Space',
    description:
      'Engage with your neighbors in the Community Hub. Discuss, share, and stay connected with everyone.',
    color: 'text-[#6E5034]',
    bgColor: 'bg-[#6E5034]/10',
    hoverBg: 'group-hover:bg-[#6E5034]',
    ring: 'ring-[#6E5034]/20',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure Admin Controls',
    description:
      'Advanced role-based access for Admins and Super Admins. Manage subscriptions, users, and global settings securely.',
    color: 'text-[#211832]',
    bgColor: 'bg-[#211832]/10',
    hoverBg: 'group-hover:bg-[#211832]',
    ring: 'ring-[#211832]/20',
  },
  {
    icon: <Wrench className="h-6 w-6" />,
    title: 'Smart Complaints',
    description:
      'Raise, track, and resolve maintenance issues efficiently with our dedicated complaint management system.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverBg: 'group-hover:bg-orange-600',
    ring: 'ring-orange-100',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Insightful Analytics',
    description:
      'Gain valuable insights into occupancy rates, financial health, and community engagement with real-time charts.',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    hoverBg: 'group-hover:bg-violet-600',
    ring: 'ring-violet-100',
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } },
};

export default function Features() {
  return (
    <section id="features" className="relative bg-gray-50/50 py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl"
          >
            Powerful Features for <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Modern Communities
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-2xl text-xl text-gray-600"
          >
            Everything you need to manage your community efficiently and
            securely, all in one place.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-10 transition-all duration-300 hover:border-gray-200 hover:shadow-2xl hover:shadow-gray-200/50"
            >
              <div
                className={cn(
                  'mb-6 inline-flex rounded-2xl p-4 ring-1 transition-colors duration-300 group-hover:text-white',
                  feature.color,
                  feature.bgColor,
                  feature.ring,
                  feature.hoverBg
                )}
              >
                {feature.icon}
              </div>

              <h3 className="mb-3 text-2xl font-black tracking-tight text-gray-900">
                {feature.title}
              </h3>

              <p className="leading-relaxed font-medium text-gray-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
