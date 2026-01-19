"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Bell, BellOff, CheckCircle, XCircle, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PushNotificationManager() {
    const { user } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
            checkSubscription();
        } else {
            console.warn("Push notifications not supported in this browser.");
            setIsLoading(false);
        }
    }, [user]);

    const checkSubscription = async () => {
        if (!VAPID_PUBLIC_KEY) {
            setError("Push configuration missing.");
            setIsLoading(false);
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register("/service-worker.js");
            await registration.update(); // Force update to ensure latest worker
            const existingSubscription = await registration.pushManager.getSubscription();

            if (existingSubscription) {
                setSubscription(existingSubscription);
                setIsSubscribed(true);
            } else {
                setIsSubscribed(false);
            }
        } catch (err) {
            console.error("Error checking subscription:", err);
            setError("Failed to initialize notifications.");
        } finally {
            setIsLoading(false);
        }
    };

    const subscribeUser = async () => {
        if (!VAPID_PUBLIC_KEY) return;

        setIsLoading(true);
        setError(null);
        try {
            // CRITICAL: Request explicit permission first
            const permission = await Notification.requestPermission();

            if (permission !== "granted") {
                throw new Error("Notification permission denied. Please allow notifications in your browser settings.");
            }

            const registration = await navigator.serviceWorker.ready;
            const newSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            // Send to server
            const res = await fetch("/api/push-subscriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSubscription),
            });

            if (!res.ok) throw new Error("Failed to save subscription on server");

            setSubscription(newSubscription);
            setIsSubscribed(true);
        } catch (err: any) {
            console.error("Failed to subscribe:", err);
            setError(err.message || "Failed to subscribe. Check permissions.");
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribeUser = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (subscription) {
                await subscription.unsubscribe();

                await fetch("/api/push-subscriptions", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });

                setSubscription(null);
                setIsSubscribed(false);
            }
        } catch (err) {
            console.error("Failed to unsubscribe:", err);
            setError("Failed to unsubscribe.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="p-5 bg-white border border-gray-100 rounded-2xl group transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl transition-all ${isSubscribed ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {isSubscribed ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">Push Notifications</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm">
                            Receive real-time alerts on your device even when the app is closed.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    ) : (
                        <button
                            onClick={isSubscribed ? unsubscribeUser : subscribeUser}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${isSubscribed
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                                }`}
                        >
                            {isSubscribed ? "Disable Push" : "Enable Push"}
                        </button>
                    )}
                </div>
            </div>
            {error && (
                <p className="text-[10px] text-red-500 mt-3 font-medium flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> {error}
                </p>
            )}
            {isSubscribed && (
                <p className="text-[10px] text-emerald-600 mt-3 font-medium flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Device is registered for push notifications.
                </p>
            )}
        </div>
    );
}
