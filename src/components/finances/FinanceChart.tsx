
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { motion } from "framer-motion";

interface FinanceChartData {
    name: string;
    income: number;
    expense: number;
}

interface FinanceChartProps {
    data: FinanceChartData[];
    activeRange: string;
    onRangeChange: (range: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-xl p-4 border border-slate-100 shadow-2xl rounded-2xl space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-8">
                            <span className="text-xs font-bold text-slate-600">{entry.name}</span>
                            <span className={cn("text-sm font-black", entry.name === 'Income' ? 'text-emerald-600' : 'text-rose-600')}>
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

import { cn } from "@/lib/utils";

export function FinanceChart({ data, activeRange, onRangeChange }: FinanceChartProps) {
    const ranges = ['1m', '3m', '6m', '1y'];

    return (
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold tracking-tight text-slate-800">Monthly Financial Overview</CardTitle>
                </div>

                <div className="flex p-1 bg-slate-100/50 rounded-xl w-fit border border-slate-100/50">
                    {ranges.map((range) => (
                        <button
                            key={range}
                            onClick={() => onRangeChange(range)}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                activeRange === range
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-400 hover:text-slate-500"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
                <div className="h-[350px] w-full mt-4">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
                                barGap={0}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={{ stroke: '#64748b' }}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={{ stroke: '#64748b' }}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                    tickFormatter={(value) => `₹${value.toFixed(2)}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="square"
                                    wrapperStyle={{ paddingTop: '30px', fontWeight: 600, fontSize: '12px' }}
                                />
                                <Bar
                                    dataKey="income"
                                    name="Income"
                                    fill="#22c55e"
                                    barSize={35}
                                    animationDuration={1000}
                                />
                                <Bar
                                    dataKey="expense"
                                    name="Expenses"
                                    fill="#ef4444"
                                    barSize={35}
                                    animationDuration={1000}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="p-6 bg-slate-50 rounded-full">
                                <BarChart3 className="h-12 w-12 text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-bold text-sm tracking-tight text-center max-w-[200px]">
                                No transactions recorded for the selected period
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

import { BarChart3 } from "lucide-react";
