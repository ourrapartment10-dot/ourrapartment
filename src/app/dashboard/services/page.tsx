"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServiceCard } from "@/components/services/ServiceCard";
import { AddServiceModal } from "@/components/services/AddServiceModal";
import { ServiceRatingModal } from "@/components/services/ServiceRatingModal";
import { CategoryFilter } from "@/components/services/CategoryFilter";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { toast } from "react-hot-toast";
import { useAuth } from "@/components/auth/AuthContext";

interface ServiceProvider {
    id: string;
    name: string;
    category: string;
    phone: string;
    description: string | null;
    price: string | null;
    averageRating: number;
    reviewCount: number;
    addedById: string;
}

export default function ServicesPage() {
    const [services, setServices] = useState<ServiceProvider[]>([]);
    const [filteredServices, setFilteredServices] = useState<ServiceProvider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [ratingModalService, setRatingModalService] = useState<ServiceProvider | null>(null);
    const [editingService, setEditingService] = useState<ServiceProvider | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { user } = useAuth(); // Assuming this gives user info

    const fetchServices = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/services");
            if (!res.ok) throw new Error("Failed to fetch services");
            const data = await res.json();
            setServices(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load services");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        let result = services;

        if (selectedCategory !== "All") {
            result = result.filter(s => s.category === selectedCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.category.toLowerCase().includes(query) ||
                (s.description && s.description.toLowerCase().includes(query))
            );
        }

        setFilteredServices(result);
    }, [services, selectedCategory, searchQuery]);

    const categories = Array.from(new Set(services.map(s => s.category))).sort();

    const handleDelete = (id: string) => {
        setDeletingId(id);
    };

    const performDelete = async () => {
        if (!deletingId) return;

        try {
            const res = await fetch(`/api/services/${deletingId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Service deleted");
            fetchServices();
        } catch {
            toast.error("Failed to delete service");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-[1600px] space-y-8 pb-20">
            {/* Dynamic Background Elements */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-emerald-50/60 blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] h-[70%] w-[70%] rounded-full bg-blue-100/40 blur-[150px]" />
            </div>

            {/* Premium Header */}
            <div className="relative space-y-8 px-2 pt-8">
                <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                    <div className="max-w-2xl space-y-6">
                        <div className="flex w-fit items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-2 text-emerald-700">
                            <Briefcase className="h-4 w-4" />
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                                Community Services
                            </span>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-5xl leading-[0.9] font-[900] tracking-tighter text-slate-900 lg:text-7xl">
                                Trusted <br />
                                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Providers.
                                </span>
                            </h1>
                            <p className="max-w-lg text-lg leading-relaxed font-medium text-slate-500 lg:text-xl">
                                Find reliable help for your daily needs, recommended by your neighbors.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-slate-900 px-10 py-5 text-sm font-black text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] transition-all hover:-translate-y-1 hover:bg-black active:scale-[0.98] sm:w-auto"
                        >
                            <Plus className="h-5 w-5" />
                            Add Provider
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="px-2">
                <div className="rounded-[2.5rem] border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-md">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                            <CategoryFilter
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onSelect={setSelectedCategory}
                            />
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search services..."
                                className="pl-10 h-12 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all text-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="px-2">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 rounded-3xl bg-white/40 animate-pulse border border-white/50" />
                        ))}
                    </div>
                ) : filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                currentUserId={user?.id}
                                userRole={user?.role}
                                onRate={(s) => setRatingModalService({
                                    ...s,
                                    averageRating: s.averageRating || 0,
                                    reviewCount: s.reviewCount || 0,
                                    price: s.price || null
                                })}
                                onDelete={handleDelete}
                                onEdit={(s) => {
                                    setEditingService({
                                        ...s,
                                        averageRating: s.averageRating || 0,
                                        reviewCount: s.reviewCount || 0,
                                        price: s.price || null
                                    });
                                    setIsAddModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-[2.5rem] border border-dashed border-slate-200 bg-white/30">
                        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                            <Briefcase className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-900">No providers found</p>
                            <p className="text-slate-500 max-w-xs mx-auto mt-1">
                                {searchQuery || selectedCategory !== "All"
                                    ? "Try adjusting your filters or search terms."
                                    : "Be the first to add a service provider to your community!"}
                            </p>
                        </div>
                        {searchQuery || selectedCategory !== "All" ? (
                            <Button variant="link" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
                                Clear filters
                            </Button>
                        ) : (
                            <Button variant="link" onClick={() => setIsAddModalOpen(true)}>
                                Add your trusted provider
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <AddServiceModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingService(null);
                }}
                onSuccess={fetchServices}
                initialData={editingService}
            />

            <ServiceRatingModal
                isOpen={!!ratingModalService}
                onClose={() => setRatingModalService(null)}
                service={ratingModalService}
                onSuccess={fetchServices}
            />

            <ConfirmDialog
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={performDelete}
                title="Delete Service Provider"
                message="Are you sure you want to delete this service provider? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
