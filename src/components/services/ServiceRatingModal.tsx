"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "../ui/textarea";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface ServiceProvider {
    id: string;
    name: string;
}

interface ServiceRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceProvider | null;
    onSuccess: () => void;
}

export function ServiceRatingModal({ isOpen, onClose, service, onSuccess }: ServiceRatingModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    if (!service) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/services/${service.id}/rate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, comment }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit rating");
            }

            toast.success("Rating submitted successfully");
            onSuccess();
            onClose();
            // Reset form
            setRating(0);
            setComment("");
        } catch (error) {
            toast.error("Failed to submit rating");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate {service.name}</DialogTitle>
                    <DialogDescription>
                        Share your experience with this service provider.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="p-1 hover:scale-110 transition-transform focus:outline-none"
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={`h-8 w-8 ${star <= (hoveredRating || rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground/30"
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                        {rating > 0 ? `You selected ${rating} star${rating > 1 ? 's' : ''}` : "Select a rating"}
                    </p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="comment" className="text-sm font-medium">
                        Comment (Optional)
                    </label>
                    <Textarea
                        id="comment"
                        placeholder="Tell us more about your experience..."
                        value={comment}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                        className="resize-none"
                        rows={3}
                    />
                </div>

                <DialogFooter className="sm:justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
