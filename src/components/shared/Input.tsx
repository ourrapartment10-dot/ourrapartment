"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon: Icon, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5 group">
                {label && (
                    <label
                        className="text-sm font-semibold tracking-tight text-gray-700 group-focus-within:text-primary transition-colors"
                        htmlFor={props.id}
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {Icon && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                            <Icon className="h-4.5 w-4.5" />
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-12 w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-2 text-sm transition-all duration-200",
                            "placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            Icon && "pl-11",
                            error ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : "",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
