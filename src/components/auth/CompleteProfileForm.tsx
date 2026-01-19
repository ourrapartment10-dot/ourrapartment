"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { completeProfileSchema, CompleteProfileInput } from "@/lib/validations/auth";
import { Input } from "@/components/shared/Input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { Phone, Loader2, User, ArrowRight, Building, Layers, Home, ChevronDown } from "lucide-react";
import { useApartmentConfig } from "@/hooks/useApartmentConfig";

import { motion } from "framer-motion";

export function CompleteProfileForm() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { updateUser } = useAuth();
    const { config, loading: configLoading, getBlockOptions, getFloorOptions } = useApartmentConfig();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CompleteProfileInput>({
        resolver: zodResolver(completeProfileSchema),
    });

    const onSubmit = async (data: CompleteProfileInput) => {
        setError(null);
        try {
            // Create new API endpoint for updating profile
            const res = await fetch("/api/auth/complete-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "Update failed");
            }

            if (json.user) {
                updateUser(json.user);
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-8"
        >
            <div className="space-y-3 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-2">
                    <User className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-outfit">Complete Your Profile</h1>
                <p className="text-gray-500 text-sm">Just a few more details to get you started.</p>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-emerald-500/5 border border-white/20">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {error && (
                        <div className="p-4 text-sm text-red-600 bg-red-50/50 backdrop-blur-sm rounded-2xl border border-red-100 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                            {error}
                        </div>
                    )}

                    <Input
                        id="phone"
                        label="Phone Number"
                        placeholder="98765 43210"
                        icon={Phone}
                        error={errors.phone?.message}
                        {...register("phone")}
                    />


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

                    <p className="text-xs text-gray-400 text-center px-4">
                        We need your phone number for secure community access and emergency notifications.
                    </p>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative w-full h-12 bg-primary text-white hover:bg-emerald-600 rounded-xl font-bold transition-all duration-300 flex items-center justify-center overflow-hidden active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-emerald-500/25"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center gap-2">
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Finish Setup
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
