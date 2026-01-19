"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { PropertyGrid } from "@/components/admin/PropertyGrid";
import { Building2 } from "lucide-react";

export default function PropertiesPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-indigo-600" />
                        Property Overview
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Visual map of the community structure and resident occupancy.
                    </p>
                </div>
            </div>

            <PropertyGrid />
        </div>
    );
}
