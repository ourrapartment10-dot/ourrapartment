"use client";

import { useState, useEffect } from "react";
import { Building, Layers, Home, Save, Loader2, Info } from "lucide-react";
import { motion } from "framer-motion";

export function ApartmentConfigForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [config, setConfig] = useState({
        maxProperties: 0,
        numberOfBlocks: 0,
        numberOfFloors: 0,
        unitsPerFloor: 0,
        blockNamingConvention: "NUMERIC",
        blockInput: "0" // For local display/logic
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/admin/config");
            const data = await res.json();
            if (data) {
                const isAlpha = data.blockNamingConvention === "ALPHABET";
                let derivedBlockInput = data.numberOfBlocks.toString();
                if (isAlpha && data.numberOfBlocks > 0) {
                    // Convert count to letter (1=A, 2=B)
                    derivedBlockInput = String.fromCharCode(64 + data.numberOfBlocks);
                }

                setConfig({
                    maxProperties: data.maxProperties || 0,
                    numberOfBlocks: data.numberOfBlocks || 0,
                    numberOfFloors: data.numberOfFloors || 0,
                    unitsPerFloor: data.unitsPerFloor || 0,
                    blockNamingConvention: data.blockNamingConvention || "NUMERIC",
                    blockInput: derivedBlockInput
                });
            }
        } catch (err) {
            console.error("Failed to fetch config:", err);
            setError("Failed to load configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save configuration");
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Building className="h-5 w-5 text-gray-500" />
                        Community Configuration
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Global limits and structure setup for the community.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Max Residents/Properties
                        </label>
                        <input
                            type="number"
                            value={config.maxProperties}
                            onChange={(e) => setConfig({ ...config, maxProperties: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 font-medium"
                            placeholder="e.g. 50"
                        />
                        <p className="text-[10px] text-gray-400">Total number of units allowed in this community.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Blocks / Last Block
                        </label>
                        <input
                            type="text"
                            value={config.blockInput}
                            onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                let convention = "NUMERIC";
                                let count = 0;

                                if (/^\d+$/.test(val)) {
                                    count = parseInt(val);
                                    convention = "NUMERIC";
                                } else if (/^[A-Z]$/.test(val)) {
                                    count = val.charCodeAt(0) - 64;
                                    convention = "ALPHABET";
                                }

                                setConfig({
                                    ...config,
                                    blockInput: val,
                                    numberOfBlocks: count,
                                    blockNamingConvention: convention
                                });
                            }}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 font-medium"
                            placeholder="e.g. 5 or E"
                        />
                        <p className="text-[10px] text-gray-400">Enter Number (e.g. 5) or Letter (e.g. E = 5 blocks).</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            Floors per Block
                        </label>
                        <input
                            type="number"
                            value={config.numberOfFloors}
                            onChange={(e) => setConfig({ ...config, numberOfFloors: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 font-medium"
                            placeholder="e.g. 5"
                        />
                        <p className="text-[10px] text-gray-400">Average number of floors in each block.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Units per Floor
                        </label>
                        <input
                            type="number"
                            value={config.unitsPerFloor}
                            onChange={(e) => setConfig({ ...config, unitsPerFloor: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 font-medium"
                            placeholder="e.g. 4"
                        />
                        <p className="text-[10px] text-gray-400">Number of flats on each floor.</p>
                    </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
                    <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-800">
                        These settings define the structure of your visual property dashboard. Setting a limit of <strong>{config.maxProperties || '0'}</strong> properties will prevent registration once reached.
                    </p>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-70 shadow-lg shadow-emerald-500/20"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : success ? (
                        "Saved Successfully!"
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Configuration
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
}
