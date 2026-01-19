import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer id="contact" className="border-t border-gray-100 bg-white pt-24 pb-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-4 lg:gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="mb-6 text-2xl font-light text-gray-900">
                            Ourr <span className="font-bold text-primary">Apartment</span>
                        </h3>
                        <p className="max-w-sm text-gray-600 leading-relaxed font-medium">
                            Modern community management platform that brings efficiency, transparency,
                            and security to residential communities.
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-6 font-bold text-gray-900">Quick Links</h4>
                        <ul className="space-y-4 text-gray-600 font-medium">
                            <li>
                                <Link href="/login" className="hover:text-primary transition-colors">
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="hover:text-primary transition-colors">
                                    Get Started
                                </Link>
                            </li>
                            <li>
                                <a href="#features" className="hover:text-primary transition-colors">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-primary transition-colors">
                                    How It Works
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-6 font-bold text-gray-900">Contact</h4>
                        <ul className="space-y-4 text-gray-600 font-medium">
                            <li>support@ourrapartment.com</li>
                            <li>+1 (555) 123-4567</li>
                            <li>Available 24/7</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 border-t border-gray-100 pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm font-medium text-gray-500">
                            &copy; {currentYear} Ourr Apartment. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm font-medium text-gray-500">
                            <Link href="/terms" className="hover:text-gray-900 transition-colors">
                                Terms
                            </Link>
                            <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                                Privacy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
