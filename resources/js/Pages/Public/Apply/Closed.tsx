import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, PhoneCall, Calendar, Clock, MessageCircle } from 'lucide-react';

interface Props {
  notice?: string;
  activeSession?: {
    name: string;
    code: string;
    is_expired?: boolean;
    closing_datetime_formatted?: string;
  } | null;
}

export default function Closed({ notice, activeSession }: Props) {
  return (
    <PublicLayout>
      <Head title="Admissions Closed - Bannu College of Medical Technologies" />
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-slate-50/60">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#07294D] via-[#FFB606] to-[#07294D]" />

          <div className="w-16 h-16 bg-[#07294D]/10 text-[#07294D] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#07294D]/20">
            <Clock className="w-8 h-8 text-[#07294D]" />
          </div>

          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
            {activeSession?.is_expired ? 'Application Deadline Ended' : 'Admissions Portal Notice'}
          </span>

          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 mb-3">
            {activeSession?.is_expired ? 'Application Window Closed' : 'Admissions Currently Suspended'}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            {notice || 'The online application portal is currently closed for new submissions. Please stay tuned for upcoming admission sessions or contact the college admission desk for further inquiries.'}
          </p>

          {activeSession?.closing_datetime_formatted && (
            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 mb-6 flex items-center gap-3 text-left">
              <Calendar className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Official Submission Deadline:</span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {activeSession.closing_datetime_formatted}
                </span>
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left mb-8 space-y-2.5 text-xs sm:text-sm text-slate-700">
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-[#07294D] shrink-0" />
              <span><strong className="text-slate-900 font-bold">Admission Desk:</strong> 0928-622699 / 0334-0580180</span>
            </div>
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#07294D] shrink-0" />
              <span><strong className="text-slate-900 font-bold">Email:</strong> bcmts1122@gmail.com</span>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://wa.me/923340580180"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat with Admissions on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl transition font-bold text-xs sm:text-sm shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Home
            </Link>
            <Link
              href="/programs"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 transition font-bold text-xs sm:text-sm border border-slate-200"
            >
              Browse Academic Offerings
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
