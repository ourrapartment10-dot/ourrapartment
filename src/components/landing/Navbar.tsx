'use client';

import Link from 'next/link';
import { Menu, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 20);
  });

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
      // Show button in development for testing (remove in production)
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev) {
        setShowInstallButton(true);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // In development or when prompt isn't available
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

  return (
    <motion.nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'border-b border-gray-100 bg-white/80 shadow-sm backdrop-blur-xl' : 'border-transparent bg-transparent'}`}
    >
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200 transition-transform group-hover:scale-105">
            <span className="text-xl font-black text-white">OA</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">
            Ourr<span className="text-blue-600">Apartment</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-10 md:flex">
          <nav className="flex gap-8 text-sm font-bold tracking-wide text-slate-500">
            {['Features', 'How It Works', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="hover:text-slate-900 transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {showInstallButton && (
              <Button
                onClick={handleInstallClick}
                variant="outline"
                size="sm"
                className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 font-bold gap-2 transition-all"
              >
                <Download className="h-4 w-4" />
                Install App
              </Button>
            )}
            <Link
              href="/login"
              className="hover:text-slate-900 text-sm font-bold text-slate-500 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-all shadow-lg hover:-translate-y-0.5 hover:bg-black hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader className="text-left">
              <SheetTitle className="text-2xl font-black tracking-tighter">
                Ourr<span className="text-blue-600">Apartment</span>
              </SheetTitle>
              <SheetDescription className="font-medium text-slate-500">
                Menu
              </SheetDescription>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-4">
              {['Features', 'How It Works', 'Contact'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl p-3 text-lg font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  {item}
                </Link>
              ))}
              <hr className="my-4 border-slate-100" />
              {showInstallButton && (
                <Button
                  onClick={() => {
                    handleInstallClick();
                    setIsOpen(false);
                  }}
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-xl border-slate-200 p-6 text-base font-bold text-slate-600"
                >
                  <Download className="h-5 w-5" />
                  Install App
                </Button>
              )}
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 p-4 text-base font-bold text-slate-900 hover:bg-slate-50 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-slate-900 p-4 text-base font-bold text-white shadow-lg hover:bg-black transition-all"
              >
                Get Started
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.nav>
  );
}
