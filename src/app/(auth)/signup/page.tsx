import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function SignupPage() {
    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
            {/* Left Side: Brand & Quote - Fixed on desktop */}
            <div className="relative hidden lg:flex lg:w-[45%] lg:h-screen lg:sticky lg:top-0 items-center justify-center p-12 overflow-hidden bg-emerald-950">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] hover:scale-110"
                    style={{ backgroundImage: 'url("/auth-bg-v2.png")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-transparent to-emerald-950/60" />

                <div className="relative z-10 w-full max-w-lg">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/80 mb-16 hover:text-white transition-colors group">
                        <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                            <MoveLeft className="h-5 w-5" />
                        </div>
                        <span className="font-semibold tracking-wide uppercase text-xs">Return to Home</span>
                    </Link>

                    <div className="space-y-10">
                        <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
                            <span className="text-4xl">🌱</span>
                        </div>
                        <h2 className="text-6xl font-black text-white leading-tight font-outfit tracking-tighter">
                            Start building a <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">Better Community</span> <br />
                            today.
                        </h2>
                        <blockquote className="border-l-4 border-emerald-400/50 pl-6 italic text-emerald-50/80 text-xl leading-relaxed">
                            &ldquo;Join thousands of communities making their life simpler and more secure.&rdquo;
                        </blockquote>
                    </div>
                </div>
            </div>

            {/* Right Side: Form - Scrollable */}
            <div className="flex-1 flex flex-col min-h-screen">
                <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20">
                    <Link href="/" className="lg:hidden absolute left-6 top-6 flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                        <MoveLeft className="h-4 w-4" />
                        <span className="text-sm font-bold uppercase tracking-wider">Back</span>
                    </Link>

                    <div className="w-full max-w-md">
                        <RegisterForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
