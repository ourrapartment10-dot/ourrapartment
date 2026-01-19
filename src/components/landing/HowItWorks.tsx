"use client";

import { motion } from 'framer-motion';

const steps = [
    {
        step: "01",
        title: "Register Account",
        description: "Sign up with your community details. Admins verify your identity for security."
    },
    {
        step: "02",
        title: "Access Dashboard",
        description: "Login to your personal dashboard to view all relevant community information."
    },
    {
        step: "03",
        title: "Submit Requests",
        description: "Report maintenance issues, register visitors, or book amenities instantly."
    },
    {
        step: "04",
        title: "Track Progress",
        description: "Monitor the status of your requests with real-time updates and notifications."
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-32 bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mb-24 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl"
                    >
                        How It Works
                    </motion.h2>
                    <p className="mx-auto max-w-2xl text-xl text-gray-600">
                        Get started in just a few simple steps.
                    </p>
                </div>

                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="group relative text-center"
                        >
                            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary md:bg-gray-50 md:text-gray-300 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-2xl">
                                {item.step}
                            </div>

                            <h3 className="mb-4 text-xl font-bold text-gray-900">
                                {item.title}
                            </h3>

                            <p className="text-gray-600 leading-relaxed font-medium">
                                {item.description}
                            </p>

                            {/* Connector Line (Desktop Only) */}
                            {index < steps.length - 1 && (
                                <div className="absolute top-12 left-1/2 -z-10 hidden h-0.5 w-full -translate-y-1/2 translate-x-1/2 bg-gradient-to-r from-gray-100 to-gray-200 lg:block" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
