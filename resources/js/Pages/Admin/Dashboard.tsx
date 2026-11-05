import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
  Users,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Armchair,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Filter,
  BarChart3,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface Props {
  sessions: any[];
  activeSession?: any;
  selectedSessionId: number;
  stats: {
    total_applications: number;
    today_applications: number;
    pending_verification: number;
    verified_applications: number;
    rejected_applications: number;
    eligible_for_test: number;
    tests_completed: number;
    confirmed_admissions: number;
    selected_candidates: number;
    waiting_list_count: number;
    total_seats: number;
    seats_allocated: number;
    remaining_seats: number;
  };
  programAnalytics: Array<{
    program_id: number;
    program_name: string;
    program_code: string;
    total_seats: number;
    occupied_seats: number;
    application_count: number;
  }>;
  genderStats: {
    male: number;
    female: number;
  };
}

export default function AdminDashboard({ sessions, activeSession, selectedSessionId, stats, programAnalytics, genderStats }: Props) {
  const totalGender = (genderStats?.male || 0) + (genderStats?.female || 0);
  const malePercent = totalGender > 0 ? Math.round((genderStats.male / totalGender) * 100) : 0;
  const femalePercent = totalGender > 0 ? Math.round((genderStats.female / totalGender) * 100) : 0;

  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.get('/admin/dashboard', { session_id: e.target.value }, { preserveState: true });
  };

  return (
    <AdminLayout>
      <Head title="Executive Analytics & Operations - BCMT Admin" />

      {/* Top Bar with Session Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1 rounded-full uppercase tracking-wider border border-slate-200 shadow-2xs">
            Institutional Operations Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-2">
            Executive Admission Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time MySQL operational metrics for Bannu College of Medical Technologies.
          </p>
        </div>

        {/* Session Selector */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs shrink-0">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={selectedSessionId || ''}
            onChange={handleSessionChange}
            aria-label="Filter by Admission Session"
            className="text-xs font-semibold text-slate-800 bg-transparent border-0 focus:ring-0 pr-8 cursor-pointer"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Admission Portal Gateway Status Banner */}
      {activeSession && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              activeSession.is_open
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {activeSession.is_open ? <Unlock className="w-5 h-5 text-emerald-600" /> : <Lock className="w-5 h-5 text-rose-600" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Admissions Status:
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  activeSession.is_open
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  {activeSession.is_open ? 'ONLINE & OPEN' : 'CLOSED / SUSPENDED'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeSession.name} ({activeSession.code}) • Deadline:{' '}
                <strong className="text-slate-800 font-mono">{activeSession.closing_datetime_formatted}</strong>{' '}
                <span className="text-slate-400">({activeSession.time_remaining})</span>
              </p>
            </div>
          </div>

          <Link
            href="/admin/sessions"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#07294D] hover:bg-[#041D3C] text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
          >
            <span>Manage Portal &amp; Deadlines</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FFB606]" />
          </Link>
        </div>
      )}

      {/* Primary KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Total Applications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-2">
            <span>Total Inbound Apps</span>
            <Users className="w-5 h-5 text-slate-900" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.total_applications}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{stats.today_applications} received today</span>
          </div>
        </div>

        {/* Card 2: Document Verification Scrutiny */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase mb-2">
            <span>Pending Scrutiny</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600">{stats.pending_verification}</div>
          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium mt-2">
            <span className="text-emerald-700 font-bold">{stats.verified_applications} Verified</span> • 
            <span className="text-rose-700 font-bold">{stats.rejected_applications} Rejected</span>
          </div>
        </div>

        {/* Card 3: Test Readiness */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase mb-2">
            <span>Test Eligible & Roll Nos</span>
            <FileCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-600">{stats.eligible_for_test}</div>
          <div className="text-[11px] text-stone-500 font-medium mt-2">
            <strong>{stats.tests_completed}</strong> tests submitted on campus
          </div>
        </div>

        {/* Card 4: Confirmed Admissions & Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase mb-2">
            <span>Confirmed Admissions</span>
            <Armchair className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-emerald-700">{stats.confirmed_admissions}</div>
          <div className="text-[11px] text-stone-500 font-medium mt-2">
            <strong>{stats.seats_allocated}</strong> of <strong>{stats.total_seats}</strong> seats booked ({stats.remaining_seats} remaining)
          </div>
        </div>
      </div>

      {/* Middle Section: Program Wise Capacity Breakdown + Combined Gender Pool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left 2 Cols: Program Capacity & Application Demand Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Program Admission Matrix</h3>
              <p className="text-xs text-stone-500 mt-0.5">Application demand vs seat allocation per cohort</p>
            </div>
            <BarChart3 className="w-5 h-5 text-stone-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-600 font-semibold uppercase text-[10px]">
                  <th className="p-3 rounded-l-lg">Program</th>
                  <th className="p-3 text-center">Total Seats</th>
                  <th className="p-3 text-center">Applications</th>
                  <th className="p-3 text-center">Occupied</th>
                  <th className="p-3 rounded-r-lg text-center">Seat Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {programAnalytics.map((pa) => {
                  const utilPercent = pa.total_seats > 0 ? Math.round((pa.occupied_seats / pa.total_seats) * 100) : 0;
                  return (
                    <tr key={pa.program_id} className="hover:bg-stone-50/50 transition">
                      <td className="p-3">
                        <span className="font-bold text-stone-900 block">{pa.program_name}</span>
                        <span className="text-[11px] font-mono text-stone-400">{pa.program_code}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-stone-800">{pa.total_seats}</td>
                      <td className="p-3 text-center font-bold text-slate-900">{pa.application_count}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">{pa.occupied_seats}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                            <div
                              className="bg-slate-900 h-2 rounded-full"
                              style={{ width: `${Math.min(100, utilPercent)}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-[11px] text-stone-700">{utilPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Combined Gender Pool Ratio & Seat State Machine */}
        <div className="space-y-6">
          {/* Combined Gender Ranking Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <h3 className="font-bold text-stone-900 text-base mb-1">Gender Demographic Pool</h3>
            <p className="text-xs text-stone-500 mb-4">
              Single combined merit pool (no segregated gender quotas)
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-blue-800">Male Applicants: {genderStats?.male || 0}</span>
                  <span className="text-blue-800 font-mono">{malePercent}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${malePercent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-800">Female Applicants: {genderStats?.female || 0}</span>
                  <span className="text-rose-800 font-mono">{femalePercent}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-rose-600 h-2.5 rounded-full" style={{ width: `${femalePercent}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 text-[11px] text-stone-500">
              Male and female candidates compete in a unified institutional merit ranking strictly based on academic weightages and test scores.
            </div>
          </div>

          {/* Seat State Machine Legend */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 text-xs">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-3">
              Seat State Lifecycle
            </h4>
            <div className="space-y-2 text-[11px] text-stone-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span><strong>Reserved:</strong> Candidate offered admission with reservation expiry.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <span><strong>Confirmed:</strong> Fee verified, seat finalized (1..N sequence locked).</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span><strong>Released:</strong> Expired or declined seat returned; next waiting promoted.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

