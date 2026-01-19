"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    isLoading = false
}: ConfirmDialogProps) {
    const variantStyles = {
        danger: {
            icon: "text-red-600",
            iconBg: "bg-red-100",
            button: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
        },
        warning: {
            icon: "text-orange-600",
            iconBg: "bg-orange-100",
            button: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
        },
        info: {
            icon: "text-blue-600",
            iconBg: "bg-blue-100",
            button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        }
    };

    const styles = variantStyles[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-full max-w-md bg-white rounded-2xl shadow-2xl z-[110] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 pb-4">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 h-12 w-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                                    <AlertTriangle className={`h-6 w-6 ${styles.icon}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                                    <p className="text-sm text-gray-600">{message}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 pt-2 flex items-center justify-end gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                disabled={isLoading}
                                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-opacity-50 ${styles.button}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
