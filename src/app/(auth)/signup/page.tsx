import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';
import { MoveLeft } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white lg:flex-row">
      {/* Left Side: Brand & Quote - Fixed on desktop */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-emerald-950 p-12 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[45%]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] hover:scale-110"
          style={{ backgroundImage: 'url("/auth-bg-v2.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-transparent to-emerald-950/60" />

        <div className="relative z-10 w-full max-w-lg">
          <Link
            href="/"
            className="group mb-16 inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
          >
            <div className="rounded-full bg-white/10 p-2 transition-colors group-hover:bg-white/20">
              <MoveLeft className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold tracking-wide uppercase">
              Return to Home
            </span>
          </Link>

          <div className="space-y-10">
            <div className="inline-flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
              <span className="text-4xl">🌱</span>
            </div>
            <h2 className="font-outfit text-6xl leading-tight font-black tracking-tighter text-white">
              Start building a <br />
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                Better Community
              </span>{' '}
              <br />
              today.
            </h2>
            <blockquote className="border-l-4 border-emerald-400/50 pl-6 text-xl leading-relaxed text-emerald-50/80 italic">
              &ldquo;Join thousands of communities making their life simpler and
              more secure.&rdquo;
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Side: Form - Scrollable */}
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center p-6 sm:p-12 lg:p-20">
          <Link
            href="/"
            className="hover:text-primary absolute top-6 left-6 flex items-center gap-2 text-gray-400 transition-colors lg:hidden"
          >
            <MoveLeft className="h-4 w-4" />
            <span className="text-sm font-bold tracking-wider uppercase">
              Back
            </span>
          </Link>

          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
