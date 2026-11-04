import React, { useState, useEffect } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import {
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  HelpCircle,
  PlayCircle,
  Radio,
} from 'lucide-react';

interface Props {
  application: any;
  examination: any;
  attendance: {
    status: string;
    room_number: string;
    seat_number: string;
  } | null;
  hasActiveAttempt: boolean;
}

export default function Gate({ application, examination, attendance, hasActiveAttempt }: Props) {
  // Real-Time Background Synchronization (No page refresh needed when invigilator marks attendance or exam goes live)
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({
        only: ['examination', 'attendance', 'hasActiveAttempt', 'application'],
        preserveScroll: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const { data, setData, post, processing, errors } = useForm({
    examination_id: examination?.id || '',
    pin: '',
  });

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    post('/student/exam/verify-pin');
  };

  const isAttendancePresent = attendance?.status === 'present';

  return (
    <StudentLayout>
      <Head title="Examination Gate & PIN Verification - BCMT" />

      <div className="max-w-3xl mx-auto py-6">
        {/* Top Breadcrumb & Status */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Admission Test Protocol
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 mt-2">
              Campus Examination Access Gate
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-500 block">Candidate Roll Number</span>
            <span className="text-lg font-mono font-bold text-[#07294D]">
              {application.roll_number || 'Pending'}
            </span>
          </div>
        </div>

        {/* In-Progress Attempt Alert */}
        {hasActiveAttempt && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 mb-8 flex items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-700" /> In-Progress Examination Detected
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                You already have an active test session running on the server clock. You can resume your test immediately.
              </p>
            </div>
            <Link
              href="/student/exam/active"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <PlayCircle className="w-4 h-4" /> Resume Test
            </Link>
          </div>
        )}

        {/* Test Overview Card */}
        {examination ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Assigned Examination</span>
                <h2 className="text-lg font-bold text-[#07294D]">{examination.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-stone-100 text-stone-800 text-xs font-semibold rounded-lg">
                  {examination.duration_minutes} Minutes
                </span>
                <span className="px-3 py-1 bg-stone-100 text-stone-800 text-xs font-semibold rounded-lg">
                  {examination.total_questions} Questions ({examination.total_marks} Marks)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block">Passing Criteria</span>
                <span className="font-bold text-stone-900 text-sm">
                  {examination.passing_percentage
                    ? `${examination.passing_percentage}%`
                    : examination.total_marks > 0 && examination.passing_marks
                    ? `${Math.round((examination.passing_marks / examination.total_marks) * 100)}%`
                    : '50%'}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block">Negative Marking</span>
                <span className="font-bold text-stone-900">
                  {examination.negative_marks_per_wrong > 0 ? `-${examination.negative_marks_per_wrong} per wrong` : 'None'}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block">Invigilator Attendance</span>
                <span className="font-bold text-stone-900">
                  {examination.requires_attendance ? 'Mandatory' : 'Optional'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center mb-8">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <h3 className="font-bold text-stone-800">No Examination Scheduled</h3>
            <p className="text-xs text-stone-500 mt-1">
              There is currently no published examination associated with your registered program.
            </p>
          </div>
        )}

        {/* Two-Phase Security Step 1: Campus Invigilator Attendance Check */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 mb-8">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#800000] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-stone-900">Physical Campus Attendance</h3>
            </div>
            <div>
              {isAttendancePresent ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED PRESENT
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 text-xs font-semibold rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5" /> PENDING INVIGILATOR
                </span>
              )}
            </div>
          </div>

          {isAttendancePresent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <p className="font-bold">Verified by Room Invigilator</p>
                <p className="mt-0.5">
                  Assigned Hall: <strong>Room {attendance.room_number}</strong> • Seat: <strong>{attendance.seat_number || 'Open'}</strong>
                </p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Physical Invigilator Verification Required</p>
                <p className="mt-1 leading-relaxed">
                  Before entering the Common Test PIN, please present your printed <strong>Roll Number Slip</strong> and original <strong>CNIC / B-Form</strong> to the invigilator stationed in your examination room to mark your physical presence.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Two-Phase Security Step 2: Common Test PIN Entry */}
        <div className={`bg-white rounded-2xl border border-stone-200 shadow-xs p-6 ${
          !isAttendancePresent ? 'opacity-60 pointer-events-none' : ''
        }`}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <span className="w-6 h-6 rounded-full bg-[#07294D] text-[#FFB606] text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-sm font-bold text-stone-900">Enter Common Examination PIN</h3>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Common Test PIN (Announced in Exam Room)
              </label>
              <div className="relative max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={10}
                  disabled={!isAttendancePresent || processing}
                  value={data.pin}
                  onChange={(e) => setData('pin', e.target.value.toUpperCase())}
                  placeholder="e.g. 849201"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl font-mono text-lg font-bold tracking-widest text-[#07294D] uppercase placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#07294D]"
                />
              </div>
              {errors.pin && <p className="text-rose-600 text-xs mt-1.5">{errors.pin}</p>}
              <p className="text-[11px] text-stone-500 mt-2">
                The common test PIN is announced by the Chief Invigilator inside the examination room at the exact scheduled test start time.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!isAttendancePresent || processing || !data.pin}
                className="flex items-center justify-center gap-2 py-3 px-6 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl font-semibold text-sm transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                {processing ? 'Verifying PIN...' : 'Verify PIN & Enter Waiting Room'}
                <ArrowRight className="w-4 h-4 text-[#FFB606]" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </StudentLayout>
  );
}
