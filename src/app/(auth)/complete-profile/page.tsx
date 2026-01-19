import { CompleteProfileForm } from "@/components/auth/CompleteProfileForm";

export default function CompleteProfilePage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative bg-emerald-950 overflow-hidden">
            {/* Background Background - High quality v2 */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat h-full w-full opacity-60"
                style={{ backgroundImage: 'url("/auth-bg-v2.png")' }}
            />
            {/* Darker overlay for card contrast */}
            <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px]" />

            {/* Subtle animated depth blobs */}
            <div className="absolute -top-24 -left-24 h-[500px] w-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-24 -right-24 h-[500px] w-[500px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

            <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
                <div className="w-full bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-4 shadow-2xl border border-white/10">
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-inner">
                        <CompleteProfileForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
