import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';
import { MoveLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white lg:flex-row">
      {/* Left Side: Brand & Quote - Genuinely fixed/static height */}
      <div className="relative hidden h-full shrink-0 items-start justify-center overflow-hidden bg-emerald-950 p-8 lg:flex lg:w-[40%]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] hover:scale-110"
          style={{ backgroundImage: 'url("/auth-bg-v2.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-emerald-950/40 to-emerald-950/90" />

        {/* Content Container */}
        <div className="pointer-events-none relative z-10 flex h-full w-full max-w-sm flex-col items-center justify-between py-12 text-center">
          <Link
            href="/"
            className="group pointer-events-auto inline-flex flex-col items-center gap-1.5 text-white/60 transition-all hover:text-white"
          >
            <div className="rounded-full border border-white/10 bg-white/5 p-2.5 transition-all group-hover:scale-105 group-hover:bg-white/10">
              <MoveLeft className="h-4 w-4" />
            </div>
            <span className="text-[9px] font-bold tracking-widest uppercase">
              Home
            </span>
          </Link>

          <div className="flex flex-1 flex-col justify-center space-y-8 py-8">
            <div className="mx-auto inline-flex scale-90 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-2xl">
              <span className="text-4xl text-emerald-400">🏢</span>
            </div>

            <div className="space-y-3">
              <h2 className="font-outfit text-4xl leading-tight font-black tracking-tighter text-white">
                Community <br />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                  Simplified.
                </span>
              </h2>
              <p className="px-4 text-sm font-medium text-emerald-50/50">
                The ultimate platform for modern residential management.
              </p>
            </div>

            <blockquote className="mx-auto max-w-[280px] text-base leading-relaxed text-emerald-50/60 italic opacity-80">
              &ldquo;Essential for modern living.&rdquo;
            </blockquote>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex scale-90 -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-800 text-[10px] font-bold text-white capitalize shadow-2xl ring-4 ring-emerald-950/30"
                >
                  u{i}
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-400/60 uppercase">
              Trusted by 500+ residents
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form - Independent scroll */}
      <div className="custom-scrollbar relative h-full flex-1 overflow-y-auto bg-white lg:bg-gray-50/20">
        {/* Mobile Header Background Decor */}
        <div className="absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-emerald-50 to-white lg:hidden" />

        <div className="flex min-h-full flex-col items-center justify-center p-6 sm:p-12 lg:p-20">
          <Link
            href="/"
            className="group absolute top-8 left-6 flex items-center gap-2 font-bold text-emerald-700/60 transition-all hover:text-emerald-900 lg:hidden"
          >
            <div className="rounded-full bg-emerald-100 p-2 transition-colors group-hover:bg-emerald-200">
              <MoveLeft className="h-4 w-4" />
            </div>
            <span className="text-[10px] tracking-widest uppercase">Back</span>
          </Link>

          <div className="w-full max-w-md py-12 lg:py-0">
            <LoginForm />
          </div>

          {/* Footer only visible if scrolled to bottom or on short mobile screens */}
          <div className="mt-auto pt-12 pb-4 text-center">
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
              &copy; 2026 OurrApartment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
