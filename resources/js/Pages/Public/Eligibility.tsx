import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { CheckCircle2, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

export default function Eligibility() {
    return (
        <PublicLayout>
            <Head title="Eligibility Criteria - Bannu College of Medical Technologies" />

            {/* Professional Eikra Deep Academic Navy Jumbotron */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#041D3C] via-[#07294D] to-[#0A3663] text-white py-12 lg:py-16 shadow-md border-b-4 border-[#FFB606]">
                {/* Subtle Geometric Mesh & Gold Ambient Glow */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
                <div className="absolute -top-10 right-10 w-96 h-96 bg-[radial-gradient(ellipse,rgba(255,182,6,0.18),transparent_65%)] pointer-events-none blur-3xl"></div>
                <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[radial-gradient(ellipse,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none blur-2xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFB606] bg-white/10 px-3.5 py-1.5 rounded-full border border-[#FFB606]/35 backdrop-blur-md shadow-xs">
                        Official Academic Policy
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black mt-3.5 text-white tracking-tight leading-tight">
                        Admission Eligibility Criteria
                    </h1>
                    <p className="text-sm sm:text-base text-slate-200 mt-2.5 max-w-2xl leading-relaxed font-normal">
                        Minimum educational qualifications and guidelines for entry into BCMT degree and diploma programs.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
                {/* BS Degree Programs Policy */}
                <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                            <GraduationCap className="h-6 w-6" />
                        </span>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">1. BS Degree Programs (4 Years)</h2>
                            <p className="text-xs text-slate-600 font-medium">BS Emergency Care Technology (ECT) & BS MLT</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-xs text-slate-700 leading-relaxed pt-2 border-t border-slate-100">
                        <p className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Minimum Educational Requirement:</strong> Intermediate / HSSC Pass certificate from any recognized Board of Intermediate and Secondary Education (BISE).</span>
                        </p>
                        <p className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Institutional Affiliation:</strong> Affiliated with Khyber Medical University (KMU).</span>
                        </p>
                        <p className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Entry Test Requirement:</strong> Must appear in the on-campus computerized admission test.</span>
                        </p>
                        <p className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Gender Policy:</strong> Male and female candidates compete together for combined program seats.</span>
                        </p>
                    </div>
                </div>

                {/* 2-Year Diplomas Policy */}
                <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-[#07294D]/10 text-[#07294D] border border-[#07294D]/20">
                            <GraduationCap className="h-6 w-6" />
                        </span>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">2. 2-Year Diploma Programs</h2>
                            <p className="text-xs text-[#07294D] font-bold">Pharmacy Category B & KPK Medical Faculty Diplomas</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-xs text-slate-700 leading-relaxed pt-2 border-t border-slate-100">
                        <p className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Minimum Educational Requirement:</strong> Matriculation / SSC Pass certificate from any recognized BISE.</span>
                        </p>
                        <p className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Pharmacy Category B:</strong> Accredited by Pharmacy Council of Pakistan. Matric Pass candidates (male and female) are eligible with no arbitrary age limits.</span>
                        </p>
                        <p className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Medical Technology Diplomas:</strong> Health, Pathology, Surgical, Anaesthesia, Pharmacy Technician, and Radiology affiliated with KPK Medical Faculty. Minimum Matric Pass required.</span>
                        </p>
                    </div>
                </div>

                <div className="text-center pt-4">
                    <Link
                        href={route('apply.index')}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FFB606] hover:bg-[#EAA700] text-[#07294D] font-black text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-[#D49600]/40"
                    >
                        <span>Apply Online for Current Session</span>
                        <ArrowRight className="h-4 w-4 text-[#07294D]" />
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}
