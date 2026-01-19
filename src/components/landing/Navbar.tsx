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
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'border-b border-gray-100 bg-white/80 shadow-sm backdrop-blur-md' : 'border-transparent bg-transparent'}`}
    >
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-light tracking-tight text-gray-900">
            Ourr <span className="text-primary font-bold">Apartment</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-10 md:flex">
          <nav className="flex gap-8 text-sm font-semibold text-gray-600">
            {['Features', 'How It Works', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="hover:text-primary transition-colors"
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
                className="border-primary text-primary hover:bg-primary gap-2 transition-all hover:text-white"
              >
                <Download className="h-4 w-4" />
                Install App
              </Button>
            )}
            <Link
              href="/login"
              className="hover:text-primary text-sm font-semibold text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
              <SheetDescription>
                Access different sections of our website including Features, How
                It Works, and more.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-6">
              {['Features', 'How It Works', 'Contact'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setIsOpen(false)}
                  className="hover:text-primary text-lg font-medium transition-colors"
                >
                  {item}
                </Link>
              ))}
              <hr className="my-4" />
              {showInstallButton && (
                <Button
                  onClick={() => {
                    handleInstallClick();
                    setIsOpen(false);
                  }}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary gap-2 transition-all hover:text-white"
                >
                  <Download className="h-5 w-5" />
                  Install App
                </Button>
              )}
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-3 text-center font-semibold hover:bg-gray-50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-3 text-center font-semibold text-white"
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
