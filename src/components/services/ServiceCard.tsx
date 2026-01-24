import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Phone, Star, Trash2, Edit2 } from "lucide-react";

interface ServiceProvider {
    id: string;
    name: string;
    category: string;
    phone: string;
    description: string | null;
    price: string | null;
    averageRating?: number;
    reviewCount?: number;
    addedById: string;
}

interface ServiceCardProps {
    service: ServiceProvider;
    currentUserId?: string;
    userRole?: string;
    onRate: (service: ServiceProvider) => void;
    onDelete: (id: string) => void;
    onEdit?: (service: ServiceProvider) => void;
}

export function ServiceCard({ service, currentUserId, userRole, onRate, onDelete, onEdit }: ServiceCardProps) {
    const isOwner = currentUserId === service.addedById;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
    const canDelete = isOwner || isAdmin;

    return (
        <Card className="group relative flex flex-col h-full rounded-3xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
            {/* Header Section */}
            <CardHeader className="p-6 pb-4 space-y-4">
                {/* Name and Verified Badge */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-2xl text-slate-900 mb-2 line-clamp-1">
                            {service.name}
                        </h3>
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold text-emerald-700">Verified</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {canDelete && (
                        <div className="flex gap-1.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:!text-indigo-600 hover:!bg-indigo-50 transition-all duration-200"
                                onClick={() => onEdit?.(service)}
                                title="Edit"
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:!text-red-600 hover:!bg-red-50 transition-all duration-200"
                                onClick={() => onDelete(service.id)}
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Stats Section - Like the reference */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 border border-slate-200/50">
                    <div className="flex items-center justify-between">
                        {/* Reviews */}
                        <div className="flex-1">
                            <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                                <Star className="h-4 w-4 fill-amber-500" />
                                <span className="text-xs font-medium text-slate-500">Rating</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-slate-900">
                                    {service.reviewCount || 0}
                                </span>
                                <span className="text-sm text-slate-500">
                                    ({service.averageRating ? service.averageRating.toFixed(1) : '0.0'})
                                </span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-12 bg-slate-200 mx-3" />

                        {/* Category */}
                        <div className="flex-1">
                            <div className="text-xs font-medium text-slate-500 mb-1">Category</div>
                            <div className="text-base font-semibold text-slate-900 line-clamp-1">
                                {service.category}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            {/* Content Section */}
            <CardContent className="flex-1 px-6 pb-6 space-y-4">
                {/* Description */}
                {service.description && (
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">About</div>
                        <p className="text-sm leading-relaxed text-slate-600 line-clamp-2">
                            {service.description}
                        </p>
                    </div>
                )}

                {/* Price - Premium Display */}
                {service.price && (
                    <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Price</span>
                        <span className="text-lg font-bold text-emerald-700">{service.price}</span>
                    </div>
                )}
            </CardContent>

            {/* Footer Section */}
            <CardFooter className="p-6 pt-0 space-y-3">
                {/* Primary Action Button */}
                <Button
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-300 group/btn"
                    asChild
                >
                    <a href={`tel:${service.phone}`}>
                        <Phone className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        Call Now
                    </a>
                </Button>

                {/* Secondary Action */}
                <Button
                    variant="outline"
                    className="w-full h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-all"
                    onClick={() => onRate(service)}
                >
                    <Star className="mr-2 h-3.5 w-3.5" />
                    Write Review
                </Button>
            </CardFooter>
        </Card>
    );
}
