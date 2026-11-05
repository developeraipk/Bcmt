import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { BcmtAffiliations } from '@/Components/Brand/BcmtBadge';
import {
    ArrowRight,
    GraduationCap,
    Clock,
    Award,
    CheckCircle2,
    Users,
    ShieldAlert,
    Sparkles,
    ShieldCheck,
    FileText,
    QrCode,
    KeyRound,
    Building2,
    CheckCircle,
    ChevronRight,
    BookOpen,
    MapPin,
    Calendar,
    HeartPulse,
    Microscope,
    Pill,
    Activity,
    Scissors,
    Syringe,
    Stethoscope,
} from 'lucide-react';

interface ProgramItem {
    id: number;
    name: string;
    code: string;
    category: 'bs_degree' | 'pharmacy_b' | 'medical_diploma';
    duration_years: number;
    qualification_required: string;
    affiliation: string;
    description: string;
    seats: number;
    is_open: boolean;
}

interface Props {
    activeSession: any;
    programs: ProgramItem[];
    settings: {
        admission_open_status: boolean;
        admission_closed_notice?: string;
    };
}

export default function Home({ activeSession, programs, settings }: Props) {
    const isAdmissionOpen = Boolean(settings.admission_open_status && (activeSession?.is_open ?? activeSession?.is_active));

    const bsPrograms = programs.filter((p) => p.category === 'bs_degree');
    const pharmacyB = programs.filter((p) => p.category === 'pharmacy_b');
    const diplomas = programs.filter((p) => p.category === 'medical_diploma');

    const totalCohortSeats = programs.reduce((acc, p) => acc + (Number(p.seats) || 0), 0) || 200;

    // Clean session badge label (prevent redundant "2026-2027 (2026-2027)")
    const sessionLabel = activeSession
        ? activeSession.name.includes(activeSession.code)
            ? activeSession.name
            : `${activeSession.name} (${activeSession.code})`
        : 'Admissions Session 2026–2027';

    return (
        <PublicLayout>
            <Head title="College Admission & Online Examination Management System" />

            {/* 1. HERO / JUMBOTRON SECTION - Deep Academic Navy & Golden Yellow (Eikra Inspiration) */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#07294D] via-[#09325D] to-[#041B38] text-white pt-14 pb-18 lg:pt-16 lg:pb-20 border-b-4 border-[#FFB606]">
                {/* Subtle Ambient Gold & Geometric Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none"></div>
                <div className="absolute -top-24 left-1/4 w-[650px] h-[350px] bg-[radial-gradient(ellipse,rgba(255,182,6,0.18),transparent_65%)] pointer-events-none blur-3xl"></div>
                <div className="absolute top-5 right-0 w-[550px] h-[450px] bg-[radial-gradient(ellipse,rgba(11,53,96,0.6),transparent_65%)] pointer-events-none blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        {/* Left Column: Heading, Narrative & CTAs */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Live Session Status Pill */}
                            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-md shadow-md">
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAdmissionOpen ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isAdmissionOpen ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                </span>
                                <span className="font-medium text-slate-100">{sessionLabel}</span>
                                <span className="text-white/30">•</span>
                                <span className={isAdmissionOpen ? 'text-[#FFB606] font-bold' : 'text-rose-300 font-bold'}>
                                    {isAdmissionOpen ? 'Official Admissions Open' : 'Admissions Closed'}
                                </span>
                            </div>

                            {/* Main Title */}
                            <div>
                                <span className="text-xs uppercase tracking-widest text-[#FFB606] font-bold block mb-2">
                                    The Home of Quality Healthcare Education • Bannu, KPK
                                </span>
                                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                                    Bannu College <br />
                                    <span className="text-[#FFB606] font-sans font-extrabold tracking-tight text-2xl sm:text-4xl lg:text-5xl block mt-1.5">
                                        of Medical Technologies
                                    </span>
                                </h1>
                            </div>

                            {/* Value Proposition Description */}
                            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
                                Premier healthcare higher education institution offering 4-Year BS Degree Programs affiliated with <strong className="text-white font-semibold">Khyber Medical University (KMU)</strong>, Pharmacy Category B accredited by <strong className="text-white font-semibold">Pharmacy Council of Pakistan</strong>, and 2-Year Medical Technology Diplomas affiliated with <strong className="text-white font-semibold">KPK Medical Faculty</strong>.
                            </p>

                            {/* Call to Actions */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
                                {isAdmissionOpen ? (
                                    <Link
                                        href={route('apply.index')}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FFB606] hover:bg-[#EAA700] text-[#07294D] font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border border-[#D49600]/40 text-center"
                                    >
                                        <Sparkles className="h-4 w-4 text-[#07294D] shrink-0" />
                                        <span>Apply Online for Admission</span>
                                        <ArrowRight className="h-4 w-4 text-[#07294D] shrink-0" />
                                    </Link>
                                ) : (
                                    <button
                                        disabled
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs sm:text-sm cursor-not-allowed border border-slate-700 text-center"
                                    >
                                        <span>Admissions Closed for Session</span>
                                    </button>
                                )}

                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all shadow-xs text-center"
                                >
                                    <span>Candidate Portal Login</span>
                                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                                </Link>
                            </div>

                            {/* Live Application Window Status Banner */}
                            {isAdmissionOpen && activeSession?.closing_datetime_formatted && (
                                <div className="flex items-center gap-2 text-xs text-[#FFB606] font-semibold bg-[#FFB606]/10 px-3.5 py-1.5 rounded-xl border border-[#FFB606]/25 w-fit">
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                    <span>Application Deadline: <strong className="text-white font-bold">{activeSession.closing_datetime_formatted}</strong> ({activeSession.time_remaining})</span>
                                </div>
                            )}
                            {!isAdmissionOpen && (
                                <div className="flex items-center gap-2 text-xs text-amber-200 font-semibold bg-amber-500/15 px-3.5 py-1.5 rounded-xl border border-amber-400/25 w-fit">
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                        {activeSession?.is_expired
                                            ? `Admissions Closed: Deadline expired on ${activeSession.closing_datetime_formatted}`
                                            : 'Admissions are currently suspended for this cycle.'}
                                    </span>
                                </div>
                            )}

                            {/* Trust Indicator Checkpoints */}
                            <div className="pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-200">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-[#FFB606] shrink-0" />
                                    <span className="font-medium text-slate-100">9 Certified Medical Programs</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-[#FFB606] shrink-0" />
                                    <span className="font-medium text-slate-100">{totalCohortSeats} Combined Merit Seats</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-[#FFB606] shrink-0" />
                                    <span className="font-medium text-slate-100">Campus-Based Online Test</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Interactive Admission Showcase Card */}
                        <div className="lg:col-span-5">
                            <div className="relative rounded-3xl bg-[#041D3C]/95 border border-[#0A3663] p-6 sm:p-7 shadow-2xl backdrop-blur-xl overflow-hidden">
                                {/* Card Top Status */}
                                <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-2.5 w-2.5 rounded-full bg-[#FFB606] animate-pulse"></div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                            Admissions Hub 2026–2027
                                        </span>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-[#FFB606]/20 border border-[#FFB606]/40 text-[#FFB606] font-mono font-bold text-xs shadow-2xs">
                                        Open Merit
                                    </span>
                                </div>

                                {/* Key Highlights Grid */}
                                <div className="space-y-3 text-xs">
                                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                                        <div className="p-2 rounded-xl bg-[#07294D] text-[#FFB606] border border-[#0A3663] shrink-0 mt-0.5">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <strong className="text-white block font-bold text-xs">BS Emergency Care & BS MLT</strong>
                                            <span className="text-slate-300 leading-relaxed text-[11px]">
                                                4-Year Degree Programs affiliated with Khyber Medical University (KMU).
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                                        <div className="p-2 rounded-xl bg-[#07294D] text-[#FFB606] border border-[#0A3663] shrink-0 mt-0.5">
                                            <Award className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <strong className="text-white block font-bold text-xs">Pharmacy Category B (2 Years)</strong>
                                            <span className="text-slate-300 leading-relaxed text-[11px]">
                                                Accredited and registered with Pharmacy Council of Pakistan.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                                        <div className="p-2 rounded-xl bg-[#07294D] text-[#FFB606] border border-[#0A3663] shrink-0 mt-0.5">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <strong className="text-white block font-bold text-xs">2-Year Medical Technology Diplomas</strong>
                                            <span className="text-slate-300 leading-relaxed text-[11px]">
                                                Health, Pathology, Surgical, Anaesthesia, Pharmacy & Radiology (FPAHS).
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                                        <div className="p-2 rounded-xl bg-[#07294D] text-[#FFB606] border border-[#0A3663] shrink-0 mt-0.5">
                                            <KeyRound className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <strong className="text-white block font-bold text-xs">Campus Entrance Examination</strong>
                                            <span className="text-slate-300 leading-relaxed text-[11px]">
                                                Conducted on campus with common PIN & biometric invigilator attendance.
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Campus Location Footer */}
                                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                                        <MapPin className="h-3.5 w-3.5 text-[#FFB606] shrink-0" />
                                        <span>Circular Road, Sokari Gate, Bannu</span>
                                    </span>
                                    <span className="font-bold text-[#07294D] bg-[#FFB606] px-2 py-0.5 rounded-md">
                                        Govt. Chartered
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. RECOGNIZED & AFFILIATED INSTITUTIONS SECTION - Professional Multi-Column Grid */}
            <section className="bg-slate-50/90 py-12 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-8">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white text-slate-700 border border-slate-300 shadow-2xs mb-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            Accreditations & Regulatory Recognition
                        </span>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                            Recognized & Affiliated Higher Education Bodies
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            BCMT academic credentials and diplomas are officially chartered and accredited by apex federal and provincial councils.
                        </p>
                    </div>

                    <BcmtAffiliations />
                </div>
            </section>

            {/* Closed Notice Alert if admissions are closed */}
            {!isAdmissionOpen && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3 shadow-xs">
                        <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-900">Admission Notice</h4>
                            <p className="text-xs text-amber-800 mt-1">
                                {settings.admission_closed_notice ||
                                    'Online admissions for the current academic session are closed. Please monitor college announcements for upcoming terms.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. CERTIFIED ACADEMIC PROGRAMS SECTION - Modern Card Redesign */}
            <section className="py-20 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40 border-t border-slate-200/80 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6 pb-6 border-b border-slate-200">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#07294D]/10 text-[#07294D] border border-[#07294D]/20 mb-3 shadow-2xs">
                                <Sparkles className="h-3.5 w-3.5 text-[#FFB606]" />
                                Certified Academic Offerings 2026–2027
                            </span>
                            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#07294D] tracking-tight">
                                9 Certified Medical & Health Technology Programs
                            </h2>
                            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                                Total institutional intake: <strong className="text-slate-900 font-semibold">{totalCohortSeats} approved seats</strong> across 3 accredited pathways. Open merit ranking based on combined male and female candidate competition.
                            </p>
                        </div>

                        <Link
                            href={route('programs.index')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#07294D] hover:bg-[#0A3663] text-[#FFB606] font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 group self-start sm:self-auto w-fit"
                        >
                            <span>Explore All 9 Disciplines</span>
                            <ArrowRight className="h-4 w-4 text-[#FFB606] group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Category A: 4-Year BS Degree Programs */}
                    <div className="mb-14">
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-white to-amber-50/30 border border-blue-100 shadow-2xs mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-[#07294D] text-[#FFB606] flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                                    A
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg sm:text-xl font-bold text-[#07294D]">4-Year BS Degree Programs</h3>
                                        <span className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-wider text-[#07294D] bg-[#FFB606]/30 px-2.5 py-0.5 rounded-full">
                                            Bachelor of Science
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">Undergraduate Degree Programs (8 Regular Semesters)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                                    <Award className="h-3.5 w-3.5 text-[#FFB606]" />
                                    <span>Affiliated with KMU Peshawar</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[#07294D] font-bold">Min. Intermediate Pass</span>
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {bsPrograms.map((prog) => (
                                <ProgramCard key={prog.id} program={prog} isAdmissionOpen={isAdmissionOpen} accentColor="wine" />
                            ))}
                        </div>
                    </div>

                    {/* Category B: Pharmacy Category B */}
                    <div className="mb-14">
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/60 via-white to-blue-50/30 border border-emerald-100 shadow-2xs mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-[#07294D] text-[#FFB606] flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                                    B
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg sm:text-xl font-bold text-[#07294D]">2-Year Pharmacy Category B Diploma</h3>
                                        <span className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                                            Professional Licensure
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">Accredited by Pharmacy Council of Pakistan (4 Semesters)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                                    <Award className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Pharmacy Council of Pakistan</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[#07294D] font-bold">Min. Matric Pass</span>
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pharmacyB.map((prog) => (
                                <ProgramCard key={prog.id} program={prog} isAdmissionOpen={isAdmissionOpen} accentColor="slate" />
                            ))}
                        </div>
                    </div>

                    {/* Category C: Medical Technology Diplomas */}
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/60 via-white to-blue-50/30 border border-amber-200/70 shadow-2xs mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-[#07294D] text-[#FFB606] flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                                    C
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg sm:text-xl font-bold text-[#07294D]">2-Year Medical Technology Diplomas</h3>
                                        <span className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                                            Clinical Tech Diplomas
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">Affiliated with KPK Medical Faculty / FPAHS Peshawar</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                                    <Award className="h-3.5 w-3.5 text-[#FFB606]" />
                                    <span>KPK Medical Faculty (FPAHS)</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[#07294D] font-bold">Min. Matric Pass</span>
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {diplomas.map((prog) => (
                                <ProgramCard key={prog.id} program={prog} isAdmissionOpen={isAdmissionOpen} accentColor="gold" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. 5-STEP ADMISSION & EXAMINATION WORKFLOW - Light Executive Contrast Section */}
            <section className="bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/50 py-20 border-t border-slate-200 text-slate-900 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#07294D] text-[#FFB606] border border-[#0A3663] shadow-2xs mb-3">
                            <KeyRound className="h-3.5 w-3.5 text-[#FFB606]" />
                            Standardized Campus Procedure
                        </span>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#07294D] tracking-tight">
                            5-Step Admission & Examination Workflow
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base mt-2.5 leading-relaxed">
                            A streamlined, transparent digital process conducted on campus with server-authoritative evaluation and combined merit ranking.
                        </p>
                    </div>

                    {/* Process Steps Track */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-5">
                        {[
                            {
                                step: '01',
                                icon: FileText,
                                title: 'Apply Online',
                                desc: 'Complete 5-step form, select certified program, and upload academic credentials.',
                                badge: 'Online Portal',
                            },
                            {
                                step: '02',
                                icon: ShieldCheck,
                                title: 'Scrutiny Audit',
                                desc: 'Admissions committee audits academic records and grants examination eligibility.',
                                badge: 'Document Scrutiny',
                            },
                            {
                                step: '03',
                                icon: QrCode,
                                title: 'Admit Card & PIN',
                                desc: 'Print official A4 Roll Number slip embedded with cryptographic verification QR seal.',
                                badge: 'Admit Card',
                            },
                            {
                                step: '04',
                                icon: KeyRound,
                                title: 'Campus Exam',
                                desc: 'Physical biometric attendance verified on campus. Enter common test PIN to take online exam.',
                                badge: 'On-Campus Test',
                            },
                            {
                                step: '05',
                                icon: Award,
                                title: 'Merit & Seats',
                                desc: 'Combined male & female merit compiled dynamically with atomic reservation & offer letter.',
                                badge: 'View Merit Lists',
                                link: '/merit-lists',
                            },
                        ].map((item, idx) => {
                            const IconComponent = item.icon;
                            const CardContent = (
                                <>
                                    <div>
                                        {/* Step Pill & Icon Header */}
                                        <div className="flex items-center justify-between gap-2 mb-4">
                                            <span className="font-mono text-xs font-bold text-[#07294D] bg-[#07294D]/10 px-2.5 py-1 rounded-lg border border-[#07294D]/20">
                                                Step {item.step}
                                            </span>
                                            <div className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 group-hover:bg-[#07294D] group-hover:text-[#FFB606] transition-colors">
                                                <IconComponent className="h-4 w-4" />
                                            </div>
                                        </div>

                                        <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#07294D] transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>

                                    {/* Footer Tag */}
                                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider group-hover:text-[#07294D]">
                                            {item.badge}
                                        </span>
                                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#07294D] group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </>
                            );

                            return (item as any).link ? (
                                <Link
                                    key={idx}
                                    href={(item as any).link}
                                    className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer block"
                                >
                                    {CardContent}
                                </Link>
                            ) : (
                                <div
                                    key={idx}
                                    className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300"
                                >
                                    {CardContent}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

// Helper to get medical specialty emblem & color scheme for each program
function getProgramMeta(code: string, category: string) {
    const upper = (code || '').toUpperCase();
    if (upper.includes('ECT') || upper.includes('EMERGENCY')) {
        return {
            icon: HeartPulse,
            iconClass: 'text-rose-600 bg-rose-50 border-rose-200',
            badge: 'Emergency Care',
            gradient: 'from-rose-500 to-rose-700',
        };
    }
    if (upper.includes('MLT') || upper.includes('LAB')) {
        return {
            icon: Microscope,
            iconClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
            badge: 'Medical Lab',
            gradient: 'from-indigo-500 to-indigo-700',
        };
    }
    if (upper.includes('PHARM') || upper.includes('CATB') || upper.includes('PHARMB')) {
        return {
            icon: Pill,
            iconClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
            badge: 'Pharmacy Tech',
            gradient: 'from-emerald-600 to-teal-700',
        };
    }
    if (upper.includes('HEALTH')) {
        return {
            icon: Activity,
            iconClass: 'text-sky-600 bg-sky-50 border-sky-200',
            badge: 'Public Health',
            gradient: 'from-sky-500 to-blue-600',
        };
    }
    if (upper.includes('PATH')) {
        return {
            icon: Microscope,
            iconClass: 'text-purple-600 bg-purple-50 border-purple-200',
            badge: 'Clinical Pathology',
            gradient: 'from-purple-500 to-violet-700',
        };
    }
    if (upper.includes('SURG')) {
        return {
            icon: Scissors,
            iconClass: 'text-amber-700 bg-amber-50 border-amber-200',
            badge: 'Surgical Tech',
            gradient: 'from-amber-500 to-amber-700',
        };
    }
    if (upper.includes('ANAES')) {
        return {
            icon: Syringe,
            iconClass: 'text-teal-700 bg-teal-50 border-teal-200',
            badge: 'Anesthesia Care',
            gradient: 'from-teal-500 to-emerald-700',
        };
    }
    if (upper.includes('CARD')) {
        return {
            icon: HeartPulse,
            iconClass: 'text-rose-600 bg-rose-50 border-rose-200',
            badge: 'Cardiology',
            gradient: 'from-rose-500 to-red-600',
        };
    }
    return {
        icon: Stethoscope,
        iconClass: 'text-[#07294D] bg-[#07294D]/10 border-[#07294D]/20',
        badge: category === 'bs_degree' ? 'BS Degree' : 'Allied Health',
        gradient: 'from-[#041D3C] to-[#07294D]',
    };
}

// User-Friendly, Modernized Executive Program Card Component (No colored side borders)
function ProgramCard({
    program,
    isAdmissionOpen,
    accentColor = 'wine',
}: {
    program: ProgramItem;
    isAdmissionOpen: boolean;
    accentColor?: 'wine' | 'slate' | 'gold';
}) {
    const meta = getProgramMeta(program.code, program.category);
    const IconComp = meta.icon;

    return (
        <div className="group relative flex flex-col justify-between p-6 sm:p-7 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300">
            <div>
                {/* Header: Specialty Emblem + Code / Category Pill + Approved Seats */}
                <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-[#07294D]/5 border border-[#07294D]/15 text-[#07294D] flex items-center justify-center shadow-2xs group-hover:bg-[#07294D] group-hover:text-[#FFB606] group-hover:border-[#07294D] transition-all duration-300 shrink-0">
                            <IconComp className="h-6 w-6 transition-colors" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-[#07294D] bg-[#07294D]/5 px-2.5 py-0.5 rounded-md border border-[#07294D]/10">
                                    {program.code}
                                </span>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    {meta.badge}
                                </span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                                {program.category === 'bs_degree'
                                    ? '4-Year Professional BS Degree'
                                    : program.category === 'pharmacy_b'
                                    ? '2-Year Pharmacy Category B'
                                    : '2-Year Medical Technology Diploma'}
                            </p>
                        </div>
                    </div>

                    <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/90 shadow-2xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span>{program.seats} Seats</span>
                        </span>
                        <span className="block text-[10px] font-semibold text-slate-400 mt-1">
                            Open Merit (M / F)
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#07294D] transition-colors leading-snug mb-2.5">
                    <Link href={route('programs.show', program.code)} className="focus:outline-hidden">
                        {program.name}
                    </Link>
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-5">
                    {program.description}
                </p>

                {/* Key Metrics Grid (Modular Executive Info Chips) */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 mb-6 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        {/* Metric 1: Duration */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-[#07294D]/5 text-[#07294D] shrink-0">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Duration
                                </span>
                                <span className="block text-xs font-bold text-slate-900 truncate">
                                    {program.duration_years} Years
                                </span>
                            </div>
                        </div>

                        {/* Metric 2: Eligibility */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-[#07294D]/5 text-[#07294D] shrink-0">
                                <GraduationCap className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Eligibility
                                </span>
                                <span className="block text-xs font-bold text-[#07294D] truncate" title={program.qualification_required}>
                                    {program.qualification_required}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metric 3: Affiliation & Credential Status */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-[#FFB606]/20 text-[#07294D] shrink-0">
                                <Award className="h-4 w-4 text-[#07294D]" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Affiliation & Authority
                                </span>
                                <span className="block text-xs font-bold text-slate-800 truncate" title={program.affiliation}>
                                    {program.affiliation}
                                </span>
                            </div>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Govt. Recognized</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                    href={route('programs.show', program.code)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#07294D] text-slate-700 hover:text-white font-bold text-xs border border-slate-200 hover:border-[#07294D] transition-all duration-200 shadow-2xs hover:shadow-xs group/btn"
                >
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all" />
                </Link>

                {isAdmissionOpen && program.is_open ? (
                    <Link
                        href={route('apply.index', { program: program.code })}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFB606] hover:bg-[#EAA700] text-[#07294D] text-xs font-black transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-[#D49600]/40 group/apply"
                    >
                        <span>Apply Now</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#07294D] group-hover/apply:translate-x-0.5 transition-transform" />
                    </Link>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200">
                        Intake Closed
                    </span>
                )}
            </div>
        </div>
    );
}
