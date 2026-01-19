"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
    Search,
    ChevronDown,
    HelpCircle,
    FileText,
    Settings,
    CreditCard,
    MessageSquare,
    Bell,
    Vote,
    Shield,
    Wrench,
    ArrowRight,
    Sparkles,
    X,
    Filter,
    Mail
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FAQCategory = {
    id: string;
    title: string;
    icon: any;
    color: string;
    questions: { q: string; a: string }[];
};

const faqData: FAQCategory[] = [
    {
        id: "general",
        title: "General",
        icon: HelpCircle,
        color: "text-blue-600 bg-blue-50",
        questions: [
            {
                q: "What is Ourr Apartment?",
                a: "Ourr Apartment is a simple app that helps societies manage maintenance billing, receipts, complaints, announcements, and finances — all in one place."
            },
            {
                q: "Who can use the secretary panel?",
                a: "Only the society's secretary or management committee members with admin rights can use this panel."
            }
        ]
    },
    {
        id: "residents",
        title: "Residents & Properties",
        icon: FileText,
        color: "text-emerald-600 bg-emerald-50",
        questions: [
            {
                q: "How do I add or remove residents?",
                a: "Go to Residents → Add Resident / Remove Resident. When you remove a resident, their login is disabled."
            },
            {
                q: "How do residents join the society in the app?",
                a: "Residents register with their flat number & phone number. You approve them in the Properties section."
            },
            {
                q: "Can multiple family members from one flat log in?",
                a: "Yes. You can approve more than one account per flat."
            }
        ]
    },
    {
        id: "payments",
        title: "Payments & Billing",
        icon: CreditCard,
        color: "text-orange-600 bg-orange-50",
        questions: [
            {
                q: "Can I send payment reminders?",
                a: "Yes. Go to Payments → Pending → Send Reminder (via app notification)."
            },
            {
                q: "Are receipts generated automatically?",
                a: "Yes. Digital receipts are created once a resident pays and are stored in both resident and secretary accounts."
            },
            {
                q: "Can I track all society finances?",
                a: "Yes. The Financial Dashboard shows collections, dues, and expenses in real time."
            }
        ]
    },
    {
        id: "complaints",
        title: "Complaints & Requests",
        icon: Wrench,
        color: "text-rose-600 bg-rose-50",
        questions: [
            {
                q: "How do I manage resident complaints?",
                a: "Go to Complaints → View → Update status → Close."
            },
            {
                q: "Can I track complaint history?",
                a: "Yes. Each complaint has a full history (date, updates, closure)."
            },
            {
                q: "Can residents upload photos with complaints?",
                a: "Yes. They can attach images, which you'll see in the dashboard."
            }
        ]
    },
    {
        id: "announcements",
        title: "Announcements & Notices",
        icon: Bell,
        color: "text-indigo-600 bg-indigo-50",
        questions: [
            {
                q: "How do I make an announcement?",
                a: "Go to Announcements → New Announcement → Send. All residents get instant notifications."
            },
            {
                q: "Are old notices saved?",
                a: "Yes. All past announcements are stored in the app."
            }
        ]
    },
    {
        id: "polls",
        title: "Polls & Decisions",
        icon: Vote,
        color: "text-amber-600 bg-amber-50",
        questions: [
            {
                q: "How do I create a poll?",
                a: "Go to Polls → Create Poll → Add Options → Publish."
            },
            {
                q: "Can I see who voted?",
                a: "Yes. The secretary panel shows participation details."
            },
            {
                q: "Can polls be anonymous?",
                a: "Yes. You can choose to keep votes private."
            }
        ]
    },
    {
        id: "setup",
        title: "App Setup & Accounts",
        icon: Settings,
        color: "text-gray-600 bg-gray-50",
        questions: [
            {
                q: "How long does setup take?",
                a: "Less than 1 day. We guide you through the entire onboarding."
            },
            {
                q: "What if I change secretary role?",
                a: "You can transfer admin rights to another committee member anytime."
            }
        ]
    },
    {
        id: "pricing",
        title: "Subscription & Pricing",
        icon: Shield,
        color: "text-violet-600 bg-violet-50",
        questions: [
            {
                q: "How much does Ourr Apartment cost?",
                a: "Our pricing is transparent and designed for scale:\n\n• **3-Month Plan**: ₹1.50/flat/day (~₹45/mo)\n• **6-Month Plan**: ₹1.25/flat/day (~₹37.50/mo)\n• **1-Year Plan**: ₹1.00/flat/day (~₹30/mo)\n• **18-Month Plan**: ₹0.625/flat/day for first 12 mo, then ₹1.00/flat/day.\n\n*All prices exclude GST. Minimum 12 flats required.*"
            },
            {
                q: "Who pays the subscription?",
                a: "The society management committee pays. Residents don't pay extra."
            },
            {
                q: "How do we pay for subscription?",
                a: "Directly via UPI, Bank Transfer, or Razorpay secure gateway."
            },
            {
                q: "Is there a free trial available?",
                a: "Yes! New communities get a **2-month free trial**. No credit card required. Start managing immediately."
            },
            {
                q: "What happens when my subscription expires?",
                a: "Renewal reminders start 20 days prior. Once expired, access is paused until renewal, which can be done instantly."
            }
        ]
    },
    {
        id: "support",
        title: "Support",
        icon: MessageSquare,
        color: "text-pink-600 bg-pink-50",
        questions: [
            {
                q: "How do I get help if something doesn't work?",
                a: "Use the Support & Feedback section in the app."
            },
            {
                q: "Do you provide setup support?",
                a: "Yes. Setup is 100% free, and we guide you through onboarding."
            },
            {
                q: "How fast do you respond?",
                a: "Usually within 2-4 hours, with a maximum of 1 working day."
            }
        ]
    }
];

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string, answer: string, isOpen: boolean, onToggle: () => void }) {
    return (
        <div className={cn(
            "group border-b border-gray-100 last:border-0 transition-all duration-300",
            isOpen ? "bg-blue-50/50" : "hover:bg-gray-50/50"
        )}>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-5 text-left outline-none"
            >
                <span className={cn(
                    "text-sm font-semibold transition-colors duration-300",
                    isOpen ? "text-blue-700 font-bold" : "text-gray-700 group-hover:text-gray-900"
                )}>
                    {question}
                </span>
                <div className={cn(
                    "flex-shrink-0 ml-4 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300",
                    isOpen ? "bg-blue-600 text-white rotate-180" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                )}>
                    <ChevronDown className="h-3.5 w-3.5" />
                </div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                            {answer.split('**').map((part, i) => i % 2 === 1 ? <b key={i} className="text-gray-900">{part}</b> : part)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<string>("all");
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>(["general"]);

    const filteredFAQs = useMemo(() => {
        let results = faqData;

        if (activeTab !== "all") {
            results = results.filter(cat => cat.id === activeTab);
        }

        if (searchQuery) {
            results = results.map(cat => ({
                ...cat,
                questions: cat.questions.filter(q =>
                    q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.a.toLowerCase().includes(searchQuery.toLowerCase())
                )
            })).filter(cat => cat.questions.length > 0);
        }

        return results;
    }, [searchQuery, activeTab]);

    // Auto-expand categories if searching
    useEffect(() => {
        if (searchQuery) {
            setExpandedCategories(filteredFAQs.map(c => c.id));
        }
    }, [searchQuery, filteredFAQs]);

    const toggleCategoryExpand = (id: string, isDesktop: boolean) => {
        if (isDesktop) return; // Desktop is always expanded
        setExpandedCategories(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
            {/* Super Header */}
            <div className="relative mb-8 md:mb-16">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10" />
                <div className="flex flex-col items-center text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 mb-2"
                    >
                        <Sparkles className="h-3 w-3" />
                        Admin Help Center
                    </motion.div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                        How can we <span className="text-blue-600">help you?</span>
                    </h1>
                    <p className="text-gray-500 max-w-lg text-xs md:text-base font-medium">
                        Master your community management with our comprehensive guides and answers.
                    </p>
                </div>
            </div>

            {/* Search Floating Bar */}
            <div className="sticky top-20 z-30 mb-8 md:mb-12">
                <div className="relative max-w-2xl mx-auto">
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-blue-900/5 -z-10" />
                    <div className="relative flex items-center p-1.5 md:p-2">
                        <Search className="absolute left-5 md:left-6 h-4 md:h-5 w-4 md:w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search help topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 md:pl-14 pr-10 md:pr-12 py-3 md:py-4 bg-transparent text-sm md:text-base text-gray-900 font-medium placeholder:text-gray-400 outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 md:right-6 p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar Navigation - Collapsible on Mobile */}
                <div className="lg:col-span-3 space-y-2 lg:sticky lg:top-48 h-fit">
                    {/* Mobile Category Toggle */}
                    <button
                        onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                        className="lg:hidden w-full flex items-center justify-between px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-sm font-bold text-gray-900"
                    >
                        <div className="flex items-center gap-3">
                            <Filter className="h-4 w-4 text-blue-600" />
                            <span>{activeTab === "all" ? "All Topics" : faqData.find(c => c.id === activeTab)?.title}</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isCategoryMenuOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isCategoryMenuOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden lg:hidden space-y-2"
                            >
                                <button
                                    onClick={() => { setActiveTab("all"); setIsCategoryMenuOpen(false); }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                        activeTab === "all" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-white hover:text-gray-900"
                                    )}
                                >
                                    All Topics
                                </button>
                                {faqData.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setActiveTab(cat.id); setIsCategoryMenuOpen(false); }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                            activeTab === cat.id ? "bg-white text-blue-600 shadow-md border border-blue-50" : "text-gray-500 hover:bg-white hover:text-gray-900"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-1.5 rounded-lg", activeTab === cat.id ? cat.color : "bg-gray-100")}>
                                                <cat.icon className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="truncate">{cat.title}</span>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Desktop Sidebar (Always Visible) */}
                    <div className="hidden lg:block space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-4 flex items-center gap-2">
                            <Filter className="h-3 w-3" /> Categories
                        </p>
                        <button
                            onClick={() => setActiveTab("all")}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                activeTab === "all" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-white hover:text-gray-900"
                            )}
                        >
                            All Topics
                        </button>
                        {faqData.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                    activeTab === cat.id ? "bg-white text-blue-600 shadow-md border border-blue-50" : "text-gray-500 hover:bg-white hover:text-gray-900"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-1.5 rounded-lg", activeTab === cat.id ? cat.color : "bg-gray-100")}>
                                        <cat.icon className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="truncate">{cat.title}</span>
                                </div>
                                <ArrowRight className={cn("h-3 w-3 opacity-0 -translate-x-2 transition-all", activeTab === cat.id && "opacity-100 translate-x-0")} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 space-y-6 md:space-y-10">
                    <LayoutGroup>
                        {filteredFAQs.map((category) => {
                            const isExpanded = expandedCategories.includes(category.id);
                            return (
                                <motion.section
                                    layoutId={category.id}
                                    key={category.id}
                                    className="scroll-mt-48"
                                >
                                    {/* Category Header (Clickable as Accordion on Mobile ONLY) */}
                                    <div className="flex flex-col">
                                        <button
                                            onClick={() => toggleCategoryExpand(category.id, false)}
                                            className="lg:cursor-default w-full flex items-center gap-3 mb-4 px-2 group text-left outline-none"
                                        >
                                            <div className={cn("h-8 md:h-10 w-8 md:w-10 rounded-xl flex items-center justify-center shadow-sm shrink-0", category.color)}>
                                                <category.icon className="h-4 md:h-5 w-4 md:w-5" />
                                            </div>
                                            <h2 className="text-lg md:text-xl font-black text-gray-900 flex-1">{category.title}</h2>

                                            {/* Mobile-only expand/collapse icon */}
                                            <div className={cn(
                                                "lg:hidden h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 transition-all duration-300",
                                                isExpanded ? "rotate-180 bg-gray-200 text-gray-600" : ""
                                            )}>
                                                <ChevronDown className="h-3.5 w-3.5" />
                                            </div>

                                            <div className="hidden lg:block h-px flex-1 bg-gray-100 ml-2" />
                                        </button>

                                        {/* Category Content (Accordion behavior for mobile) */}
                                        <div className={cn(
                                            "transition-all duration-300 overflow-hidden",
                                            isExpanded ? "max-h-[2000px] opacity-100 visible" : "max-h-0 opacity-0 invisible lg:max-h-none lg:opacity-100 lg:visible"
                                        )}>
                                            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                                                {category.questions.map((faq, idx) => (
                                                    <AccordionItem
                                                        key={idx}
                                                        question={faq.q}
                                                        answer={faq.a}
                                                        isOpen={openQuestion === faq.q}
                                                        onToggle={() => setOpenQuestion(openQuestion === faq.q ? null : faq.q)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            );
                        })}
                    </LayoutGroup>

                    {filteredFAQs.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 font-medium">
                            <div className="h-16 md:h-20 w-16 md:w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="h-6 md:h-8 w-6 md:w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">No matching help topics</h3>
                            <p className="text-gray-400 text-sm md:text-base max-w-xs mx-auto">Try searching for other keywords.</p>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="mt-6 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-200"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium CTA Box */}
            <div className="mt-20 md:mt-32 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-blue-900/30" />
                <div className="relative p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
                    <div className="text-center md:text-left space-y-3 md:space-y-4">
                        <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
                            Still stuck? We're <br /> <span className="text-blue-200 text-xl md:text-2xl">here to help.</span>
                        </h3>
                        <p className="text-blue-100 max-w-md text-sm font-medium">
                            Our support experts are ready to assist you via chat or email.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
                        <Link
                            href="/dashboard/settings"
                            className="px-6 md:px-8 py-3.5 md:py-4 bg-white text-blue-600 rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                        >
                            <MessageSquare className="h-4 md:h-5 w-4 md:w-5" />
                            Live Support
                        </Link>
                        <a
                            href="mailto:support@ourapartment.com"
                            className="px-6 md:px-8 py-3.5 md:py-4 bg-blue-500/30 backdrop-blur-md text-white border border-white/20 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                        >
                            <Mail className="h-4 md:h-5 w-4 md:w-5" />
                            Email Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
