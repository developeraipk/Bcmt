import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { ArrowRight, CheckCircle2, Shield, Laptop, Award, Armchair } from 'lucide-react';

export default function AdmissionProcess() {
    return (
        <PublicLayout>
            <Head title="Admission Process & Examination Guidelines" />

            {/* Professional Eikra Deep Academic Navy Jumbotron */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#041D3C] via-[#07294D] to-[#0A3663] text-white py-12 lg:py-16 shadow-md border-b-4 border-[#FFB606]">
                {/* Subtle Geometric Mesh & Gold Ambient Glow */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
                <div className="absolute -top-10 right-10 w-96 h-96 bg-[radial-gradient(ellipse,rgba(255,182,6,0.18),transparent_65%)] pointer-events-none blur-3xl"></div>
                <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[radial-gradient(ellipse,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none blur-2xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFB606] bg-white/10 px-3.5 py-1.5 rounded-full border border-[#FFB606]/35 backdrop-blur-md shadow-xs">
                        Step-by-Step Guide
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black mt-3.5 text-white tracking-tight leading-tight">
                        How College Admission Works
                    </h1>
                    <p className="text-sm sm:text-base text-slate-200 mt-2.5 max-w-2xl leading-relaxed font-normal">
                        A structured walkthrough from online application submission to campus exam and final seat confirmation.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
                {[
                    {
                        step: 'Step 1',
                        title: 'Online Application Submission',
                        desc: 'Complete the 5-step application wizard with your personal details, academic marks (Matric and Intermediate for BS), and upload private documents (photos, CNIC, and DMCs). Note: You may submit only one application per admission session.',
                        icon: Laptop,
                    },
                    {
                        step: 'Step 2',
                        title: 'Institutional Document Verification',
                        desc: 'BCMT admission verifiers examine your uploaded credentials. If any correction is required, you will receive a notification and a re-upload link in your student dashboard. Verified applicants are marked eligible for the test.',
                        icon: Shield,
                    },
                    {
                        step: 'Step 3',
                        title: 'Roll Number Slip & Common PIN',
                        desc: 'Download your official A4 Roll Number Slip containing a verification QR code and campus test instructions. Each program examination uses one common test PIN issued on exam day.',
                        icon: CheckCircle2,
                    },
                    {
                        step: 'Step 4',
                        title: 'Campus Computerized Admission Test',
                        desc: 'Report to the college campus. The room invigilator verifies your physical attendance. Enter the announced Common PIN to unlock your test. Answers auto-save and the timer is strictly server-authoritative.',
                        icon: Laptop,
                    },
                    {
                        step: 'Step 5',
                        title: 'Combined Merit Ranking & Seat Allocation',
                        desc: 'Male and female applicants are ranked in a single combined merit list based on configured academic weightages. Top candidates receive time-limited seat reservations, which transition to confirmed status upon fee verification.',
                        icon: Armchair,
                    },
                ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div key={idx} className="flex gap-5 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                                <Icon className="h-6 w-6 text-slate-800" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.step}</span>
                                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    );
                })}

                <div className="text-center pt-6">
                    <Link
                        href={route('apply.index')}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FFB606] hover:bg-[#EAA700] text-[#07294D] font-black text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-[#D49600]/40"
                    >
                        <span>Start Application Now</span>
                        <ArrowRight className="h-4 w-4 text-[#07294D]" />
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}
