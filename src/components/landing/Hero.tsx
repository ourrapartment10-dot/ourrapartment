"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
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
                        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Now Live for Beta Testing
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                            Modern Living, <br />
                            <span className="text-primary">Simplified.</span>
                        </h1>

                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            The all-in-one platform for residential communities. Streamline communication,
                            automate maintenance, and enhance security—all from one beautiful dashboard.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-10">
                            <Link
                                href="/register"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-white font-semibold shadow-lg transition-all hover:bg-gray-800 hover:translate-y-[-2px]"
                            >
                                Get Started Free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="#features"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 text-gray-700 font-semibold shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300"
                            >
                                View Features
                            </Link>
                        </div>

                        <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <span>Cancel anytime</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hero Visuals / Mock Dashboard */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative lg:ml-auto"
                    >
                        {/* Main Dashboard Card */}
                        <div className="relative rounded-2xl border border-gray-200 bg-white/50 p-2 shadow-2xl backdrop-blur-xl">
                            <div className="overflow-hidden rounded-xl bg-white border border-gray-100 shadow-inner">
                                {/* Header Mockup */}
                                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-400" />
                                        <div className="h-3 w-3 rounded-full bg-amber-400" />
                                        <div className="h-3 w-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="h-2 w-32 rounded-full bg-gray-200" />
                                </div>

                                {/* Dashboard Content */}
                                <div className="flex">
                                    {/* Sidebar Mockup */}
                                    <div className="w-16 flex-none border-r border-gray-100 bg-gray-50 py-4 hidden sm:flex flex-col items-center gap-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className={`h-8 w-8 rounded-lg ${i === 1 ? 'bg-primary text-white' : 'bg-white border border-gray-200'} flex items-center justify-center`}>
                                                <div className={`h-4 w-4 rounded-sm ${i === 1 ? 'bg-white/90' : 'bg-gray-300'}`} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Main Area */}
                                    <div className="flex-1 p-6">
                                        {/* Stats Row */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="rounded-xl border border-gray-100 bg-orange-50/50 p-4">
                                                <div className="h-8 w-8 rounded-lg bg-orange-100 mb-2" />
                                                <div className="text-xl font-bold text-gray-900">12</div>
                                                <div className="text-xs font-medium text-gray-500">Pending Requests</div>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-blue-50/50 p-4">
                                                <div className="h-8 w-8 rounded-lg bg-blue-100 mb-2" />
                                                <div className="text-xl font-bold text-gray-900">24</div>
                                                <div className="text-xs font-medium text-gray-500">Active Notices</div>
                                            </div>
                                        </div>

                                        {/* Activity List Mockup */}
                                        <div className="space-y-3">
                                            <div className="h-4 w-24 rounded bg-gray-100 mb-2" />
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-100" />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="h-2 w-20 rounded bg-gray-200" />
                                                        <div className="h-2 w-32 rounded bg-gray-100" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Card 1: Maintenance */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="absolute -right-8 top-20 hidden md:block" // Hidden on small screens
                        >
                            <div className="rounded-2xl bg-white p-4 shadow-xl border border-gray-100 w-64 shadow-orange-500/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">New Request</div>
                                        <div className="text-xs text-gray-500">Plumbing Issue • 2m ago</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 rounded-lg bg-gray-50 py-2 text-center text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-100">View</div>
                                    <div className="flex-1 rounded-lg bg-black py-2 text-center text-xs font-medium text-white cursor-pointer hover:bg-gray-800">Assign</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Card 2: Active Residents (Simplified) */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-6 -left-6 rounded-xl border border-gray-200 bg-white p-4 shadow-xl shadow-blue-500/5"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={`h-10 w-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden bg-[url('https://i.pravatar.cc/100?img=${i + 10}')] bg-cover`} />
                                    ))}
                                    <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">
                                        +2k
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-gray-900">Community</p>
                                    <p className="text-xs text-green-500 font-medium">● Online now</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
