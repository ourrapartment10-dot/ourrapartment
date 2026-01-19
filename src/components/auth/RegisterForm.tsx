"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "@/lib/validations/auth";
import { Input } from "@/components/shared/Input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { motion } from "framer-motion";
import { Mail, User, Phone, Lock, Loader2, ArrowRight, Building, Layers, Home, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useApartmentConfig } from "@/hooks/useApartmentConfig";

export function RegisterForm() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { login } = useAuth();
    const { config, loading: configLoading, getBlockOptions, getFloorOptions } = useApartmentConfig();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupInput) => {
        setError(null);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "Signup failed");
            }

            login(json.user);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8"
        >
            <div className="space-y-3 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 font-outfit">Join the community</h1>
                <p className="text-gray-500 text-sm">Experience the next generation of apartment living.</p>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-emerald-500/5 border border-white/20">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 text-sm text-red-600 bg-red-50/50 backdrop-blur-sm rounded-2xl border border-red-100 flex items-center gap-2"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            id="name"
                            label="Full Name"
                            placeholder="John Doe"
                            icon={User}
                            error={errors.name?.message}
                            {...register("name")}
                        />
                        <Input
                            id="phone"
                            label="Phone Number"
                            placeholder="98765 43210"
                            icon={Phone}
                            error={errors.phone?.message}
                            {...register("phone")}
                        />
                    </div>


                    <div className="grid grid-cols-3 gap-4">
                        {/* Block Input */}
                        {config && config.numberOfBlocks > 0 ? (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 ml-1">Block</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-10 pl-9 pr-8 bg-white/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all outline-none"
                                        {...register("block")}
                                    >
                                        <option value="">Select</option>
                                        {getBlockOptions().map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-gray-400 pointer-events-none" />
                                </div>
                                {errors.block && <p className="text-xs text-red-500 ml-1">{errors.block.message}</p>}
                            </div>
                        ) : (
                            <Input
                                id="block"
                                label="Block"
                                placeholder="A"
                                icon={Building}
                                error={errors.block?.message}
                                {...register("block")}
                            />
                        )}

                        {/* Floor Input */}
                        {config && config.numberOfFloors > 0 ? (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 ml-1">Floor</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-10 pl-9 pr-8 bg-white/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all outline-none"
                                        {...register("floor")}
                                    >
                                        <option value="">Select</option>
                                        {getFloorOptions().map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <Layers className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-gray-400 pointer-events-none" />
                                </div>
                                {errors.floor && <p className="text-xs text-red-500 ml-1">{errors.floor.message}</p>}
                            </div>
                        ) : (
                            <Input
                                id="floor"
                                label="Floor"
                                placeholder="1"
                                icon={Layers}
                                error={errors.floor?.message}
                                {...register("floor")}
                            />
                        )}
                        <Input
                            id="flatNumber"
                            label="Flat No"
                            placeholder="101"
                            icon={Home}
                            error={errors.flatNumber?.message}
                            {...register("flatNumber", {
                                onChange: (e) => {
                                    e.target.value = e.target.value.toUpperCase();
                                }
                            })}
                        />
                    </div>

                    <Input
                        id="email"
                        type="email"
                        label="Email Address"
                        placeholder="name@example.com"
                        icon={Mail}
                        error={errors.email?.message}
                        {...register("email")}
                    />

                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        icon={Lock}
                        error={errors.password?.message}
                        {...register("password")}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative w-full h-12 bg-primary text-white hover:bg-emerald-600 rounded-xl font-bold transition-all duration-300 flex items-center justify-center overflow-hidden active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-lg shadow-emerald-500/25 mt-2"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center gap-2">
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create My Account
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                </form>

                <div className="my-8 flex items-center gap-4">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap px-2">Social Sign Up</span>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>

                <a
                    href="/api/auth/google"
                    className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-100 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </a>
            </div>

            <p className="text-center text-sm font-medium text-gray-500">
                Already part of a community?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                    Login here
                </Link>
            </p>
        </motion.div>
    );
}
