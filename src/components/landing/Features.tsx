"use client";

import { motion, Variants } from 'framer-motion';
import {
    Home,
    Megaphone,
    Users,
    ShieldCheck,
    LayoutDashboard,
    Bell
} from 'lucide-react';

const features = [
    {
        icon: <Home className="h-6 w-6" />,
        title: "Smart Maintenance",
        description: "Report and track maintenance requests with priority levels, status updates, and photo attachments."
    },
    {
        icon: <Megaphone className="h-6 w-6" />,
        title: "Announcements",
        description: "Stay informed with important community updates, events, and notices directly from management."
    },
    {
        icon: <Users className="h-6 w-6" />,
        title: "Visitor Management",
        description: "Secure visitor registration and tracking system for enhanced community security and peace of mind."
    },
    {
        icon: <ShieldCheck className="h-6 w-6" />,
        title: "Role-Based Access",
        description: "Granular access controls for residents, security guards, and administrators."
    },
    {
        icon: <LayoutDashboard className="h-6 w-6" />,
        title: "Real-Time Dashboard",
        description: "Comprehensive overview of community activities, statistics, and important metrics at a glance."
    },
    {
        icon: <Bell className="h-6 w-6" />,
        title: "Instant Notifications",
        description: "Get notified immediately about maintenance updates, announcements, and visitor arrivals."
    }
];

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
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
                        <span className="text-primary">Modern Communities</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mx-auto max-w-2xl text-xl text-gray-600"
                    >
                        Everything you need to manage your community efficiently and securely.
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                            className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:border-gray-200 hover:shadow-2xl hover:shadow-gray-200/50"
                        >
                            <div className="mb-6 inline-flex rounded-2xl bg-primary/10 p-4 text-primary ring-1 ring-primary/20 transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                                {feature.icon}
                            </div>

                            <h3 className="mb-3 text-2xl font-bold text-gray-900">
                                {feature.title}
                            </h3>

                            <p className="text-gray-600 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
