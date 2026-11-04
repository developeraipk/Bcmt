import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import {
    CheckCircle2,
    MessageCircle,
    Phone,
    ArrowRight,
    LayoutDashboard,
    Download,
    Share2,
    Sparkles,
} from 'lucide-react';

interface Props {
    application: {
        application_number: string;
        student_name: string;
        program_name: string;
        session_name: string;
        submitted_at: string;
    };
    whatsapp: {
        community_enabled: boolean;
        community_url: string;
        support_enabled: boolean;
        support_link: string;
        support_phone: string;
    };
}

function formatDisplayDate(dateStr?: string) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

export default function Success({ application, whatsapp }: Props) {
    return (
        <PublicLayout>
            <Head title="Application Submitted Successfully" />

            <div className="bg-slate-100 py-16">
                <div className="max-w-2xl mx-auto px-4 sm:px-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center">
                        {/* Top Success Badge Banner */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 py-10 px-6 text-white relative">
                            <div className="mx-auto h-16 w-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mb-4 shadow-lg ring-8 ring-white/20">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
                                Congratulations!
                            </h1>
                            <p className="text-emerald-100 text-sm mt-1">
                                Your admission application has been successfully submitted.
                            </p>
                        </div>

                        {/* Application Summary Box */}
                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2.5">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Application Number:</span>
                                    <span className="text-base font-mono font-extrabold text-rose-900 bg-rose-50 px-3 py-1 rounded-md border border-rose-200">
                                        {application.application_number}
                                    </span>
                                </div>

                                <div className="flex justify-between text-xs">
                                    <span className="font-semibold text-slate-500">Applicant Name:</span>
                                    <strong className="text-slate-900">{application.student_name}</strong>
                                </div>

                                <div className="flex justify-between text-xs">
                                    <span className="font-semibold text-slate-500">Program Applied:</span>
                                    <strong className="text-slate-900">{application.program_name}</strong>
                                </div>

                                <div className="flex justify-between text-xs">
                                    <span className="font-semibold text-slate-500">Admission Session:</span>
                                    <span className="text-slate-800 font-medium">{application.session_name}</span>
                                </div>

                                <div className="flex justify-between text-xs">
                                    <span className="font-semibold text-slate-500">Submission Date:</span>
                                    <span className="text-slate-700 font-medium">{formatDisplayDate(application.submitted_at)}</span>
                                </div>
                            </div>

                            {/* WhatsApp Actions */}
                            <div className="space-y-3 pt-2">
                                {whatsapp.community_enabled && (
                                    <a
                                        href={whatsapp.community_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        <span>JOIN OUR WHATSAPP COMMUNITY</span>
                                    </a>
                                )}

                                {whatsapp.support_enabled && (
                                    <a
                                        href={whatsapp.support_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-colors"
                                    >
                                        <Phone className="h-4 w-4 text-emerald-600" />
                                        <span>CONTACT ADMISSION SUPPORT ({whatsapp.support_phone})</span>
                                    </a>
                                )}
                            </div>

                            {/* Go to Dashboard */}
                            <div className="pt-4 border-t border-slate-100">
                                <Link
                                    href={route('student.dashboard')}
                                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#7A1B29] hover:bg-[#5C121D] text-white font-bold text-sm shadow-md transition-colors"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>GO TO STUDENT DASHBOARD</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <p className="text-[11px] text-slate-400 mt-2">
                                    You can track your application verification and download your test roll number slip from your student dashboard.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
