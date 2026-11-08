import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import {
    Clock,
    GraduationCap,
    Award,
    Users,
    ArrowRight,
    CheckCircle2,
    Calendar,
    BookOpen,
} from 'lucide-react';

interface Props {
    program: any;
    sessionProgram: any;
}

export default function Show({ program, sessionProgram }: Props) {
    return (
        <PublicLayout>
            <Head title={`${program.name} - Program Overview`} />

            {/* Professional Eikra Deep Academic Navy Jumbotron */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#041D3C] via-[#07294D] to-[#0A3663] text-white py-12 lg:py-16 shadow-md border-b-4 border-[#FFB606]">
                {/* Subtle Geometric Mesh & Gold Ambient Glow */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
                <div className="absolute -top-10 right-10 w-96 h-96 bg-[radial-gradient(ellipse,rgba(255,182,6,0.18),transparent_65%)] pointer-events-none blur-3xl"></div>
                <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[radial-gradient(ellipse,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none blur-2xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center gap-2.5 mb-3.5">
                        <span className="text-xs font-mono font-bold text-[#FFB606] bg-white/10 px-3 py-1 rounded-lg border border-[#FFB606]/35 backdrop-blur-md shadow-xs">
                            {program.code}
                        </span>
                        <span className="text-xs text-slate-200 font-bold uppercase tracking-wider capitalize bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                            {program.category.replace('_', ' ')}
                        </span>
                    </div>
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                        {program.name}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-200 mt-2.5 max-w-2xl leading-relaxed font-normal">
                        {program.description}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Overview & Curriculum Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {(program.code === 'DIT' || program.category === 'technical_diploma') && (
                            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-600 text-white uppercase tracking-wider">
                                        100% Free Tuition Program
                                    </span>
                                    <span className="text-xs font-bold text-slate-700">KP-BTE Peshawar Registered</span>
                                </div>
                                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                                    Zero Tuition & Free Academic Charges
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Bannu College of Medical Technologies offers this 1-Year Diploma in Information Technology completely tuition-free. Students do not pay any college tuition or periodic recharge fees. Candidates only pay mandatory Board Registration and DMC verification charges directly to Khyber Pakhtunkhwa Board of Technical Education (KP-BTE).
                                </p>
                            </div>
                        )}

                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                            <h2 className="text-xl font-bold text-slate-900">Program Specifications</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-slate-500 font-medium block">Total Duration:</span>
                                    <strong className="text-base text-slate-900">{program.duration_years} Academic {program.duration_years === 1 ? 'Year' : 'Years'}</strong>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-slate-500 font-medium block">Session Quota:</span>
                                    <strong className="text-base text-slate-900">{sessionProgram?.total_seats ?? 'Configured per session'} Seats</strong>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-slate-500 font-medium block">Minimum Qualification:</span>
                                    <strong className="text-base text-slate-900">{program.qualification_required}</strong>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-slate-500 font-medium block">Institutional Affiliation:</span>
                                    <strong className="text-sm text-slate-900">{program.affiliation}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Admissions & Entry Test Guidelines */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                            <h3 className="text-lg font-bold text-slate-900">Admission & Examination Procedure</h3>
                            <ul className="space-y-2 text-xs text-slate-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Applicants must submit their online form along with DMC records and CNIC/B-Form copy.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>College verifiers review uploaded credentials and issue a verified Roll Number Slip.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>The computer-based entry examination is held at the BCMT Bannu campus.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>All candidates enter the program Common PIN announced by the exam invigilator.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right: Action Card */}
                    <div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-28 space-y-5">
                            <h3 className="text-base font-bold text-slate-900">Apply for this Program</h3>
                            <div className="text-xs text-slate-600 space-y-2">
                                <p>Ensure you meet the minimum eligibility: <strong>{program.qualification_required}</strong>.</p>
                                <p className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                    Male and female candidates compete together for the combined program capacity.
                                </p>
                            </div>

                            <Link
                                href={route('apply.index', { program: program.code })}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FFB606] hover:bg-[#EAA700] text-[#07294D] font-black text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-[#D49600]/40"
                            >
                                <span>Proceed to Application</span>
                                <ArrowRight className="h-4 w-4 text-[#07294D]" />
                            </Link>

                            <Link
                                href={route('programs.index')}
                                className="w-full block text-center text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
                            >
                                Browse other programs
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
