import { CompleteProfileForm } from '@/components/auth/CompleteProfileForm';

export default function CompleteProfilePage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-emerald-950 p-6">
      {/* Background Background - High quality v2 */}
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: 'url("/auth-bg-v2.png")' }}
      />
      {/* Darker overlay for card contrast */}
      <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px]" />

      {/* Subtle animated depth blobs */}
      <div className="absolute -top-24 -left-24 h-[500px] w-[500px] animate-pulse rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="absolute -right-24 -bottom-24 h-[500px] w-[500px] animate-pulse rounded-full bg-teal-500/10 blur-[100px] delay-1000" />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        <div className="w-full rounded-[2.5rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl">
          <div className="rounded-[2rem] bg-white p-8 shadow-inner md:p-12">
            <CompleteProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
}
