import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';
import { Mail, User, Phone, Lock, Loader2, MoveLeft } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white lg:flex-row">
      {/* Left Side: Brand & Quote - Premium Gradient Background */}
      <div className="relative hidden h-full shrink-0 items-start justify-center overflow-hidden bg-[#211832] p-12 lg:flex lg:w-[45%] xl:w-[40%]">
        {/* Abstract Background Effects */}
        <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />

        {/* Content Container */}
        <div className="relative z-10 flex h-full w-full max-w-md flex-col justify-between text-left">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-slate-400 transition-all hover:text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 transition-all group-hover:bg-white/10 group-hover:scale-110">
              <span className="font-black text-white">OA</span>
            </div>
            <span className="text-sm font-bold tracking-widest uppercase">
              OurrApartment
            </span>
          </Link>

          <div className="space-y-6">
            <h2 className="text-5xl font-[900] tracking-tighter text-white leading-[1.1]">
              Start Your <br />
              <span className="text-indigo-400">Journey.</span>
            </h2>
            <p className="text-lg font-medium text-slate-400 max-w-sm leading-relaxed">
              Join hundreds of communities building a better living experience together.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#211832] bg-indigo-500 text-xs font-bold text-white shadow-lg"
                >
                  U{i}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white font-bold">Trusted by 500+ Residents</p>
              <p className="text-slate-500 text-xs font-medium mt-1">Join the community today.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="custom-scrollbar relative h-full flex-1 overflow-y-auto bg-white lg:bg-slate-50/30">
        <div className="flex min-h-full flex-col items-center justify-center p-6 sm:p-12 lg:p-24">

          <div className="w-full max-w-[420px] space-y-8">
            <Link
              href="/"
              className="group mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:border-indigo-600 hover:text-indigo-600 lg:hidden"
            >
              <MoveLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>

            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-block">
                <h1 className="text-2xl font-black text-slate-900">Ourr<span className="text-indigo-600">Apartment</span></h1>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-[900] tracking-tight text-slate-900 mb-2">Create Account</h1>
              <p className="text-slate-500 font-medium">Verify your identity to get started.</p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm lg:bg-transparent lg:shadow-none p-6 lg:p-0 rounded-3xl lg:rounded-none shadow-xl shadow-slate-200/50">
              <RegisterForm />
            </div>

            <p className="text-center text-sm font-bold text-slate-400 mt-8">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-auto pt-10 text-center lg:hidden">
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-300 uppercase">
              &copy; 2026 OurrApartment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
