import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { Mail, User, Phone, Lock, Loader2, MoveLeft } from "lucide-react";

export default function RegisterPage() {
    return (
        <div className="h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden">
            {/* Left Side: Brand & Quote - Genuinely fixed */}
            <div className="relative hidden lg:flex lg:w-[40%] h-full items-start justify-center p-8 overflow-hidden bg-emerald-950 shrink-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] hover:scale-110"
                    style={{ backgroundImage: 'url("/auth-bg-v2.png")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-emerald-950/40 to-emerald-950/90" />

                {/* Content Container */}
                <div className="relative z-10 h-full w-full max-w-sm flex flex-col items-center justify-between py-12 text-center pointer-events-none">
                    <Link href="/" className="inline-flex flex-col items-center gap-1.5 text-white/60 hover:text-white transition-all group pointer-events-auto">
                        <div className="p-2.5 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:scale-105 transition-all">
                            <MoveLeft className="h-4 w-4" />
                        </div>
                        <span className="font-bold tracking-widest uppercase text-[9px]">Home</span>
                    </Link>

                    <div className="space-y-8 flex-1 flex flex-col justify-center py-8">
                        <div className="inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-2xl rounded-[1.5rem] border border-white/10 shadow-2xl mx-auto scale-90">
                            <span className="text-4xl text-emerald-400">🌱</span>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-white leading-tight font-outfit tracking-tighter">
                                Start Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300">Journey.</span>
                            </h2>
                            <p className="text-emerald-50/50 text-sm font-medium px-4">Join 500+ residents building better communities together.</p>
                        </div>

                        <blockquote className="italic text-emerald-50/60 text-base leading-relaxed max-w-[280px] mx-auto opacity-80">
                            &ldquo;Better together.&rdquo;
                        </blockquote>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="flex -space-x-3 scale-90">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-10 w-10 rounded-full border-2 border-emerald-500 bg-emerald-800 flex items-center justify-center text-[10px] font-bold text-white shadow-2xl capitalize ring-4 ring-emerald-950/30">
                                    u{i}
                                </div>
                            ))}
                        </div>
                        <p className="text-emerald-400/60 text-[10px] font-bold tracking-[0.2em] uppercase">Trusted by 500+ residents</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Form - Independent scroll */}
            <div className="flex-1 h-full overflow-y-auto relative bg-white lg:bg-gray-50/20 custom-scrollbar">
                {/* Mobile Header Background Decor */}
                <div className="lg:hidden absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-emerald-50 to-white -z-10" />

                <div className="min-h-full flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20">
                    <Link href="/" className="lg:hidden absolute left-6 top-8 flex items-center gap-2 text-emerald-700/60 hover:text-emerald-900 transition-all font-bold group">
                        <div className="p-2 rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                            <MoveLeft className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest">Back</span>
                    </Link>

                    <div className="w-full max-w-md py-12 lg:py-0">
                        <RegisterForm />
                    </div>

                    <div className="mt-auto pt-12 pb-4 text-center">
                        <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">
                            &copy; 2026 OurrApartment
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
