"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader2, AlertCircle, CreditCard, X } from "lucide-react";

interface Payment {
    id: string;
    amount: number;
    description: string;
    user?: {
        name: string;
        email: string;
        phone: string | null;
    };
}

interface RazorpayPaymentFormProps {
    payments: Payment[];
    onClose: () => void;
    onPaymentSuccess: (updatedPayments: any) => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function RazorpayPaymentForm({ payments, onClose, onPaymentSuccess }: RazorpayPaymentFormProps) {
    const [loading, setLoading] = useState(false);
    const [razorpayKeyId, setRazorpayKeyId] = useState("");
    const [isTestMode, setIsTestMode] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    useEffect(() => {
        let script: HTMLScriptElement | null = null;

        const checkStatus = async () => {
            try {
                const res = await fetch('/api/payments/razorpay/status');
                const data = await res.json();

                if (data.configured) {
                    setIsTestMode(data.testMode);

                    script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.async = true;
                    document.body.appendChild(script);

                    setRazorpayKeyId(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "");
                } else {
                    setIsTestMode(true);
                }
            } catch (err) {
                console.error("Failed to check Razorpay status", err);
                setIsTestMode(true);
            } finally {
                setCheckingStatus(false);
            }
        };

        checkStatus();

        return () => {
            if (script) document.body.removeChild(script);
        };
    }, []);

    const handlePay = async () => {
        if (!window.Razorpay) {
            toast.error("Razorpay SDK failed to load. Please check your connection.");
            return;
        }

        setLoading(true);
        try {
            const orderRes = await fetch('/api/payments/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentIds: payments.map(p => p.id),
                    amount: totalAmount,
                    currency: "INR"
                })
            });

            if (!orderRes.ok) {
                const err = await orderRes.json();
                if (err.testMode) {
                    setIsTestMode(true);
                    throw new Error("Razorpay is in Test/Dev mode or keys are missing.");
                }
                throw new Error(err.error || "Failed to create order");
            }

            const orderData = await orderRes.json();

            const options = {
                key: orderData.keyId || razorpayKeyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Your Community",
                description: `Payment for ${payments.length} items`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch('/api/payments/razorpay/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                paymentIds: payments.map(p => p.id)
                            })
                        });

                        if (!verifyRes.ok) throw new Error("Verification failed");

                        const verifyData = await verifyRes.json();
                        toast.success("Payment Successful!");
                        onPaymentSuccess(verifyData);
                        onClose();
                    } catch (err) {
                        console.error(err);
                        toast.error("Payment verification failed. Please contact admin.");
                    }
                },
                prefill: {
                    name: payments[0]?.user?.name || "",
                    email: payments[0]?.user?.email || "",
                    contact: payments[0]?.user?.phone || ""
                },
                theme: { color: "#2563EB" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast.error(response.error.description || "Payment Failed");
            });
            rzp.open();

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">

                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-[900] text-gray-900 tracking-tight">Secure Payment</h2>
                            <p className="text-xs text-gray-500 font-medium">via Razorpay</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-center shadow-lg shadow-slate-900/10">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Paying Amount</p>
                        <p className="text-3xl font-[900] text-white tracking-tight">₹{totalAmount.toLocaleString('en-IN')}</p>
                        <p className="text-slate-400 text-sm mt-1">{payments.length} items selected</p>
                    </div>

                    {isTestMode ? (
                        <div className="bg-amber-50 p-4 rounded-xl flex items-start border border-amber-100">
                            <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-amber-800">Payment Gateway Unavailable</p>
                                <p className="text-xs text-amber-700 mt-1 leading-relaxed">Razorpay keys are not configured. Please use manual payment options.</p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handlePay}
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center disabled:opacity-50 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "PROCEED TO PAY"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
