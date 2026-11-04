import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, XCircle, ShieldCheck, UserCheck, School, ArrowLeft } from 'lucide-react';
import BcmtBadge from '@/Components/Brand/BcmtBadge';

interface Props {
  isValid: boolean;
  application?: {
    roll_number: string;
    student_name: string;
    father_name: string;
    program_name: string;
    session_code: string;
    eligibility: string;
    attendance: string;
  } | null;
}

export default function VerifySlip({ isValid, application }: Props) {
  return (
    <PublicLayout>
      <Head title="Roll Number Slip Verification - BCMT" />
      <div className="py-16 px-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
          {/* Header */}
          <div className={`p-6 text-white text-center ${isValid ? 'bg-gradient-to-r from-[#041D3C] via-[#07294D] to-[#0A3663] border-b-4 border-[#FFB606]' : 'bg-slate-900 border-b-4 border-rose-500'}`}>
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center bg-white/10 backdrop-blur-sm">
              {isValid ? (
                <ShieldCheck className="w-10 h-10 text-[#FFB606]" />
              ) : (
                <XCircle className="w-10 h-10 text-rose-300" />
              )}
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight">
              {isValid ? 'Official Verification Confirmed' : 'Invalid Verification Record'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 uppercase tracking-wider">
              Bannu College of Medical Technologies — Admit Card Validator
            </p>
          </div>

          <div className="p-8">
            {isValid && application ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <div>
                    <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Assigned Roll Number</span>
                    <div className="text-2xl font-bold font-mono text-[#07294D]">{application.roll_number}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Eligibility</span>
                    <div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {application.eligibility.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                    <span className="text-xs text-stone-500 block mb-0.5">Candidate Full Name</span>
                    <span className="font-semibold text-stone-900">{application.student_name}</span>
                  </div>
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                    <span className="text-xs text-stone-500 block mb-0.5">Father's Name</span>
                    <span className="font-semibold text-stone-900">{application.father_name}</span>
                  </div>
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 sm:col-span-2">
                    <span className="text-xs text-stone-500 block mb-0.5">Program Applied</span>
                    <span className="font-semibold text-[#07294D]">{application.program_name}</span>
                  </div>
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                    <span className="text-xs text-stone-500 block mb-0.5">Academic Session</span>
                    <span className="font-semibold text-stone-800">{application.session_code}</span>
                  </div>
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                    <span className="text-xs text-stone-500 block mb-0.5">Campus Attendance Status</span>
                    <span className="font-semibold capitalize text-stone-800">{application.attendance}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    This roll number slip matches the authentic cryptographic seal and institutional enrollment database of Bannu College of Medical Technologies. The candidate is authorized for the campus examination.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <p className="text-stone-700 leading-relaxed text-sm">
                  The digital verification payload scanned does not correspond to an authentic or active admit card in the BCMT admission database. Please verify the QR code or report to the exam controller.
                </p>
                <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-200 text-xs text-left">
                  <strong>Security Note:</strong> Tampered or forged roll number slips are strictly invalid and subject to institutional disqualification under college examination bylaws.
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-stone-200 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-medium text-sm transition"
              >
                <ArrowLeft className="w-4 h-4" /> BCMT Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
