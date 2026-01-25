'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import UnderReview from '@/components/auth/UnderReview';
import AccountRejected from '@/components/auth/AccountRejected';
import { NotificationBell } from '@/components/shared/NotificationBell';
import {
  Home,
  Users,
  Calendar,
  Wrench,
  MessageSquare,
  CreditCard,
  Shield,
  Settings,
  Menu,
  X,
  LogOut,
  Building,
  UserCheck,
  Bell,
  BarChart3,
  PieChart,
  Wallet,
  Vote,
  HelpCircle,
  CheckCircle2,
  Download,
  LucideIcon,
  Briefcase,
} from 'lucide-react';
import { UserRole } from '@/generated/client';
import { Button } from '@/components/ui/button';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

// Navigation Configuration
const navigation: Partial<Record<UserRole, NavItem[]>> = {
  [UserRole.ADMIN]: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    // Community & People
    { name: 'Residents', href: '/dashboard/admin/residents', icon: Users },
    { name: 'Properties', href: '/dashboard/admin/properties', icon: Building },
    {
      name: 'Announcements',
      href: '/dashboard/announcements',
      icon: MessageSquare,
    },
    {
      name: 'Connect Space',
      href: '/dashboard/connect',
      icon: MessageSquare,
      description: 'Community Chat',
    },
    // Operations
    { name: 'Facilities', href: '/dashboard/facilities', icon: Calendar },
    { name: 'Services', href: '/dashboard/services', icon: Briefcase },
    { name: 'Complaints', href: '/dashboard/complaints', icon: Wrench },
    // Finances
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    {
      name: 'Finances',
      href: '/dashboard/finances',
      icon: PieChart,
      description: 'Income & Expenses',
    },
    {
      name: 'Subscriptions',
      href: '/dashboard/subscription',
      icon: Wallet,
    },
    // Config
    {
      name: 'FAQs',
      href: '/dashboard/faqs',
      icon: HelpCircle,
    },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
  [UserRole.RESIDENT]: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    // Social
    { name: 'Announcements', href: '/dashboard/announcements', icon: Bell },
    { name: 'Connect Space', href: '/dashboard/connect', icon: MessageSquare },
    // Amenities
    { name: 'Book Facilities', href: '/dashboard/facilities', icon: Calendar },
    { name: 'Services', href: '/dashboard/services', icon: Briefcase },
    // Support
    { name: 'Complaints', href: '/dashboard/complaints', icon: Wrench },
    // Finance
    { name: 'My Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Community Funds', href: '/dashboard/finances', icon: PieChart },
    // Info
    {
      name: 'FAQs',
      href: '/dashboard/faqs',
      icon: HelpCircle,
    },
    { name: 'Profile', href: '/dashboard/profile', icon: Settings },
  ],
  [UserRole.SUPER_ADMIN]: [
    { name: 'Dashboard', href: '/dashboard/super-admin', icon: Home },
    {
      name: 'Verifications',
      href: '/dashboard/super-admin/verifications',
      icon: CheckCircle2,
    },
    {
      name: 'Permissions',
      href: '/dashboard/super-admin/permissions',
      icon: Shield,
    },
    {
      name: 'Subscriptions',
      href: '/dashboard/subscription',
      icon: Wallet,
    },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // --- Subscription Check ---
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    // Super Admin is always exempt from subscription checks
    if (user.role === UserRole.SUPER_ADMIN) {
      setSubscriptionActive(true);
      return;
    }

    const checkSubscription = async () => {
      try {
        const res = await fetch('/api/admin/subscription/status');
        if (res.ok) {
          const data = await res.json();
          setSubscriptionActive(data.active);
        } else {
          setSubscriptionActive(true);
        }
      } catch (e) {
        console.error(e);
        setSubscriptionActive(true);
      }
    };

    checkSubscription();
  }, [user]);

  // PWA Install Prompt Handler
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    } else {
      // Show button in development for testing
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev) {
        setShowInstallButton(true);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        'To install this app:\n\n1. Open this site in Chrome/Edge on mobile\n2. Tap the menu (⋮) and select "Install app" or "Add to Home screen"\n\nOn desktop Chrome:\n1. Click the install icon in the address bar\n2. Or go to Settings → Install OurApartment'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  // Redirect effect for Admins with inactive subscription
  useEffect(() => {
    if (subscriptionActive === false && user?.role === UserRole.ADMIN && pathname !== '/dashboard/subscription') {
      router.replace('/dashboard/subscription');
    }
  }, [subscriptionActive, user, pathname, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Status based rendering
  const isExemptRole =
    user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

  if (user.status === ('PENDING' as any) && !isExemptRole) {
    return <UnderReview />;
  }

  if (user.status === ('REJECTED' as any)) {
    return <AccountRejected />;
  }





  // Handle Inactive Subscription
  if (subscriptionActive === false) {
    // 1. Admin: Redirect to subscription page
    if (user.role === UserRole.ADMIN) {
      if (pathname !== '/dashboard/subscription') {
        // Return a loader while redirecting
        return (
          <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          </div>
        );
      }
      // If on subscription page, allow render (proceed to rest of component)
    }
    // 2. Residents/Others: Block Access
    else if (user.role !== UserRole.SUPER_ADMIN) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4 text-center text-white">
          <div className="mb-6 rounded-3xl bg-rose-500/10 p-6">
            <Shield className="h-16 w-16 text-rose-500" />
          </div>
          <h1 className="mb-2 text-3xl font-[900] tracking-tight">Subscription Expired</h1>
          <p className="max-w-md text-lg text-slate-400">
            Access to the community dashboard is currently restricted.
          </p>
          <div className="mt-8 rounded-2xl bg-slate-800 p-6">
            <p className="text-sm font-bold text-slate-300">Please contact your Community Admin</p>
            <p className="mt-1 text-xs text-slate-500">They need to renew the subscription to restore access.</p>
          </div>
          <button
            onClick={logout}
            className="mt-12 flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      );
    }
  }

  // Get navigation based on role, fallback to resident if user role not found
  // If role is USER, we fallback to RESIDENT
  const userRole = (user.role as UserRole) || UserRole.RESIDENT;

  // Check if role exists in navigation, otherwise default to resident
  let userNavigation = navigation[userRole];

  if (!userNavigation) {
    userNavigation = navigation[UserRole.RESIDENT] as NavItem[];
  }

  // Determine active page title
  const activeItem = userNavigation.find(
    (item: NavItem) => item.href === pathname
  );
  const pageTitle = activeItem ? activeItem.name : 'Dashboard';

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="user-select-none fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Mobile Sidebar - 80% Width */}
          <div className="fixed inset-y-0 left-0 flex w-[85%] transform flex-col bg-white shadow-2xl transition-transform duration-300 sm:w-[320px]">
            <div className="flex h-24 items-center justify-between border-b border-gray-100 px-6">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-lg font-black tracking-tight text-slate-900">
                    OurApartment
                  </span>
                  <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Premium Living
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-6 py-6">
              <p className="mb-4 px-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                Menu
              </p>
              {userNavigation.map((item: NavItem) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${isActive
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110'}`}
                    />
                    <span className="flex-1 tracking-wide">{item.name}</span>
                    {isActive && (
                      <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white/30" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile: User & Logout in one box */}
            <div className="space-y-4 border-t border-gray-100 bg-white p-6 pb-8">
              {showInstallButton && (
                <Button
                  onClick={() => {
                    handleInstallClick();
                    setSidebarOpen(false);
                  }}
                  variant="outline"
                  className="w-full gap-2 rounded-2xl border-slate-900 bg-slate-900 text-white transition-all hover:bg-black hover:text-white hover:shadow-lg"
                >
                  <Download className="h-5 w-5" />
                  Install App
                </Button>
              )}
              <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-1 shadow-xl shadow-gray-100 transition-all hover:border-gray-200">
                <div className="flex items-center gap-3 p-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-50">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-slate-200 to-slate-100 text-xs font-black text-slate-500">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-black text-slate-900">
                      {user.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[9px] font-bold tracking-wide text-slate-400 uppercase">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Premium Style */}
      <div className="fixed inset-y-0 z-30 hidden flex-col border-r border-gray-100 bg-white/80 backdrop-blur-xl lg:flex lg:w-72">
        {/* Brand Section */}
        <div className="flex h-24 items-center px-8">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200 transition-transform hover:scale-105">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-lg font-black tracking-tight text-slate-900">
                OurApartment
              </span>
              <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Premium Living
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-6 py-4">
          <p className="mb-4 px-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
            Main Navigation
          </p>
          {userNavigation.map((item: NavItem) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${isActive
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110'}`}
                />
                <span className="flex-1 tracking-wide">{item.name}</span>
                {isActive && (
                  <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white/30" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer/Logout Profile Section */}
        <div className="p-6">
          <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-1 shadow-2xl shadow-gray-100 transition-all hover:border-gray-200 hover:shadow-xl">
            <div className="flex items-center gap-3 p-3">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-50">
                {user.image ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={user.image}
                    alt={user.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-slate-200 to-slate-100 text-xs font-black text-slate-500">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-slate-900">
                  {user.name}
                </p>
                <p className="truncate text-[9px] font-bold tracking-wide text-slate-400 uppercase">
                  {user.role}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex min-h-screen w-full flex-1 flex-col overflow-x-hidden lg:pl-64">
        {/* Top Navigation Bar - Floating & Premium */}
        <header className="sticky top-0 z-20 mx-auto w-full max-w-7xl pt-4 sm:px-6 lg:px-8">
          <div className="flex h-16 w-full items-center justify-between gap-4 rounded-2xl border border-white/40 bg-white/70 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:px-6">

            {/* Mobile Menu Trigger + Title */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-transform active:scale-95"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
              <span className="text-sm font-black text-gray-900">
                {pageTitle}
              </span>
            </div>

            {/* Desktop Left: Breadcrumb/Context (Optional, keeps generic for now) */}
            <div className="hidden lg:block">
              {/* Intentionally left blank for cleaner specific-page headers */}
            </div>

            {/* Right Side Actions */}
            <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
              {/* Install Button (PWA) */}
              {showInstallButton && (
                <Button
                  onClick={handleInstallClick}
                  variant="outline"
                  size="sm"
                  className="hidden h-9 gap-2 rounded-xl border-blue-100 bg-blue-50/50 px-4 font-bold text-blue-600 hover:bg-blue-100/50 sm:flex"
                >
                  <Download className="h-4 w-4" />
                  <span>Get App</span>
                </Button>
              )}

              {/* Notification Bell */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-transform hover:scale-105">
                <NotificationBell />
              </div>

              {/* Profile Pill */}
              <Link
                href="/dashboard/profile"
                className="hidden items-center gap-3 rounded-xl bg-white py-1.5 pl-4 pr-1.5 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] sm:flex"
              >
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-gray-900">
                    {user.name}
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                    {user.role}
                  </span>
                </div>
                <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-gray-100 shadow-inner">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-black text-white">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>

              {/* Mobile Profile Icon Only */}
              <Link
                href="/dashboard/profile"
                className="relative block h-10 w-10 overflow-hidden rounded-xl bg-gray-100 shadow-sm sm:hidden"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-black text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
