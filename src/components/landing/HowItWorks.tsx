'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    step: '01',
    title: 'Register Account',
    description:
      'Sign up with your community details. Admins verify your identity for security.',
  },
  {
    step: '02',
    title: 'Access Dashboard',
    description:
      'Login to your personal dashboard to view all relevant community information.',
  },
  {
    step: '03',
    title: 'Submit Requests',
    description:
      'Report maintenance issues, register visitors, or book amenities instantly.',
  },
  {
    step: '04',
    title: 'Track Progress',
    description:
      'Monitor the status of your requests with real-time updates and notifications.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-24 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 text-4xl font-[900] tracking-tighter text-slate-900 md:text-5xl"
          >
            How It Works
          </motion.h2>
          <p className="mx-auto max-w-2xl text-xl font-medium text-slate-500">
            Get started in just a few simple steps.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative flex flex-col items-center p-8 text-center rounded-[2.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 text-2xl font-black text-slate-900 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                {item.step}
              </div>

              <h3 className="mb-3 text-xl font-black text-slate-900">
                {item.title}
              </h3>

              <p className="leading-relaxed font-medium text-slate-500 text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
