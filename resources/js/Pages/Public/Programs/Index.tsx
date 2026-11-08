import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { Clock, GraduationCap, Award, Users, ArrowRight, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Program {
    id: number;
    name: string;
    code: string;
    category: 'bs_degree' | 'pharmacy_b' | 'medical_diploma' | 'technical_diploma' | string;
    duration_years: number;
    qualification_required: string;
    affiliation: string;
    description: string;
    seats?: number;
}

export default function Index({ programs }: { programs: Program[] }) {
    const bsPrograms = programs.filter((p) => p.category === 'bs_degree');
    const pharmacyB = programs.filter((p) => p.category === 'pharmacy_b');
    const diplomas = programs.filter((p) => p.category === 'medical_diploma');
    const technicalDiplomas = programs.filter((p) => p.category === 'technical_diploma' || p.code === 'DIT');

    return (
        <PublicLayout>
            <Head title="Academic Programs & Courses" />

            {/* Professional Eikra Deep Academic Navy Jumbotron */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#041D3C] via-[#07294D] to-[#0A3663] text-white py-12 lg:py-16 shadow-md border-b-4 border-[#FFB606]">
                {/* Subtle Geometric Mesh & Gold Ambient Glow */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
                <div className="absolute -top-10 right-10 w-96 h-96 bg-[radial-gradient(ellipse,rgba(255,182,6,0.18),transparent_65%)] pointer-events-none blur-3xl"></div>
                <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[radial-gradient(ellipse,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none blur-2xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFB606] bg-white/10 px-3.5 py-1.5 rounded-full border border-[#FFB606]/35 backdrop-blur-md shadow-xs">
                        <Sparkles className="h-3.5 w-3.5 text-[#FFB606]" />
                        Official Academic Catalog 2026–2027
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black mt-3.5 text-white tracking-tight leading-tight">
                        Certified Degree & Diploma Programs
                    </h1>
                    <p className="text-sm sm:text-base text-slate-200 mt-2.5 max-w-2xl leading-relaxed font-normal">
                        Explore our 10 recognized degree and diploma programs affiliated with KMU, Pharmacy Council, KPK Medical Faculty, and KP-BTE Peshawar.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
                {/* BS Degree Programs */}
                <div>
                    <div className="border-b border-slate-200 pb-4 mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">BS Degree Programs (4 Years)</h2>
                        <p className="text-xs text-slate-600 font-medium mt-1">
                            Affiliated with Khyber Medical University (KMU) • Minimum Qualification: Intermediate (HSSC Pass)
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bsPrograms.map((prog) => (
                            <ProgramDetailCard key={prog.id} prog={prog} />
                        ))}
                    </div>
                </div>

                {/* Pharmacy Category B */}
                <div>
                    <div className="border-b border-slate-200 pb-4 mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Pharmacy Category B Diploma (2 Years)</h2>
                        <p className="text-xs text-[#07294D] font-bold mt-1">
                            Accredited by Pharmacy Council of Pakistan • Minimum Qualification: Matric (SSC Pass)
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pharmacyB.map((prog) => (
                            <ProgramDetailCard key={prog.id} prog={prog} />
                        ))}
                    </div>
                </div>

                {/* Medical Technology Diplomas */}
                <div>
                    <div className="border-b border-slate-200 pb-4 mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Medical Technology Diplomas (2 Years)</h2>
                        <p className="text-xs text-emerald-800 font-semibold mt-1">
                            Affiliated with KPK Medical Faculty (FPAHS) • Minimum Qualification: Matric (SSC Pass)
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {diplomas.map((prog) => (
                            <ProgramDetailCard key={prog.id} prog={prog} />
                        ))}
                    </div>
                </div>

                {/* Technical & IT Diplomas (DIT) */}
                {technicalDiplomas.length > 0 && (
                    <div>
                        <div className="border-b border-slate-200 pb-4 mb-8 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">1-Year Diploma in Information Technology (DIT)</h2>
                                <p className="text-xs text-blue-800 font-semibold mt-1">
                                    Affiliated with Khyber Pakhtunkhwa Board of Technical Education (KP-BTE Peshawar) • Minimum Qualification: Matric (SSC Pass)
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                                <span>100% Free Tuition Fee</span>
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {technicalDiplomas.map((prog) => (
                                <ProgramDetailCard key={prog.id} prog={prog} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}

function ProgramDetailCard({ prog }: { prog: Program }) {
    return (
        <div className="group relative flex flex-col justify-between p-6 sm:p-7 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300">
            <div>
                {/* Header: Code Pill & Category Tag + Seats & Duration Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#07294D] bg-[#07294D]/5 px-2.5 py-1 rounded-md border border-[#07294D]/10">
                            {prog.code}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            {prog.category === 'bs_degree'
                                ? '4-Year BS Degree'
                                : prog.category === 'pharmacy_b'
                                ? '2-Year Pharmacy Category B'
                                : prog.category === 'technical_diploma' || prog.code === 'DIT'
                                ? '1-Year Technical Diploma'
                                : '2-Year Medical Diploma'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        {prog.seats !== undefined && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/90 shadow-2xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                <span>{prog.seats} Seats</span>
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                            <Clock className="h-3 w-3 text-[#07294D]" />
                            <span>{prog.duration_years} {prog.duration_years === 1 ? 'Year' : 'Years'}</span>
                        </span>
                    </div>
                </div>

                {(prog.code === 'DIT' || prog.category === 'technical_diploma') && (
                    <div className="mb-4 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-2xs">
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                            <span>100% Free Tuition Program</span>
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                            Only Board & DMC Fee
                        </span>
                    </div>
                )}

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#07294D] transition-colors leading-snug mb-2.5">
                    <Link href={route('programs.show', prog.code)} className="focus:outline-hidden">
                        {prog.name}
                    </Link>
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-5">
                    {prog.description}
                </p>

                {/* Key Metrics Grid (Modular Executive Info Chips) */}
                <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 mb-6 space-y-2">
                    {/* Eligibility */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#07294D]/5 text-[#07294D] shrink-0">
                            <GraduationCap className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Required Eligibility
                            </span>
                            <span className="block text-xs font-bold text-[#07294D] truncate" title={prog.qualification_required}>
                                {prog.qualification_required}
                            </span>
                        </div>
                    </div>

                    {/* Affiliation */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-[#FFB606]/20 text-[#07294D] shrink-0">
                                <Award className="h-4 w-4 text-[#07294D]" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Affiliated Institution
                                </span>
                                <span className="block text-xs font-bold text-slate-800 truncate" title={prog.affiliation}>
                                    {prog.affiliation}
                                </span>
                            </div>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Chartered</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                    href={route('programs.show', prog.code)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#07294D] text-slate-700 hover:text-white font-bold text-xs border border-slate-200 hover:border-[#07294D] transition-all duration-200 shadow-2xs hover:shadow-xs group/btn"
                >
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all" />
                </Link>
                <Link
                    href={route('apply.index', { program: prog.code })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFB606] hover:bg-[#EAA700] text-[#07294D] text-xs font-black transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-[#D49600]/40 group/apply"
                >
                    <span>Apply Now</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#07294D] group-hover/apply:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
