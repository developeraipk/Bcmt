import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { BcmtLogo } from '@/Components/Brand/BcmtLogo';
import FlashNotification from '@/Components/FlashNotification';
import { DraggableFloatingWhatsApp } from '@/Components/Public/DraggableFloatingWhatsApp';
import {
    Phone,
    Mail,
    MapPin,
    MessageCircle,
    User,
    ArrowRight,
    GraduationCap,
    Clock,
    FileText,
    HelpCircle,
    Menu,
    X,
    ShieldCheck,
    ArrowUp,
    Building2,
    Sparkles,
} from 'lucide-react';

interface Props {
    children: React.ReactNode;
    title?: string;
}

export const PublicLayout: React.FC<Props> = ({ children }) => {
    const page = usePage();
    const { system, auth, flash } = page.props as any;
    const url = page.url || '';
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const supportPhone = system?.whatsapp_support_phone || '923340580180';
    const whatsappLink = `https://wa.me/${supportPhone}?text=${encodeURIComponent(
        'Hello BCMT Admission Support, I have a query regarding online admissions.'
    )}`;

    const navItems = [
        {
            label: 'Home',
            href: route('home'),
            active: url === '/' || route().current('home'),
        },
        {
            label: 'Programs',
            href: route('programs.index'),
            active: url.startsWith('/programs') || route().current('programs.*'),
        },
        {
            label: 'Eligibility',
            href: route('eligibility'),
            active: url.startsWith('/eligibility') || route().current('eligibility'),
        },
        {
            label: 'Admission Process',
            href: route('admission.process'),
            active: url.startsWith('/admission-process') || route().current('admission.process'),
        },
        {
            label: 'Merit Lists',
            href: '/merit-lists',
            active: url.startsWith('/merit-lists') || route().current('public.merit-lists*'),
        },
        {
            label: 'Contact & Support',
            href: route('contact'),
            active: url.startsWith('/contact') || route().current('contact'),
        },
    ];

    const isApplyActive = url.startsWith('/apply') || route().current('apply.*');

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            {/* Top Bar - Modern Midnight Executive Strip */}
            <div className="bg-[#0B1120] text-slate-300 text-xs py-2 px-4 border-b border-slate-800/80">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1.5 text-amber-300/90 font-medium">
                            <Phone className="h-3.5 w-3.5 text-amber-400" />
                            <span>{system?.phone || '0928-622699'}</span> / <span>{system?.mobile || '0334-0580180'}</span>
                        </span>
                        <span className="hidden sm:flex items-center gap-1.5 text-slate-300">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{system?.email || 'bcmts1122@gmail.com'}</span>
                        </span>
                        <span className="hidden md:flex items-center gap-1.5 text-slate-400">
                            <MapPin className="h-3.5 w-3.5 text-slate-500" />
                            <span>{system?.address || 'Circular Road near Hira School, Sokari Gate, Bannu'}</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {system?.whatsapp_community_enabled && (
                            <a
                                href={system?.whatsapp_community_url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors shadow-xs"
                            >
                                <MessageCircle className="h-3 w-3" />
                                <span>Join WhatsApp Community</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header / Nav */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Institutional Brand */}
                        <Link href={route('home')} className="flex items-center">
                            <BcmtLogo className="h-14 w-14" />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1.5 text-sm font-semibold">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                                        item.active
                                            ? 'bg-[#07294D]/10 text-[#07294D] font-bold border border-[#07294D]/25 shadow-2xs'
                                            : 'text-slate-600 hover:text-[#07294D] hover:bg-slate-50 font-medium'
                                    }`}
                                >
                                    {item.active && (
                                        <span className="h-2 w-2 rounded-full bg-[#FFB606]"></span>
                                    )}
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Portal Action Buttons (Desktop) */}
                        <div className="hidden lg:flex items-center gap-3">
                            {auth?.user ? (
                                <Link
                                    href={
                                        auth.user.roles.includes('super_admin') || auth.user.roles.includes('admission_officer')
                                            ? route('admin.dashboard')
                                             : auth.user.roles.includes('hod')
                                            ? route('hod.dashboard')
                                            : auth.user.roles.includes('invigilator')
                                            ? route('invigilator.dashboard')
                                            : route('student.dashboard')
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all shadow-xs"
                                >
                                    <User className="h-4 w-4" />
                                    <span>My Dashboard</span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-[#07294D] font-bold text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        <User className="h-4 w-4 text-slate-500" />
                                        <span>Student Login</span>
                                    </Link>
                                    <Link
                                        href={route('apply.index')}
                                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[#07294D] font-black text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-[#D49600]/40 ${
                                            isApplyActive
                                                ? 'bg-[#EAA700] ring-2 ring-[#07294D] ring-offset-2'
                                                : 'bg-[#FFB606] hover:bg-[#EAA700]'
                                        }`}
                                    >
                                        <Sparkles className="h-4 w-4 text-[#07294D]" />
                                        <span>Apply Online</span>
                                        <ArrowRight className="h-4 w-4 text-[#07294D]" />
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-xl">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`py-2.5 px-3.5 rounded-xl text-sm transition-colors flex items-center justify-between ${
                                    item.active
                                        ? 'bg-[#07294D]/10 text-[#07294D] font-bold border-l-4 border-[#FFB606]'
                                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                                }`}
                            >
                                <span>{item.label}</span>
                                {item.active && (
                                    <span className="text-[10px] uppercase font-bold text-[#07294D] bg-[#FFB606]/30 px-2 py-0.5 rounded-md">
                                        Active
                                    </span>
                                )}
                            </Link>
                        ))}

                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                            {auth?.user ? (
                                <Link
                                    href={
                                        auth.user.roles?.includes('super_admin') || auth.user.roles?.includes('admission_officer')
                                            ? route('admin.dashboard')
                                            : auth.user.roles?.includes('hod')
                                            ? route('hod.dashboard')
                                            : auth.user.roles?.includes('invigilator')
                                            ? route('invigilator.dashboard')
                                            : route('student.dashboard')
                                    }
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between w-full p-3 rounded-xl bg-[#07294D] text-white font-bold text-sm shadow-md hover:bg-[#0A3663] transition"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-[#FFB606] text-[#07294D] flex items-center justify-center font-black text-xs">
                                            {(auth.user.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs font-bold text-white">{auth.user.name}</div>
                                            <div className="text-[10px] text-amber-300 font-medium">Open Candidate Dashboard</div>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-[#FFB606]" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full text-center py-2.5 rounded-xl border border-slate-300 text-[#07294D] font-bold text-sm hover:bg-slate-50 transition"
                                    >
                                        Candidate Portal Login
                                    </Link>
                                    <Link
                                        href={route('apply.index')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-3 rounded-xl bg-[#FFB606] hover:bg-[#EAA700] text-[#07294D] font-black text-sm shadow-md border border-[#D49600]/40 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Sparkles className="h-4 w-4 text-[#07294D]" />
                                        <span>Apply Online for Admission</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Dynamic Auto-Dismiss Flash Notification with Cross Dismiss */}
            <FlashNotification flash={flash} autoDismissSeconds={5} />

            {/* Page Content */}
            <main className="flex-1">{children}</main>

            {/* Draggable & Collapsible Floating WhatsApp Support Button */}
            {system?.whatsapp_support_enabled && (
                <DraggableFloatingWhatsApp whatsappLink={whatsappLink} />
            )}

            {/* Institutional Academic Modern Footer - Deep Navy & Golden Yellow Theme (Eikra Inspiration) */}
            <footer className="bg-[#07294D] text-slate-200 relative border-t-4 border-[#FFB606]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
                    {/* Pre-Footer Admission Consultation Strip */}
                    <div className="mb-12 p-6 sm:p-7 rounded-3xl bg-[#041D3C] border border-[#0A3663] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-[#FFB606] text-[#07294D] shrink-0 shadow-md">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="h-2 w-2 rounded-full bg-[#FFB606] animate-pulse"></span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#FFB606]">
                                        Admission Guidance Desk 2026–2027
                                    </span>
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-white">
                                    Have Questions on Program Selection, Eligibility or Campus Admissions?
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                                    Our academic counselors are available on campus to guide you through verification, tests, and seat quotas.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <a
                                href={`tel:${system?.phone || '0928-622699'}`}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3560] hover:bg-[#0D4175] text-white font-semibold text-xs border border-[#144A80] transition-colors"
                            >
                                <Phone className="h-4 w-4 text-[#FFB606]" />
                                <span>{system?.phone || '0928-622699'}</span>
                            </a>
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                            >
                                <MessageCircle className="h-4 w-4 fill-current" />
                                <span>WhatsApp Helpdesk</span>
                            </a>
                        </div>
                    </div>

                    {/* Main Footer Links Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
                        {/* Col 1: Brand & Regulatory Recognition */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <BcmtLogo className="h-12 w-12 shrink-0" lightText={true} />
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider leading-snug">
                                        Bannu College of Medical Technologies
                                    </h4>
                                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-white/10 text-[#FFB606] text-[10px] font-bold border border-white/15 tracking-wide">
                                        {system?.tagline || 'The Home of Quality Education'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Bannu College of Medical Technologies (BCMT) is a premier healthcare education institution dedicated to academic rigor, clinical excellence, and transparent digital admissions.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-300 font-semibold">
                                <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">KMU Affiliated</span>
                                <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">Pharmacy Council</span>
                                <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">KPK Medical Faculty</span>
                                <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">HERA Chartered</span>
                            </div>
                        </div>

                        {/* Mobile 2-Columns Grid: Col 2 (Academic Offerings) on Left & Col 3 (Candidate Portals) on Right */}
                        <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:col-span-2 lg:grid-cols-2">
                            {/* Academic Programs (Left on Mobile) */}
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                                    <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FFB606]" />
                                    <span>Academic Offerings</span>
                                </h4>
                                <ul className="space-y-2 text-[11px] sm:text-xs text-slate-300">
                                    <li>
                                        <Link href={route('programs.show', 'BSECT')} className="hover:text-[#FFB606] transition-colors flex items-center justify-between group">
                                            <span className="group-hover:translate-x-0.5 transition-transform">BS Emergency Care (ECT)</span>
                                            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">4 Years</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('programs.show', 'BSMLT')} className="hover:text-[#FFB606] transition-colors flex items-center justify-between group">
                                            <span className="group-hover:translate-x-0.5 transition-transform">BS Medical Lab (MLT)</span>
                                            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">4 Years</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('programs.show', 'PHARMB')} className="hover:text-[#FFB606] transition-colors flex items-center justify-between group">
                                            <span className="group-hover:translate-x-0.5 transition-transform">Pharmacy Category B</span>
                                            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">2 Years</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('programs.show', 'DIP-HEALTH')} className="hover:text-[#FFB606] transition-colors flex items-center justify-between group">
                                            <span className="group-hover:translate-x-0.5 transition-transform">Health Technology</span>
                                            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">2 Years</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('programs.show', 'DIP-PATH')} className="hover:text-[#FFB606] transition-colors flex items-center justify-between group">
                                            <span className="group-hover:translate-x-0.5 transition-transform">Pathology Technology</span>
                                            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">2 Years</span>
                                        </Link>
                                    </li>
                                    <li className="pt-1">
                                        <Link href={route('programs.index')} className="text-[#FFB606] font-bold inline-flex items-center gap-1 hover:underline text-xs">
                                            <span>View All 9 Programs</span>
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Candidate Portals & Services (Right on Mobile) */}
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FFB606]" />
                                    <span>Candidate Portals</span>
                                </h4>
                                <ul className="space-y-2 text-[11px] sm:text-xs text-slate-300">
                                    <li>
                                        <Link href={route('apply.index')} className="hover:text-[#FFB606] transition-colors flex items-center gap-1.5 font-bold text-[#FFB606]">
                                            <ArrowRight className="h-3 w-3 text-[#FFB606] shrink-0" />
                                            <span>Apply Online</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('login')} className="hover:text-[#FFB606] transition-colors flex items-center gap-1.5">
                                            <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                                            <span>Candidate Portal Login</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/merit-lists" className="hover:text-[#FFB606] transition-colors flex items-center gap-1.5 font-semibold text-amber-300">
                                            <ArrowRight className="h-3 w-3 text-amber-400 shrink-0" />
                                            <span>Official Merit Lists</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('public.verify.slip')} className="hover:text-[#FFB606] transition-colors flex items-center gap-1.5">
                                            <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                                            <span>Verify Roll Number Slip</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('eligibility')} className="hover:text-[#FFB606] transition-colors flex items-center gap-1.5">
                                            <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                                            <span>Minimum Eligibility</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('admission.process')} className="hover:text-[#FFB606] transition-colors flex items-center gap-1.5">
                                            <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                                            <span>5-Step Admission Guide</span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Col 4: Campus Information */}
                        <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#FFB606]" />
                                <span>Campus Location</span>
                            </h4>
                            <div className="space-y-3 text-[11px] sm:text-xs text-slate-300">
                                <p className="flex items-start gap-2.5 leading-relaxed">
                                    <MapPin className="h-4 w-4 shrink-0 text-[#FFB606] mt-0.5" />
                                    <span>{system?.address || 'Circular Road near Hira School, Sokari Gate, Bannu, Khyber Pakhtunkhwa'}</span>
                                </p>
                                <p className="flex items-center gap-2.5">
                                    <Phone className="h-4 w-4 shrink-0 text-[#FFB606]" />
                                    <span>{system?.phone || '0928-622699'}</span> / <span>{system?.mobile || '0334-0580180'}</span>
                                </p>
                                <p className="flex items-center gap-2.5">
                                    <Mail className="h-4 w-4 shrink-0 text-[#FFB606]" />
                                    <span>{system?.email || 'bcmts1122@gmail.com'}</span>
                                </p>
                                <p className="flex items-center gap-2.5 pt-1 text-[10px] sm:text-[11px] text-slate-400">
                                    <Clock className="h-3.5 w-3.5 shrink-0 text-[#FFB606]" />
                                    <span>Working Hours: Mon – Sat (8:00 AM – 3:00 PM)</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sub-Footer Bottom Bar */}
                    <div className="mt-12 pt-8 border-t border-[#0A3663] flex flex-col items-center gap-4 text-xs text-slate-300">
                        {/* Centered Scroll to Top Button */}
                        <div className="flex justify-center w-full">
                            <button
                                type="button"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="inline-flex items-center justify-center p-2.5 rounded-full bg-[#FFB606] text-[#07294D] hover:bg-[#EAA700] shadow-md transition-all font-bold hover:scale-105"
                                title="Back to Top"
                            >
                                <ArrowUp className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Copyright & KMU Affiliation aligned in same line */}
                        <div className="w-full flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-300">
                            <p>© {new Date().getFullYear()} Bannu College of Medical Technologies (BCMT). All rights reserved.</p>
                            <span className="inline-flex items-center gap-1.5 text-[#FFB606] font-semibold shrink-0">
                                <ShieldCheck className="h-3.5 w-3.5 text-[#FFB606]" />
                                <span>Govt. Chartered & KMU Affiliated</span>
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
