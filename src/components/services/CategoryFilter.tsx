"use client";

import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string;
    onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
    return (
        <div className="flex gap-2 pb-2">
            <Button
                variant={selectedCategory === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => onSelect("All")}
                className={`rounded-2xl px-6 ${selectedCategory === "All" ? "bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
                All
            </Button>
            {categories.map((cat) => (
                <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSelect(cat)}
                    className={`rounded-2xl px-5 whitespace-nowrap ${selectedCategory === cat ? "bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                    {cat}
                </Button>
            ))}
        </div>
    );
}
