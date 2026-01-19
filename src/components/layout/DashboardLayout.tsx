"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import UnderReview from "@/components/auth/UnderReview";
import AccountRejected from "@/components/auth/AccountRejected";
import { NotificationBell } from "@/components/shared/NotificationBell";
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
} from "lucide-react";
import { UserRole } from "@/generated/client";
import { Button } from "@/components/ui/button";

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
    description?: string;
}

// Navigation Configuration
const navigation: Partial<Record<UserRole, NavItem[]>> = {
    [UserRole.ADMIN]: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Residents", href: "/dashboard/admin/residents", icon: Users },
        { name: "Properties", href: "/dashboard/admin/properties", icon: Building },
        { name: "Facilities", href: "/dashboard/facilities", icon: Calendar },
        { name: "Complaints", href: "/dashboard/complaints", icon: Wrench },
        {
            name: "Announcements",
            href: "/dashboard/announcements",
            icon: MessageSquare,
        },
        // Financial Management Section
        { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
        { name: "Community Finances", href: "/dashboard/finances", icon: PieChart, description: "Manage community income and expenses" },
        { name: "FAQs", href: "/dashboard/faqs", icon: HelpCircle, description: "Frequently asked questions" },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
        { name: "Subscriptions", href: "/dashboard/subscription", icon: Wallet, description: "Manage community subscriptions" },
        { name: "Connect Space", href: "/dashboard/connect", icon: MessageSquare, description: "Community Chat" },
    ],
    [UserRole.RESIDENT]: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Book Facilities", href: "/dashboard/facilities", icon: Calendar },
        { name: "Complaints", href: "/dashboard/complaints", icon: Wrench },
        { name: "Announcements", href: "/dashboard/announcements", icon: Bell },
        // Personal Finance Section
        { name: "My Payments", href: "/dashboard/payments", icon: CreditCard },
        { name: "Community Finances", href: "/dashboard/finances", icon: PieChart },
        { name: "Connect Space", href: "/dashboard/connect", icon: MessageSquare },
        { name: "FAQs", href: "/dashboard/faqs", icon: HelpCircle, description: "Frequently asked questions" },
        { name: "Profile", href: "/dashboard/profile", icon: Settings },
    ],
    [UserRole.SUPER_ADMIN]: [
        { name: "Dashboard", href: "/dashboard/super-admin", icon: Home },
        { name: "Verifications", href: "/dashboard/super-admin/verifications", icon: CheckCircle2 },
        { name: "Permissions", href: "/dashboard/super-admin/permissions", icon: Shield },
        { name: "Subscriptions", href: "/dashboard/super-admin/subscriptions", icon: Wallet },
    ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallButton, setShowInstallButton] = useState(false);

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
            alert('To install this app:\n\n1. Open this site in Chrome/Edge on mobile\n2. Tap the menu (⋮) and select "Install app" or "Add to Home screen"\n\nOn desktop Chrome:\n1. Click the install icon in the address bar\n2. Or go to Settings → Install OurApartment');
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowInstallButton(false);
        }
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);


    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    // Status based rendering
    const isExemptRole = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

    if (user.status === ("PENDING" as any) && !isExemptRole) {
        return <UnderReview />;
    }

    if (user.status === ("REJECTED" as any)) {
        return <AccountRejected />;
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
    const activeItem = userNavigation.find((item: NavItem) => item.href === pathname);
    const pageTitle = activeItem ? activeItem.name : "Dashboard";

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden user-select-none">
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />

                    {/* Mobile Sidebar - 80% Width */}
                    <div className="fixed inset-y-0 left-0 w-[80%] bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
                        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-lg text-white shadow-md">
                                    <Building className="h-5 w-5" />
                                </div>
                                <span className="text-lg font-bold text-gray-900">OurApartment</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                            {userNavigation.map((item: NavItem) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                                        <span className="flex-1">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Mobile: User & Logout in one box */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
                            {showInstallButton && (
                                <Button
                                    onClick={() => {
                                        handleInstallClick();
                                        setSidebarOpen(false);
                                    }}
                                    variant="outline"
                                    className="w-full gap-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                                >
                                    <Download className="h-5 w-5" />
                                    Install App
                                </Button>
                            )}
                            <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold overflow-hidden">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            user.name?.[0]?.toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900 leading-none">{user.name}</span>
                                        <span className="text-[10px] text-gray-500 font-medium uppercase mt-1">{user.role}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar - Fixed Width, Feature Selection Only */}
            <div className="hidden lg:flex lg:w-64 flex-col bg-white border-r border-gray-200 fixed inset-y-0 z-30">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg text-white">
                            <Building className="h-4 w-4" />
                        </div>
                        <span className="text-lg font-bold text-gray-900 tracking-tight">OurApartment</span>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto custom-scrollbar">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Menu</p>
                    {userNavigation.map((item: NavItem) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"}`} />
                                <span className="flex-1">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Main Layout Area */}
            <div className="flex-1 flex flex-col min-h-screen lg:pl-64 w-full overflow-x-hidden">

                {/* Top Navigation Bar - Sticky */}
                <header className="sticky top-0 z-20 h-16 w-full max-w-full bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
                    {/* Mobile Menu Trigger + Title */}
                    <div className="flex items-center gap-2 sm:gap-3 lg:hidden min-w-0 flex-1 overflow-hidden">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg flex-shrink-0">
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="font-bold text-gray-900 truncate text-sm sm:text-base">{pageTitle}</span>
                    </div>

                    {/* Desktop Left Title */}
                    <div className="hidden lg:block min-w-0 flex-1 overflow-hidden">
                        <h1 className="text-xl font-bold text-gray-900 truncate">{pageTitle}</h1>
                    </div>

                    {/* Right Side: Bell, Install - No Logout */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <NotificationBell />

                        {showInstallButton && (
                            <Button
                                onClick={handleInstallClick}
                                variant="outline"
                                size="sm"
                                className="gap-1 sm:gap-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all p-2"
                                title="Install App"
                            >
                                <Download className="h-4 w-4 flex-shrink-0" />
                                <span className="hidden lg:inline whitespace-nowrap">Install App</span>
                            </Button>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
