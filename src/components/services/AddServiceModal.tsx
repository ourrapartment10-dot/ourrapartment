"use client";


import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface AddServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: {
        id: string;
        name: string;
        category: string;
        phone: string;
        description: string | null;
        price: string | null;
    } | null;
}

const COMMON_CATEGORIES = [
    "Maid",
    "Plumber",
    "Electrician",
    "Carpenter",
    "Painter",
    "Internet Provider",
    "Cable TV",
    "Water Delivery",
    "Gas Delivery",
    "Gardener",
];

export function AddServiceModal({ isOpen, onClose, onSuccess, initialData }: AddServiceModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        customCategory: "",
        phone: "",
        description: "",
        price: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize/Reset form keying off isOpen and initialData
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const isCommon = COMMON_CATEGORIES.includes(initialData.category);
                setFormData({
                    name: initialData.name,
                    category: isCommon ? initialData.category : "Other",
                    customCategory: isCommon ? "" : initialData.category,
                    phone: initialData.phone,
                    description: initialData.description || "",
                    price: initialData.price || "",
                });
            } else {
                // Reset form for "add" mode when modal opens without initialData
                setFormData({
                    name: "",
                    category: "",
                    customCategory: "",
                    phone: "",
                    description: "",
                    price: "",
                });
            }
        }
    }, [isOpen, initialData]);


    // If custom category logic is needed, we track it
    const isCustomCategory = formData.category === "Other";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (value: string) => {
        setFormData((prev) => ({ ...prev, category: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const categoryToSubmit = isCustomCategory ? formData.customCategory : formData.category;

            if (!categoryToSubmit) {
                toast.error("Please select or enter a category");
                setIsSubmitting(false);
                return;
            }

            const url = initialData ? `/api/services/${initialData.id}` : "/api/services";
            const method = initialData ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    category: categoryToSubmit,
                    phone: formData.phone,
                    description: formData.description,
                    price: formData.price,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${initialData ? 'update' : 'add'} service`);
            }

            toast.success(`Service provider ${initialData ? 'updated' : 'added'} successfully`);
            onSuccess();
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to ${initialData ? 'update' : 'add'} service`;
            toast.error(errorMessage);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] w-[95vw] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl max-h-[90vh] flex flex-col">
                <DialogTitle className="sr-only">
                    {initialData ? "Edit Service Provider" : "Add Service Provider"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    {initialData ? "Update the details of the service provider." : "Add a new service provider to the community directory."}
                </DialogDescription>
                {/* Reference-style Header with Window Controls - Sticky at top */}
                <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 z-10">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-sm shadow-[#FF5F56]/20" />
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm shadow-[#FFBD2E]/20" />
                        <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-sm shadow-[#27C93F]/20" />
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">
                        {initialData ? "Update Details" : "New Provider"}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto flex-1 p-8 scrollbar-hide">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">
                            {initialData ? "Edit Provider" : "Add Provider"}
                        </h2>
                        <p className="text-slate-500 text-sm italic">
                            {initialData ? "Modify existing service information" : "Add a trusted service to the directory"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold text-slate-700 ml-1">
                                Full Name <span className="text-emerald-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Type provider name"
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-emerald-500/20 px-5 transition-all"
                                required
                            />
                        </div>

                        {/* Category Field */}
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-bold text-slate-700 ml-1">
                                Category <span className="text-emerald-500">*</span>
                            </Label>
                            <div className="space-y-3">
                                <Select value={formData.category} onValueChange={handleCategoryChange}>
                                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white px-5 transition-all">
                                        <SelectValue placeholder="Select service category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-200 p-2">
                                        {COMMON_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat} className="rounded-xl py-2.5">
                                                {cat}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="Other" className="rounded-xl py-2.5">Other</SelectItem>
                                    </SelectContent>
                                </Select>

                                {isCustomCategory && (
                                    <Input
                                        placeholder="Enter custom category name"
                                        name="customCategory"
                                        value={formData.customCategory}
                                        onChange={handleChange}
                                        className="h-14 rounded-2xl border-emerald-200 bg-emerald-50/30 focus:bg-white px-5 transition-all"
                                        required
                                    />
                                )}
                            </div>
                        </div>

                        {/* Phone and Price Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-bold text-slate-700 ml-1">
                                    Phone <span className="text-emerald-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Phone number"
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white px-5 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-sm font-bold text-slate-700 ml-1">
                                    Price Reference
                                </Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="text"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white px-5 transition-all"
                                    placeholder="e.g. ₹500/hr"
                                />
                            </div>
                        </div>

                        {/* Notes Field */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-bold text-slate-700 ml-1">
                                Notes
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="min-h-[100px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white px-5 py-4 transition-all resize-none"
                                placeholder="Any extra details or specialties..."
                            />
                        </div>

                        {/* Submit Button - Premium Style with Arrow */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-16 rounded-[1.5rem] bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] hover:shadow-emerald-500/40 hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    <>
                                        {initialData ? "Update Provider" : "Submit Provider"}
                                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
