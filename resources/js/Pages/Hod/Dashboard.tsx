import React, { useEffect } from 'react';
import HodLayout from '@/Layouts/HodLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  Sliders,
  Award,
  KeyRound,
  CheckCircle2,
  Clock,
  ArrowRight,
  Users
} from 'lucide-react';

interface Props {
  stats: {
    eligible_candidates: number;
    active_exams: number;
    pending_results: number;
    published_merit_lists: number;
  };
  examinations: any[];
}

export default function HodDashboard({ stats, examinations }: Props) {
  // Real-Time Background Synchronization (Node.js style live polling)
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({
        only: ['stats', 'examinations'],
        preserveScroll: true,
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <HodLayout>
      <Head title="HOD Overview & Examination Controller - BCMT" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-[#07294D] bg-[#07294D]/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Academic & Exam Controller
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-2">
            HOD Examination & Merit Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Oversee entrance exams, live Common Test PINs, per-test questions, and dynamic merit ranking.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/hod/exams"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <KeyRound className="w-4 h-4 text-[#FFB606]" /> Manage Exams & PINs
          </Link>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase mb-2">
            <span>Eligible Candidates</span>
            <Users className="w-5 h-5 text-[#07294D]" />
          </div>
          <div className="text-3xl font-black text-[#07294D]">{stats.eligible_candidates ?? 0}</div>
          <p className="text-[11px] text-stone-500 mt-2">Verified applicants cleared for test</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase mb-2">
            <span>Active Tests</span>
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700">{stats.active_exams}</div>
          <p className="text-[11px] text-stone-500 mt-2">Accepting candidate attempts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase mb-2">
            <span>Pending Evaluation</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600">{stats.pending_results}</div>
          <p className="text-[11px] text-stone-500 mt-2">Attempts awaiting score audit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase mb-2">
            <span>Published Merit</span>
            <Award className="w-5 h-5 text-[#07294D]" />
          </div>
          <div className="text-3xl font-black text-[#07294D]">{stats.published_merit_lists}</div>
          <p className="text-[11px] text-stone-500 mt-2">Cryptographically locked lists</p>
        </div>
      </div>

      {/* Active Examinations & Common PIN Live Board */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 mb-8">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Active Examinations & Common Test PINs</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Argon2id-secured PINs announced in campus exam rooms. Rotating a PIN does not interrupt in-progress tests.
            </p>
          </div>
          <Link
            href="/hod/exams"
            className="text-xs font-bold text-[#07294D] hover:underline flex items-center gap-1"
          >
            Configure Exams <ArrowRight className="w-3.5 h-3.5 text-[#FFB606]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examinations.map((exam) => (
            <div
              key={exam.id}
              className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">
                    {exam.session_program?.program?.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    exam.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {exam.status}
                  </span>
                </div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">{exam.title}</h4>
                <p className="text-xs text-stone-500">
                  {exam.duration_minutes} Mins • {exam.total_questions} Questions ({exam.total_marks} Marks)
                </p>
              </div>

              {/* Common PIN Box */}
              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Current Active PIN</span>
                  <span className="font-mono text-xl font-black text-[#07294D] tracking-widest">
                    {exam.active_pin?.display_pin || 'NO PIN'}
                  </span>
                </div>
                <Link
                  href="/hod/exams"
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-bold transition"
                >
                  Rotate PIN
                </Link>
              </div>
            </div>
          ))}
          {examinations.length === 0 && (
            <div className="col-span-3 text-center py-8 text-stone-500 text-xs">
              No examinations created yet. Click "Manage Exams & PINs" above to setup your first test.
            </div>
          )}
        </div>
      </div>
    </HodLayout>
  );
}

