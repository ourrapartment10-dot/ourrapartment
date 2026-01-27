
'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { UserRole } from '@/generated/client';
import { useState, useEffect } from 'react';
import { CheckCircle2, Shield, Loader2, Zap, Clock, Calendar, AlertCircle, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function SubscriptionPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState<any>(null);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [flatCount, setFlatCount] = useState<number>(12);
    const [minFlatCount, setMinFlatCount] = useState<number>(12);

    // Super Admin States
    const [grantType, setGrantType] = useState<'TRIAL' | 'LIFETIME' | 'CUSTOM'>('TRIAL');
    const [customDays, setCustomDays] = useState(30);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/admin/subscription/status');
            if (res.ok) {
                const data = await res.json();
                setSubscription(data);
                const min = Math.max(data.totalProperties || 0, 12);
                setMinFlatCount(min);
                // Only set flatCount if it hasn't been touched or is less than min (optional, here forcing min on load)
                setFlatCount(min);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubscribe = async (days: number) => {
        if (flatCount < minFlatCount) {
            toast.error(`Minimum ${minFlatCount} flats required`);
            return;
        }

        setPaymentLoading(true);
        try {
            const startRes = await loadRazorpayScript();
            if (!startRes) {
                toast.error('Failed to load payment gateway');
                return;
            }

            const orderRes = await fetch('/api/admin/subscription/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days, flatCount }),
            });

            if (!orderRes.ok) {
                const error = await orderRes.json();
                throw new Error(error.error || 'Failed to create order');
            }

            const orderData = await orderRes.json();

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'OurApartment',
                description: `Subscription for ${days} days`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch('/api/admin/subscription/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                days: days,
                                amount: orderData.amount,
                            }),
                        });

                        if (verifyRes.ok) {
                            toast.success('Subscription activated successfully!');
                            fetchStatus();
                        } else {
                            toast.error('Verification failed');
                        }
                    } catch (err) {
                        console.error(err);
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone,
                },
                theme: {
                    color: '#4f46e5',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleGrant = async () => {
        setPaymentLoading(true);
        try {
            const res = await fetch('/api/super-admin/subscription/grant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: grantType,
                    days: grantType === 'CUSTOM' ? customDays : undefined
                })
            });

            if (res.ok) {
                toast.success('Subscription granted successfully');
                fetchStatus();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to grant');
            }
        } catch (e) {
            toast.error('Grant failed');
        } finally {
            setPaymentLoading(false);
        }
    };

    // --- UI Components ---

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const PlanCard = ({ days, label, savings, popular, bestValue }: any) => {
        let price = 0;
        let rateDisplay = '';

        // Calculate Price based on user formula
        // 3m (90d): 1.5 * flats * 90
        // 6m (180d): 1.25 * flats * 180
        // 1y (360d): 1 * flats * 360
        // 1y6m (540d): (1 * flats * 360) + (0.75 * flats * 180)

        if (days === 90) {
            price = 1.5 * flatCount * 90;
            rateDisplay = '₹1.5/flat/day';
        } else if (days === 180) {
            price = 1.25 * flatCount * 180;
            rateDisplay = '₹1.25/flat/day';
        } else if (days === 360) {
            price = 1.0 * flatCount * 360;
            rateDisplay = '₹1/flat/day';
        } else if (days === 540) {
            price = (1.0 * flatCount * 360) + (0.75 * flatCount * 180);
            rateDisplay = '₹1 (12m) + ₹0.75 (6m)';
        }

        return (
            <div
                onClick={() => setSelectedPlan(days)}
                className={`relative cursor-pointer overflow-hidden rounded-3xl border transition-all duration-300 hover:shadow-xl ${selectedPlan === days
                    ? 'border-[#211832] bg-[#211832]/5 ring-2 ring-[#211832] ring-offset-2'
                    : 'border-slate-100 bg-white hover:border-[#211832]/20'
                    }`}
            >
                {popular && (
                    <div className="absolute top-0 right-0 rounded-bl-2xl bg-[#211832] px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                        Most Popular
                    </div>
                )}
                {bestValue && (
                    <div className="absolute top-0 right-0 rounded-bl-2xl bg-emerald-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                        Best Value
                    </div>
                )}
                {savings && (
                    <div className="absolute top-0 right-0 rounded-bl-2xl bg-violet-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                        {savings}
                    </div>
                )}

                <div className="p-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{label}</h3>
                    <div className="mt-4">
                        <span className="text-4xl font-black text-slate-900">₹{price.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-slate-400">{rateDisplay}</p>

                    <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                            <Clock className="h-4 w-4 text-indigo-500" />
                            <span>{days === 360 ? '12 Months' : days === 540 ? '18 Months' : `${Math.round(days / 30)} Months`} ({days} Days)</span>
                        </div>
                    </div>
                </div>

                {/* Selection Indicator */}
                <div className={`flex items-center justify-center border-t p-4 ${selectedPlan === days ? 'bg-[#211832] border-[#211832]' : 'bg-slate-50 border-slate-100'}`}>
                    {selectedPlan === days ? (
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                            <CheckCircle2 className="h-5 w-5" /> Selected
                        </div>
                    ) : (
                        <span className="text-sm font-bold text-slate-400">Select Plan</span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1600px] space-y-12 pb-20">
            {/* Dynamic Background Elements */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-[#211832]/10 blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] h-[70%] w-[70%] rounded-full bg-indigo-100/40 blur-[150px]" />
            </div>

            {/* Premium Header */}
            <div className="relative px-2 pt-8">
                <div className="max-w-2xl space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex w-fit items-center gap-3 rounded-2xl bg-[#211832]/10 px-4 py-2 text-[#211832]"
                    >
                        <Shield className="h-4 w-4" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                            Secure Gateway
                        </span>
                    </motion.div>

                    <div className="space-y-2">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl leading-[0.9] font-[900] tracking-tighter text-slate-900 lg:text-7xl"
                        >
                            Subscription & <br />
                            <span className="bg-gradient-to-r from-[#211832] to-slate-800 bg-clip-text text-transparent">
                                Plans.
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-lg text-lg leading-relaxed font-medium text-slate-500 lg:text-xl"
                        >
                            Ensure your community has uninterrupted access to OurApartment's premium features.
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* Active Status Card */}
            <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 ${subscription?.active ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-gradient-to-br from-[#211832] to-slate-900 text-white'}`}>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${subscription?.active ? 'bg-white/20' : 'bg-rose-500/20'} backdrop-blur-md`}>
                                {subscription?.active ? <CheckCircle2 className="h-6 w-6 text-white" /> : <AlertCircle className="h-6 w-6 text-rose-400" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-black">
                                    {subscription?.active ? 'Active Subscription' : 'Subscription Expired'}
                                </h2>
                                <p className={`text-sm font-medium ${subscription?.active ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {subscription?.active ? 'Your community is protected' : 'Service usage is restricted'}
                                </p>
                            </div>
                        </div>

                        {subscription?.daysRemaining > 0 && (
                            <div className="mt-8">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Days Remaining</p>
                                <p className="text-6xl font-[900] tracking-tighter mt-2">{subscription.daysRemaining}</p>
                            </div>
                        )}
                    </div>

                    {subscription?.isLifetime ? (
                        <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md border border-white/10">
                            <div className="flex items-center gap-3 text-sm font-bold opacity-80 mb-2">
                                <Shield className="h-4 w-4" /> Plan Type
                            </div>
                            <p className="text-2xl font-black">
                                Lifetime Access
                            </p>
                        </div>
                    ) : subscription?.expiresOn && (
                        <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md border border-white/10">
                            <div className="flex items-center gap-3 text-sm font-bold opacity-80 mb-2">
                                <Calendar className="h-4 w-4" /> Expires On
                            </div>
                            <p className="text-2xl font-black">
                                {new Date(subscription.expiresOn).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ADMIN VIEW - Plans */}
            {user?.role === UserRole.ADMIN && (
                <div className="space-y-6">

                    {/* Flat Count Config */}
                    <div className="rounded-[2rem] bg-indigo-50 p-8 border border-indigo-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white">
                                <Building className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Configure Flats</h3>
                                <p className="text-sm text-slate-500 font-medium">Pricing varies by plan duration (Minimum {minFlatCount} flats required)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 max-w-sm">
                            <input
                                type="number"
                                min={minFlatCount}
                                value={flatCount === 0 || isNaN(flatCount) ? '' : flatCount}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setFlatCount(isNaN(val) ? 0 : val);
                                }}
                                onBlur={() => {
                                    if (flatCount < minFlatCount) {
                                        toast.error(`Setting to minimum required: ${minFlatCount}`);
                                        setFlatCount(minFlatCount);
                                    }
                                }}
                                className="flex-1 rounded-xl border-slate-200 px-4 py-3 text-lg font-black text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="font-bold text-slate-400">Flats</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-black text-slate-900">Select a Plan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <PlanCard days={90} label="Short Term (3 Months)" />
                        <PlanCard days={180} label="Best Value (6 Months)" bestValue />
                        <PlanCard days={360} label="Most Popular (1 Year)" popular />
                        <PlanCard days={540} label="Maximum Savings (1.5 Years)" savings="Save Big" />
                    </div>

                    {selectedPlan && (
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 lg:sticky lg:bottom-4 lg:rounded-3xl lg:border lg:mx-auto lg:max-w-4xl">
                            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-center sm:text-left">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription Summary</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-xl font-black text-slate-900">{flatCount} Flats × {selectedPlan} Days</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSubscribe(selectedPlan)}
                                    disabled={paymentLoading || flatCount < minFlatCount}
                                    className="w-full sm:w-auto px-8 py-4 bg-[#211832] hover:bg-[#150f20] text-white rounded-xl font-bold shadow-lg shadow-[#211832]/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {paymentLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                        <>
                                            <Shield className="h-5 w-5" />
                                            Secure Payment
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SUPER ADMIN VIEW - Grant & Toggle */}
            {user?.role === UserRole.SUPER_ADMIN && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-6">Subscription Controls</h3>

                        <div className="mb-8 flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Lifetime Access</h4>
                                <p className="text-xs font-medium text-slate-500">Grant unlimited access to this community</p>
                            </div>
                            <button
                                onClick={async () => {
                                    setPaymentLoading(true);
                                    try {
                                        const res = await fetch('/api/super-admin/subscription/toggle-lifetime', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ enable: !subscription?.isLifetime })
                                        });
                                        if (res.ok) {
                                            toast.success(`Lifetime access ${!subscription?.isLifetime ? 'enabled' : 'disabled'}`);
                                            fetchStatus();
                                        } else {
                                            toast.error('Failed to update status');
                                        }
                                    } catch (e) {
                                        toast.error('Error updating status');
                                    } finally {
                                        setPaymentLoading(false);
                                    }
                                }}
                                disabled={paymentLoading}
                                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${subscription?.isLifetime ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${subscription?.isLifetime ? 'translate-x-6' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>

                        <div className="space-y-4 opacity-50 pointer-events-none grayscale" style={{ opacity: subscription?.isLifetime ? 0.4 : 1, pointerEvents: subscription?.isLifetime ? 'none' : 'auto', filter: subscription?.isLifetime ? 'grayscale(1)' : 'none' }}>
                            {/* Standard Grants (Disabled if Lifetime is active) */}
                            <button
                                onClick={() => { setGrantType('TRIAL'); handleGrant(); }}
                                disabled={paymentLoading}
                                className="flex w-full items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all font-bold text-slate-700"
                            >
                                <span>Grant 70-Day Trial</span>
                                <Zap className="h-5 w-5 text-indigo-600" />
                            </button>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Custom Days</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={customDays}
                                        onChange={(e) => setCustomDays(Number(e.target.value))}
                                        className="flex-1 rounded-lg border-slate-200 px-3 py-2 text-sm font-bold"
                                    />
                                    <button
                                        onClick={() => { setGrantType('CUSTOM'); handleGrant(); }}
                                        disabled={paymentLoading}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black"
                                    >
                                        Grant
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm opacity-50 pointer-events-none">
                        <h3 className="text-lg font-black text-slate-900 mb-6">Payment History</h3>
                        <div className="flex items-center justify-center h-40 border-2 border-dashed border-slate-100 rounded-2xl">
                            <p className="text-sm font-bold text-slate-400">Coming Soon</p>
                        </div>
                    </div>
                </div>
            )}
            {/* Closing container */}
        </div>
    );
}
